import { createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Access from "./pages/Access";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { ErrorBoundary } from "./pages/ErrorPage";
import HomePage from "./pages/home";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
		errorElement: <ErrorBoundary />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "access", element: <Access /> },
			{ path: "blog", element: <Blog /> },
			{ path: "blog/:slug", element: <BlogPost /> },
		],
	},
]);
