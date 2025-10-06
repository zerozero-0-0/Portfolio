import { Link } from "react-router";
import { listArticles } from "../../worker/lib/parser"
import { useEffect, useState } from "react";
import type { Article } from "../types/Article";

export default function Blog() {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {    
        fetch("/api/article")
            .then((res) => res.json())
            .then((data) => setArticles(data))
    })

    return (
        <main>
            <h1>Blog</h1>
            <ul>
                {articles.map(article => (
                    <li key={article.slug}>
                        <Link to={`/blog/${article.slug}`}>
                            {article.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}
