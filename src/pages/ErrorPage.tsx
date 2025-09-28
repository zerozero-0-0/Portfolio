import { isRouteErrorResponse, useRouteError } from "react-router";
import { css } from "../../styled-system/css";
import AppLayout from "../layouts/AppLayout";

export function ErrorPage() {
	const error = useRouteError();

	let errorMessage = "Unknown Error";
	if (isRouteErrorResponse(error)) {
		errorMessage = `${error.status} ${error.statusText}`;
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	return (
		<div
			className={css({
				w: "full",
				h: "100%",
				mx: "auto",
				alignItems: "center",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				mt: 36,
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
				{errorMessage}
			</p>

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

export function ErrorBoundary() {
	return (
		<AppLayout>
			<ErrorPage />
		</AppLayout>
	);
}
