import { createBrowserRouter, RouterProvider } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Access from "./pages/Access";
import Home from "./pages/home";
import NotFound from "./pages/NotFound";

function AppErrorBoundary() {
	return (
		<AppLayout>
			<NotFound />
		</AppLayout>
	);
}

const router = createBrowserRouter([
	{
		path: "/",
		Component: AppLayout,
		ErrorBoundary: AppErrorBoundary,
		children: [
			{
				index: true,
				Component: Home,
			},
			{
				path: "access",
				Component: Access,
			},
			{
				path: "*",
				Component: NotFound,
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
