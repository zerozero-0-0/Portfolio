import { useEffect, useRef } from "react";
import type { Article } from "../types/Article";
import { ARTICLE_HOT_UPDATE_EVENT } from "./article";

/**
 * dev サーバー上で Markdown が更新されたとき、リロードせずに最新の記事一覧を受け取る
 * 本番ビルドでは import.meta.hot が存在しないため何もしない
 */
export function useArticleHotUpdate(onUpdate: (articles: Article[]) => void) {
	const onUpdateRef = useRef(onUpdate);
	onUpdateRef.current = onUpdate;

	useEffect(() => {
		const hot = import.meta.hot;
		if (!hot) return;

		const handler = (articles: Article[]) => onUpdateRef.current(articles);
		hot.on(ARTICLE_HOT_UPDATE_EVENT, handler);
		return () => hot.off(ARTICLE_HOT_UPDATE_EVENT, handler);
	}, []);
}
