import { createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Access from "./pages/Access";
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
		],
	},
]);
