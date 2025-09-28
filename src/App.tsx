import { createBrowserRouter, RouterProvider } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Access from "./pages/Access";
import { ErrorPage } from "./pages/ErrorPage";
import Home from "./pages/home";

const router = createBrowserRouter([
	{
		path: "/",
		Component: AppLayout,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				Component: Home,
			},
			{
				path: "access",
				Component: Access,
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
