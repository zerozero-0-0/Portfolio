import { css } from "../styled-system/css";

export const STUDENT_STATUS = () => {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: "2",
				fontSize: { base: "lg", md: "xl" },
				color: "gray.700",
			})}
		>
			<span>Saitama University</span>
			<span>Faculty of Engineering</span>
			<span>Department of Information Engineering</span>
			<span>2nd year</span>
		</div>
	);
};
