import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { ArticleMeta } from "../types/Article";

export default function Blog() {
	const [articles, setArticles] = useState<ArticleMeta[]>([]);

	useEffect(() => {
		fetch("/api/article")
			.then((res) => res.json())
			.then((data: { data: ArticleMeta[] }) => setArticles(data.data));
	}, []);

	return (
		<main>
			<h1>Blog</h1>
			<ul>
				{articles.map((article) => (
					<li key={article.slug}>
						<Link to={`/blog/${article.slug}`}>{article.title}</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
