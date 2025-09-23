import {
	ArcElement,
	type ChartData,
	Chart as ChartJS,
	type ChartOptions,
	DoughnutController,
	Legend,
	Tooltip,
} from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { css, cx } from "../../styled-system/css";
import getLanguageColor from "../lib/language_color";

ChartJS.register(DoughnutController, ArcElement, Legend, Tooltip);

const OTHER_COLOR = "#E5E7EB";

const chartOptions: ChartOptions<"doughnut"> = {
	responsive: true,
	maintainAspectRatio: false,
	cutout: "62%",
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			callbacks: {
				label: (context) => {
					const label = context.label ?? "";
					const value = typeof context.parsed === "number" ? context.parsed : 0;
					return `${label}: ${value.toFixed(1)}%`;
				},
			},
		},
	},
};

export type LanguageDoughnutChartProps = {
	language: string;
	percentage: number;
	className?: string;
	colorIndex?: number;
};

export default function LanguageDoughnutChart({
	language,
	percentage,
	className,
	colorIndex = 0,
}: LanguageDoughnutChartProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartRef = useRef<ChartJS<"doughnut", number[], string> | null>(null);

	const wrapperClass = css({
		position: "relative",
		w: "full",
		height: "120px",
	});

	const canvasClass = css({
		display: "block",
		w: "full",
		h: "full",
	});

	const emptyStateClass = css({
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		h: "full",
		color: "gray.500",
		fontSize: "sm",
	});

	const valueContainerClass = css({
		position: "absolute",
		inset: "0",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	});

	const valueTextClass = css({
		fontSize: "lg",
		fontWeight: "semibold",
	});

	const { chartData, primaryColor, value } = useMemo(() => {
		const clamped = Number.isFinite(percentage)
			? Math.min(Math.max(percentage, 0), 100)
			: 0;
		const other = Math.max(0, 100 - clamped);
		const mainColor = getLanguageColor(language, colorIndex);
		const data: ChartData<"doughnut", number[], string> = {
			labels: [language, "その他"],
			datasets: [
				{
					data: [clamped, other],
					backgroundColor: [mainColor, OTHER_COLOR],
					borderWidth: 0,
					spacing: 1,
				},
			],
		};
		return { chartData: data, primaryColor: mainColor, value: clamped };
	}, [language, percentage, colorIndex]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const existingChart = ChartJS.getChart(canvas);
		if (existingChart) {
			existingChart.destroy();
		}

		if (chartData.datasets[0]?.data.every((item) => item === 0)) {
			chartRef.current = null;
			return;
		}

		chartRef.current = new ChartJS(canvas, {
			type: "doughnut",
			data: chartData,
			options: chartOptions,
		});

		return () => {
			chartRef.current?.destroy();
			chartRef.current = null;
		};
	}, [chartData]);

	return (
		<div className={cx(wrapperClass, className)}>
			{chartData.datasets[0]?.data.every((item) => item === 0) ? (
				<div className={emptyStateClass}>表示可能なデータがありません。</div>
			) : (
				<>
					<canvas ref={canvasRef} className={canvasClass}>
						グラフを表示するにはcanvas要素をサポートするブラウザが必要です。
					</canvas>
					<div className={valueContainerClass}>
						<strong className={valueTextClass} style={{ color: primaryColor }}>
							{value.toFixed(1)}%
						</strong>
					</div>
				</>
			)}
		</div>
	);
}
