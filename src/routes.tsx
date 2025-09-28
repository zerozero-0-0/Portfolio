import { createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Access from "./pages/Access";
import { ErrorBoudary } from "./pages/ErrorPage";
import HomePage from "./pages/home";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
		errorElement: <ErrorBoudary />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "access", element: <Access /> },
		],
	},
]);
  