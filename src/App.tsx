import { css } from "../styled-system/css";
import Home from "./components/home";

function App() {
	return (
		<div className={css({ fontSize: "2xl", fontWeight: "bold" })}>
			Hello 🐼!
			<Home />
		</div>
	);
}

export default App;
