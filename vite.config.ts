import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import { ARTICLE_HOT_UPDATE_EVENT } from "./src/lib/article";
import {
	ARTICLES_DIR,
	buildArticles,
	writeManifest,
} from "./worker/lib/generate-blog";

/**
 * dev サーバー起動中に content/blog 配下の Markdown を監視し、
 * 変更があれば記事マニフェストを再生成したうえで、
 * 最新の記事をブラウザへ送ってリロードなしで表示を差し替える
 */
function blogLivePreview(): Plugin {
	let running: Promise<void> | null = null;
	let pending = false;

	return {
		name: "blog-live-preview",
		apply: "serve",
		async buildStart() {
			await writeManifest(await buildArticles());
		},
		configureServer(server) {
			server.watcher.add(ARTICLES_DIR);

			const regenerate = async () => {
				// 生成中に更新が来たら、終わった後にもう一度だけ走らせる
				if (running) {
					pending = true;
					return;
				}
				running = (async () => {
					do {
						pending = false;
						try {
							const articles = await buildArticles();
							server.ws.send({
								type: "custom",
								event: ARTICLE_HOT_UPDATE_EVENT,
								data: articles,
							});
							// ページを開き直したときも最新になるよう worker 側のマニフェストも更新
							await writeManifest(articles);
						} catch (error) {
							server.config.logger.error(`[blog] ${String(error)}`);
						}
					} while (pending);
				})();
				await running;
				running = null;
			};

			const onChange = (file: string) => {
				if (file.startsWith(ARTICLES_DIR) && file.endsWith(".md")) {
					void regenerate();
				}
			};
			server.watcher.on("add", onChange);
			server.watcher.on("change", onChange);
			server.watcher.on("unlink", onChange);
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [blogLivePreview(), react(), cloudflare()],
});
