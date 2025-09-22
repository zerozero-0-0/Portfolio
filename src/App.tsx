import { RouterProvider, createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Access from "./pages/Access";
import Home from "./pages/home";

const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: "access",
				element: <Access />,
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
