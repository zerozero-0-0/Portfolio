# Zrzr Portfolio

私のポートフォリオです。順次更新予定です。

リンク : https://portfolio.zrzr.workers.dev/

Cloudflare Workersにデプロイしています。

## 技術スタック
- Vite + Reactをフルスタックフレームワークとして使用
- React Routerでルーティングを管理
- PandaCSS
- Biome.js
- TypeScript

## 開発環境
`.dev.vars.example` を `.dev.vars` にコピーして値を埋めると、`pnpm dev` でも GitHub API / AtCoder API が使えます。
AtCoder のレートは dev のローカル KV が空なので、`wrangler login` 済みの状態で `pnpm sync:atcoder` を実行すると本番 KV の値がコピーされます。

もし不具合等があれば、[Issue](https://github.com/zerozero-0-0/Portfolio/issues)や、[TwitterのDM](https://x.com/AaWlEw3pl899167)にて報告いただけると幸いです。
