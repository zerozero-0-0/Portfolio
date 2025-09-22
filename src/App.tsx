import { css } from "../styled-system/css";
import Access from "./pages/Access";

function App() {
	return (
		<div className={css({ fontSize: "2xl", fontWeight: "bold" })}>
			<Access />
		</div>
	);
}

export default App;
