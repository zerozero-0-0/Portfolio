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

		if (chartRef.current) {
			chartRef.current.destroy();
			chartRef.current = null;
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
		<div
			className={className}
			style={{ position: "relative", width: "100%", height: "120px" }}
		>
			{chartData.datasets[0]?.data.every((item) => item === 0) ? (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						color: "#6b7280",
						fontSize: "14px",
					}}
				>
					表示可能なデータがありません。
				</div>
			) : (
				<>
					<canvas ref={canvasRef}>
						グラフを表示するにはcanvas要素をサポートするブラウザが必要です。
					</canvas>
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "4px",
						}}
					>
						<strong
							style={{
								color: primaryColor,
								fontSize: "18px",
								fontWeight: 600,
							}}
						>
							{value.toFixed(1)}%
						</strong>
					</div>
				</>
			)}
		</div>
	);
}
