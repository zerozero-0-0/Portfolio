import { isRouteErrorResponse, useRouteError } from "react-router";
import { css } from "../../styled-system/css";

function ClassifyError(routeError: unknown): string {
	if (isRouteErrorResponse(routeError)) {
		if (routeError.status === 404) {
			return "お探しのページが見つかりませんでした";
		}
		return `${routeError.status} ${routeError.statusText}`;
	} else if (routeError instanceof Error) {
		return routeError.message;
	} else {
		return "予期しないエラーが発生しました";
	}
}

export default function NotFound() {
	const routeError = useRouteError();
	const errorMessage = ClassifyError(routeError);

	return (
		<div
			className={css({
				w: "full",
				h: "100vh",
				mx: "auto",
				alignItems: "center",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				gap: 8,
				bg: "gray.100",
			})}
		>
			<span
				className={css({
					fontSize: 24,
					color: "gray.600",
				})}
			>
				The Response is
			</span>
			<p
				className={css({
					textAlign: "center",
					fontSize: 64,
					fontWeight: "bold",
					color: "blue.400",
				})}
			>
				404 Not Found
			</p>

			<span
				className={css({
					textAlign: "center",
				})}
			>
				{errorMessage}
			</span>
			<span
				className={css({
					fontSize: "xl",
					fontWeight: "bold",
				})}
			>
				お探しのページは削除されたか、名前が変更された可能性があります。
			</span>
		</div>
	);
}
