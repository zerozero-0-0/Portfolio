# Cloudflare → self-host 移行プラン

作成日: 2026-10-18

## ゴール

1. ホスティングを Cloudflare Workers から self-host サーバーへ移す
2. あわせてフレームワークとツールチェーンを更新する
3. 移行中も本番 (portfolio.zrzr.workers.dev) は止めず、問題があれば切り戻せるようにする

## 結論

| 項目 | 現在 | 移行後 (推奨) |
| --- | --- | --- |
| フレームワーク | Vite + React Router 7 (SPA) + Hono Worker | **TanStack Start** (React, 記事系はプリレンダー + トップは SSR) |
| ルーティング | `createBrowserRouter` | TanStack Router (ファイルベース, Start に同梱) |
| API | Hono on Workers | Start の server functions / server routes |
| ランタイム | Cloudflare Workers | **Node.js 24 LTS** (Nitro の node-server 出力) |
| キャッシュ | Workers KV (`LANG_STATS`) | プロセス内キャッシュ + SQLite (`node:sqlite`) |
| AtCoder 定期取得 | GitHub Actions → CF KV API | サーバー内の定期ジョブ |
| OGP 書き換え | `HTMLRewriter` (CF 専用) | ルートごとの `head()` で SSR 時に出力 |
| 配信 | Workers Assets | Docker コンテナ + Cloudflare Tunnel (`cloudflared`) |
| デプロイ | `wrangler deploy` | GitHub Actions → Cloudflare Access 経由の SSH → docker compose |
| ビルド | Vite 7 | Vite 8 (Rolldown) |
| その他 | Biome 2.2 / Panda 1.3 / TS 5.8 | Biome 2.5 / Panda 2.x / TS 5.9 か 7.0 |

**Void は今回は採用しない。** 理由は次の「Void の評価」に書く。

## Void の評価

Void は Cloudflare と VoidZero が 2026-10-15 にオープンソース化した、Vite ベースのフルスタック SDK、CLI、プラットフォームのセット。

採用しない理由:

- **Cloudflare 前提のツール。** `void deploy` のデプロイ先は Workers。`void/db` は D1、`void/kv` は KV、`void/storage` は R2 につながる。「Cloudflare から離れる」という今回の目的と逆方向になる。
- **「self-host」の意味が違う。** self-host できるのはチーム向けのデプロイ基盤 (Void Platform) のほうで、それも Workers for Platforms (有料)、R2、PostgreSQL を必要とする。アプリを自宅サーバーで動かすという意味ではない。
- **Node / Bun 向けのスタンドアロン出力はあるが、D1 / KV / R2 などのバインディングが使えない。** そうなると残る機能 (ファイルベースルーティング、Hono、loader) は TanStack Start + Hono で揃う。
- **リリース直後。** npm の `void` は 10/15 に 1.0.3 が出て、同じ日のうちに 1.1.11 まで進んでいる。まだ安定していない。

Void の思想 (Hono ベースの型付き API、import からのリソース推論) は面白いので、Cloudflare 上に別のプロジェクトを作るときには候補になる。

## TanStack Start を選ぶ理由

このポートフォリオでいちばん手間がかかっているのは「SPA なのにクローラーに記事ごとの OGP を見せる」部分 (`worker/index.ts` の `notFound` と `worker/lib/ogp.ts`)。SSR できるフレームワークに移ればこの処理はまるごと不要になる。

- ルートごとに `head()` で title / description / og:* を返せば、SSR の HTML に最初から入る
- `loader` で記事データを取得できるので、`/api/article` を fetch してから描画する現在の流れが消え、初期表示も速くなる
- server functions で GitHub / AtCoder の取得処理を書けば、型がクライアントまでつながる
- Nitro 経由で `node .output/server/index.mjs` として動かせるので Docker 化しやすい
- ページ単位でプリレンダーと SSR を選べる

**代案:** SSR が要らないなら「TanStack Router (SPA) + Hono on Node (`@hono/node-server`)」でもよい。ただし OGP のために index.html を書き換える処理を Node 向けに作り直す必要があり、今の手間がそのまま残る。

## Cloudflare 依存の棚卸し

移行で置き換えが必要なもの:

| 依存 | 場所 | 置き換え |
| --- | --- | --- |
| `ASSETS` バインディング / SPA フォールバック / `run_worker_first` | `wrangler.jsonc` | Start の SSR がすべてのパスを処理する |
| `HTMLRewriter` | `worker/lib/ogp.ts` | ルートの `head()`。`summarize()` は流用する |
| Workers KV `LANG_STATS` | `worker/utils/cache.ts`, `worker/services/atcoder.ts` | `Cache` インターフェースを切り出し、SQLite 実装に差し替える |
| `executionCtx.waitUntil` | `worker/utils/cache.ts` | Node では await するか、投げっぱなしの Promise にする |
| `Env` 型 / `wrangler types` | `worker-configuration.d.ts`, `worker/env.d.ts` | `process.env` を zod などで検証する `env.ts` に置き換える |
| `.dev.vars` | ルート | `.env` (`.env.example` を用意) |
| GitHub Actions から CF KV に書き込み | `.github/workflows/atcoder-rate.yml`, `.github/scripts/update-atcoder-rate.mjs` | サーバー内の定期ジョブで AtCoder の `history/json` を直接取得する |
| `pnpm sync:atcoder` | `scripts/sync-atcoder-rate.mjs` | 不要 (ローカルでも直接取得できる) |
| `@cloudflare/vite-plugin`, `wrangler` | `package.json`, `vite.config.ts` | `@tanstack/react-start` + `nitro` の Vite プラグイン |

そのまま使えるもの:

- `content/blog/*.md` と `worker/lib/generate-blog.ts` の Markdown → HTML 変換 (Node で動いているのでそのまま使える)
- `worker/services/github.ts` の言語集計ロジック (fetch を注入する形なので移植しやすい)
- `src/components/*` の UI と Panda CSS のスタイル
- `vite.config.ts` の `blogLivePreview` プラグイン (Start も Vite なので、HMR イベント方式は基本そのまま使える)

## フェーズ

各フェーズは独立した PR にする。フェーズ 3 までは Cloudflare 上の本番がそのまま動き続ける。

### フェーズ 0: 前提 (決定済み)

- サーバー: x86_64、Docker 利用可 (未インストール)
- 公開方法: Cloudflare Tunnel。ポートは開けず、`cloudflared` から Cloudflare へ外向きに接続する
- ドメイン: 決定済み。DNS は Cloudflare で管理しているので、そのまま Tunnel の公開ホスト名に使える
- レンダリング: 記事系はプリレンダー、トップだけ SSR (下の「レンダリング方針」)
- 監視: 今は `observability.enabled` に頼っている。代わりに `docker compose logs` と `/healthz` を使う。外形監視 (UptimeRobot など) を入れるかは後で決める

### レンダリング方針

ページごとに分ける。

| ページ | 方式 | 理由 |
| --- | --- | --- |
| `/blog`, `/blog/$identifier` | プリレンダー | 内容は Markdown からビルド時に決まり、変わるのはデプロイのときだけ。HTML に OGP が最初から入る |
| `/access` | プリレンダー | 静的なページ |
| `/` | SSR | GitHub の言語集計と AtCoder レートは日単位で変わる。SQLite のキャッシュから読むので SSR でも速い。HTML に数値が入った状態で返せる (グラフの描画は Chart.js なのでクライアント側) |

全部 SSR にしなかった理由:
- 記事を毎リクエストで描画しても得るものがない
- プリレンダーした HTML は Cloudflare のエッジでキャッシュさせやすく、自宅サーバーへの負荷と応答時間を減らせる
- 将来サーバーが落ちたときの退避先として、静的 HTML だけ別の場所に置く選択肢が残る

全部プリレンダーにしなかった理由:
- トップの数値を最新に保つには毎日ビルドし直すか、結局クライアントから API を叩くことになり、読み込み中の表示が残る

### フェーズ 1: 今のコードのままツールチェーンを更新

フレームワークを変える前に、壊れやすい依存更新だけ先に済ませる。

1. Vite 7 → 8 (Rolldown)。`@vitejs/plugin-react-swc` の対応状況も確認
2. Biome 2.2.4 → 2.5.x (`biome migrate` を実行し、CI の `version` も合わせる)
3. Panda CSS 1.3 → 2.x。メジャー更新なので CHANGELOG を見て `styled-system` を再生成し、見た目を確認する
4. React 19.1 → 最新の 19.x、型定義
5. TypeScript: 5.8 → 5.9 を先に入れる。TS 7 (ネイティブ版) はエディタや周辺ツールの対応を見てから判断する
6. `jsdom@25` と `@types/jsdom@27` のバージョンずれを直す

完了条件: `pnpm build` と `biome ci` が通り、Cloudflare 上の本番の見た目が変わらない。

### フェーズ 2: サーバー側の受け皿を用意

アプリ移行と並行して進められる。

1. サーバーに Docker Engine と Compose プラグインを入れる (公式の apt リポジトリから)
2. デプロイ専用ユーザー `deploy` を作り、`docker` グループに入れる (詳細は「デプロイの仕組み」の「SSH 鍵でできることを制限する」)
3. `cloudflared` をホストに apt で入れ、systemd サービスとして動かす。Tunnel はダッシュボード (Zero Trust → Networks → Tunnels) で作る
   - 公開ホスト名 `staging.<domain>` → `http://localhost:3000`
   - 公開ホスト名 `ssh.<domain>` → `ssh://localhost:22`
   - cloudflared をコンテナではなくホストで動かすのは、SSH (ホストの 22 番) とアプリの両方に `localhost` で届くから。コンテナに入れると、ホスト側の SSH に届かせるためにネットワーク設定が増える
4. Cloudflare Access で `ssh.<domain>` のアプリケーションを作る。ポリシーは「Service Auth: GitHub Actions 用の Service Token のみ」にする
5. 仮のアプリ (Hello World の Node サーバー) を Docker イメージにする。`/healthz` で `{ "version": "<commit sha>" }` を返す
6. `/opt/portfolio/compose.yaml` を書く。アプリはホストの `127.0.0.1` だけに公開する (外部の端末からは届かない)
   ```yaml
   services:
     app:
       image: ghcr.io/zerozero-0-0/portfolio:${IMAGE_TAG}
       env_file: .env
       ports: ["127.0.0.1:3000:3000"]
       volumes: [data:/app/data]   # SQLite のキャッシュ
       healthcheck:
         test: ["CMD", "node", "-e", "fetch('http://localhost:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
         interval: 10s
         retries: 3
       restart: unless-stopped
   volumes:
     data:
   ```
7. `/opt/portfolio/deploy.sh` (サーバー側のデプロイ処理) と GitHub Actions のワークフローを書く。中身は「デプロイの仕組み」
8. GitHub の Environment `production` を作り、Secrets (`CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`) をそこに入れる

完了条件: `main` に push すると staging が自動で更新される。

### フェーズ 3: TanStack Start へ移行

ブランチ `feat/tanstack-start` で作業する。

1. **土台:** `@tanstack/react-start`, `@tanstack/react-router`, `nitro` を入れ、`vite.config.ts` を `tanstackStart()` + `nitro()` + `blogLivePreview()` にする。Panda の PostCSS はそのまま使う
2. **ルーティング:** `src/routes.tsx` をファイルベースに分ける
   - `__root.tsx` ← `AppLayout` + `ErrorBoundary` + 共通の `head()` (現在の `index.html` の meta)
   - `index.tsx` ← `pages/home.tsx`
   - `access.tsx`, `blog/index.tsx`, `blog/$identifier.tsx`
3. **記事:** `blog/$identifier.tsx` の `loader` で `getPostByIdentifier` を呼び、`head()` で `buildArticleMeta` の結果を返す。見つからなければ `notFound()` にする。`/api/article*` と `ogp.ts` の `rewritePageMeta` は削除。dev の HMR は loader の再実行 (`router.invalidate()`) に置き換えると簡単になる
4. **GitHub / AtCoder:** server functions (`createServerFn`) にする。キャッシュは `Cache` インターフェース (`get` / `set` with TTL) を作り、SQLite で実装する。DB ファイルは Docker volume に置く
5. **AtCoder の定期取得:** Nitro の scheduled tasks か、起動時に登録する `setInterval` で 1 日 1 回取得する。取得に失敗したら前回の値を返す (現在の「14 日以内なら有効」というルールは維持)
6. **環境変数:** `GITHUB_USERNAME`, `LANG_USAGE_TOKEN`, `ATCODER_USERNAME` を `.env` で渡す。同一オリジンになるので CORS と `ALLOWED_ORIGINS` は外部から叩く用途がなければ削除する
7. **プリレンダー:** 「レンダリング方針」のとおり、`/access`, `/blog`, `/blog/*` をビルド時に出力し、`/` は SSR にする。プリレンダーした HTML には `Cache-Control` を付け、Cloudflare のエッジでキャッシュさせる
8. **掃除:** `wrangler.jsonc`, `worker-configuration.d.ts`, `tsconfig.worker.json`, `.wrangler/`, `.dev.vars*`, `@cloudflare/vite-plugin`, `wrangler` を削除。`worker/` は `src/server/` に寄せる

完了条件:
- staging で全ページが表示され、ブラウザの戻る / 進むも正常に動く
- `curl -A Twitterbot https://staging.<domain>/blog/<id>` の HTML に記事ごとの title / og:* が入っている
- 存在しない記事が 404 になる (今は index.html が返る)
- dev で Markdown を保存するとリロードなしで反映される

### フェーズ 4: 切り替えと後片付け

1. Tunnel の公開ホスト名に本番ドメインを追加する。`portfolio.zrzr.workers.dev` は 301 で新ドメインへ飛ばす小さな Worker に差し替える (しばらく残す)
2. X / Discord のカードを実際に確認する
3. 1〜2 週間問題がなければ以下を削除する
   - `.github/workflows/atcoder-rate.yml` と GitHub Secrets の `CLOUDFLARE_*`
   - Cloudflare の KV namespace と旧 Worker
4. README の技術スタックとデプロイ手順を更新する

切り戻し: 旧 Worker は削除するまでそのまま動く。本番ドメインを旧 Worker のカスタムドメインに戻せば元の状態になる。

## デプロイの仕組み

GitHub Actions から Cloudflare Access 経由でサーバーに SSH し、docker compose で入れ替える。そのうえで以下の 5 つを足す。

### 全体の流れ

```
git push main
 │
 ▼
[Actions: check]   biome ci / 型チェック / ビルド             … ① 通らなければデプロイしない
 │
 ▼
[Actions: image]   docker build → ghcr.io/…/portfolio:sha-<commit> を push   … ② コミットごとのタグ
 │
 ▼
[Actions: deploy]  environment: production / concurrency: production   … ⑤ 履歴と同時実行の防止
 │  cloudflared access ssh で ssh.<domain> に接続 (Service Token + SSH 鍵)
 │  ssh deploy@ssh.<domain> sha-<commit>
 ▼
[サーバー: deploy.sh]  (SSH 鍵に紐づけた強制コマンド)        … ③ この鍵ではこれしか実行できない
 │  1. 引数が sha-xxxx の形か検証
 │  2. 今のタグを .env から控える
 │  3. IMAGE_TAG を書き換え、docker compose pull && up -d
 │  4. localhost:3000/healthz の version が新しい sha になるまで待つ    … ④ 新しい版が動いていることを確認
 │  5. 失敗したら控えたタグに戻して up -d、exit 1
 ▼
[Actions: verify]  https://<domain>/healthz を Tunnel 越しに確認 (外から見て動いているか)
```

### 足すもの

**① テストが通ったものだけデプロイする**
`deploy` ジョブに `needs: [check, image]` を付ける。Biome やビルドが失敗したコミットは本番に出ない。

**② `latest` ではなくコミットごとのタグを使う**
`latest` は「今どれを指しているか」が時間で変わるので、何が動いているか分からなくなる。`sha-<commit>` を使えば、本番で動いている版とコミットが 1 対 1 で対応し、ロールバックはタグを戻すだけで済む。

**③ SSH 鍵でできることを制限する**
サーバーの `~deploy/.ssh/authorized_keys` に、鍵ごとに実行できるコマンドを固定する設定 (forced command) を書く。

```
command="/opt/portfolio/deploy.sh",no-pty,no-port-forwarding,no-agent-forwarding,no-X11-forwarding ssh-ed25519 AAAA... github-actions
```

- この鍵で SSH すると、何を要求しても `deploy.sh` しか起動しない。要求したコマンドは環境変数 `SSH_ORIGINAL_COMMAND` に入るので、`deploy.sh` が `^sha-[0-9a-f]{40}$` に合うかを検証して、合わなければ拒否する
- `docker` グループに入っているユーザーは実質 root と同じ権限を持つ。そのため鍵が漏れたときの被害を「GHCR にある自分のイメージのどれかに切り替えられる」までに抑える意味が大きい
- さらに手前で Cloudflare Access の Service Token がないと `ssh.<domain>` にたどり着けないので、鍵が漏れただけでは接続できない

**④ 新しい版が動いていることを確かめ、だめなら自動で戻す**
- `/healthz` は「200 を返す」だけでなく、ビルド時に埋め込んだコミット sha を返す。これで「古いコンテナがまだ応答しているだけ」を成功と勘違いしない
- 戻す処理はサーバー側の `deploy.sh` に置く。Actions 側に置くと、途中で SSH が切れたときに中途半端な状態が残るため
- Actions の最後でも公開 URL を確認し、Tunnel を含めた経路全体が動いているかを見る

**⑤ GitHub の Environment と concurrency**
- `environment: production` にすると、リポジトリの画面に「いつ、どのコミットが本番に出たか」の履歴が残る。Secrets も production 環境のジョブからしか読めなくなる
- `concurrency: production` で、連続して push してもデプロイが並行して走らないようにする

### ロールバック

- 自動: ④ のとおり、ヘルスチェックに失敗すると `deploy.sh` が前のタグに戻す
- 手動: Actions の `workflow_dispatch` に `tag` 入力を用意し、過去の `sha-xxxx` を指定して再実行する

### 弱点

- 入れ替えの数秒間は 502 になる。今回は許容し、対応は後回しにする。対応するときの候補:
  - Caddy を前に置き、blue / green の 2 コンテナを切り替える。forced command を維持できる
  - Caddy のリトライで、入れ替え中のリクエストを数秒待たせる (エラーにはならない)
  - Kamal に移行する。無停止になるが、Kamal は SSH で任意の docker コマンドを実行するので forced command は使えない

### 検討して外した案

| 案 | 外した理由 |
| --- | --- |
| サーバーが定期的に GHCR を確認する (pull 型) | 反映が遅れ、成否が GitHub から見えない |
| Tailscale 経由の SSH | 外部サービスが増える。Cloudflare に寄せたほうが管理する場所が 1 つで済む |
| サーバーに GitHub Actions のセルフホストランナーを置く | 公開リポジトリでは fork からの PR で自宅サーバー上のコードが実行される危険がある |
| doco-cd / Komodo などの GitOps ツール | 便利だが、ツール自体の運用と理解が必要になる。今の規模では SSH と 30 行のスクリプトで足りる |
| Coolify / Dokploy | 管理画面つきで手軽だが、常駐でメモリを数百 MB 使い、中身も見えにくい |
| Watchtower | 2025-12 に開発終了 |

## ランタイム: Node と Bun

本番のランタイムは Node.js 24 LTS にする。Bun に替えるのはビルド設定 (Nitro の preset) と Dockerfile のベースイメージを変える程度で済むので、後から試せる。

- このサイトのアクセス量では、Bun の速さ (起動、HTTP 処理) が体感できるほどの差にならない
- Vite と周辺ツールは Node を前提に開発されていて、問題が起きたときに情報を探しやすい
- 置き換え候補だった Bun の利点 (`HTMLRewriter` 内蔵、SQLite 内蔵、TS の直接実行) は、移行後のこの構成ではほぼ不要になる。`HTMLRewriter` は SSR で使わなくなり、SQLite は `node:sqlite` があり、TS はビルドする
- キャッシュ層は `Cache` インターフェースで抽象化するので、SQLite のドライバを替えてもほかのコードに影響しない

## 実装の進め方

実装は Claude Code が担当する。各 PR / 各ステップで次を説明する:
- 何を変えたか (ファイルと内容)
- どう動くか (新しい概念はその場で簡単に解説する)
- なぜその方法にしたか、ほかに何を検討して外したか

## リスク

- **Nitro の Vite プラグインはまだ開発中と公式ドキュメントに書かれている。** 問題が出たら Start の Node 向けの別プリセットか、`srvx` で直接起動する方法に切り替える
- **自宅サーバーの可用性。** Workers と違い、停電や回線障害で落ちる。Tunnel は接続元が落ちると 502 になる。気になるなら、プリレンダーした HTML を別の静的ホスティングにも置いておく
- **GitHub API のレート制限。** キャッシュが SQLite に永続化されるので、再起動しても API を叩き直さないようにする
- **Panda CSS 2.x の破壊的変更。** フェーズ 1 で吸収しておく

## 未決事項

- 外形監視を入れるか

## 参考

- [Self-Hosting a Side Project With GitHub Actions, Cloudflare Tunnel, and Docker Compose](https://keijilohier.com/blogs/self-hosting-github-actions-cloudflare-tunnel-docker-compose/)
- [Deploying Docker Compose Applications with Tailscale and GitHub Actions](https://aaronstannard.com/docker-compose-tailscale/)
- [Watchtower Reaches End of Maintenance (Linuxiac)](https://linuxiac.com/docker-update-tool-watchtower-reaches-end-of-maintenance/)
- [Deploy with Void (Cloudflare Blog)](https://blog.cloudflare.com/deploy-with-void/)
- [The complete guide to Void (flaviocopes)](https://flaviocopes.com/void/)
- [wazootech/workspace#4: Void 採用の検討](https://github.com/wazootech/workspace/issues/4)
- [TanStack Start Hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
