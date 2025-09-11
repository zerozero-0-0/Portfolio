import { index, type RouteConfig } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	{
		path: "blog",
		file: "routes/blog.tsx",
		children: [
			{ index: true, file: "routes/blog._index.tsx" },
			{ path: ":slug", file: "routes/blog.$slug.tsx" },
			{
				path: "tags",
				file: "routes/blog.tags.tsx",
				children: [
					{ index: true, file: "routes/blog.tags._index.tsx" },
					{ path: ":tag", file: "routes/blog.tags.$tag.tsx" },
				],
			},
		],
	},
] satisfies RouteConfig;
