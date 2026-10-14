import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import type { ChartOptions } from "chart.js";
import { addDays, eachDayOfInterval, format, subDays } from "date-fns";
import BarChart from "../../../shared/BarChart";
import { NotificationComponent } from "../../../shared/Notifications";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	getUsageDailyStatistics,
	hasUsageDailyStatisticsError,
	isFetchingUsageDailyStatistics,
} from "../../../../selectors/eventDetailsSelectors";
import { fetchEventUsageDailyStatistics } from "../../../../slices/eventDetailsSlice";
import { formatHMS } from "../../../../utils/dateUtils";
import { getCurrentLanguageInformation } from "../../../../utils/utils";
import i18n from "../../../../i18n/i18n";

type Metric = "views" | "watchtime";

const DATE_FORMAT = "yyyy-MM-dd";
const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, "0"));

// The backend reports "day" and hour-of-day buckets in UTC. Reconstruct the
// actual UTC instant for a given bucket so it can be re-bucketed into the
// viewer's local day/hour for display.
const utcBucketToLocalDate = (day: string, hour: number): Date => {
	const [year, month, dayOfMonth] = day.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, dayOfMonth, hour));
};

/**
 * Shows per-day and hour-of-day breakdowns of an event's views/watchtime.
 */
const EventDetailsUsageDailyDetail = ({ eventId }: { eventId: string }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [metric, setMetric] = useState<Metric>("views");
	const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 29));
	// null while the user has picked a new start but not yet a matching end
	// (react-datepicker's own convention for an in-progress range selection).
	const [endDate, setEndDate] = useState<Date | null>(new Date());

	const dailyStatistics = useAppSelector(state => getUsageDailyStatistics(state));
	const isFetching = useAppSelector(state => isFetchingUsageDailyStatistics(state));
	const hasError = useAppSelector(state => hasUsageDailyStatisticsError(state));

	const rangeEnd = endDate ?? startDate;

	useEffect(() => {
		if (!endDate) {
			return;
		}
		// Widen by a day on each side: a viewer ahead of UTC has local hours
		// early on their first day that fall in the *previous* UTC day (and
		// symmetrically for a viewer behind UTC on their last day), so the
		// UTC-day-bounded backend range needs padding to cover them.
		dispatch(fetchEventUsageDailyStatistics({
			eventId,
			from: format(subDays(startDate, 1), DATE_FORMAT),
			to: format(addDays(endDate, 1), DATE_FORMAT),
		}));
	}, [dispatch, eventId, startDate, endDate]);

	const dateLocale = getCurrentLanguageInformation(i18n.language)?.dateLocale;

	// Re-bucket the UTC day/hour data the backend returns into the viewer's
	// local day/hour, then drop anything outside the viewer's selected local
	// range (the padded fetch above can return local days beyond it).
	const localizedBuckets = useMemo(() => {
		const rangeStartKey = format(startDate, DATE_FORMAT);
		const rangeEndKey = format(rangeEnd, DATE_FORMAT);
		const buckets: { localDay: string, localHour: number, value: number }[] = [];
		for (const entry of dailyStatistics) {
			entry[metric].forEach((value, hour) => {
				const localDate = utcBucketToLocalDate(entry.day, hour);
				const localDay = format(localDate, DATE_FORMAT);
				if (localDay < rangeStartKey || localDay > rangeEndKey) {
					return;
				}
				buckets.push({ localDay, localHour: localDate.getHours(), value });
			});
		}
		return buckets;
	}, [dailyStatistics, metric, startDate, rangeEnd]);

	const dailyTotals = useMemo(() => {
		const totalsByLocalDay = new Map<string, number>();
		for (const bucket of localizedBuckets) {
			totalsByLocalDay.set(bucket.localDay, (totalsByLocalDay.get(bucket.localDay) ?? 0) + bucket.value);
		}
		return eachDayOfInterval({ start: startDate, end: rangeEnd }).map(day => {
			const key = format(day, DATE_FORMAT);
			return { label: format(day, "P", { locale: dateLocale }), total: totalsByLocalDay.get(key) ?? 0 };
		});
	}, [localizedBuckets, startDate, rangeEnd, dateLocale]);

	const hourlyTotals = useMemo(() => {
		const totals = new Array<number>(24).fill(0);
		for (const bucket of localizedBuckets) {
			totals[bucket.localHour] += bucket.value;
		}
		return totals;
	}, [localizedBuckets]);

	const chartOptions = useMemo(() => buildChartOptions(metric), [metric]);

	return (
		<div className="obj tbl-details">
			<header>{t("EVENTS.EVENTS.DETAILS.USAGE.DAILY_CAPTION")}</header>
			<div className="obj-container">
				<div className="usage-daily-controls">
					<nav>
						<ButtonLikeAnchor
							className={metric === "views" ? "active" : "inactive"}
							onClick={() => setMetric("views")}
						>
							{t("EVENTS.EVENTS.DETAILS.USAGE.METRIC_VIEWS")}
						</ButtonLikeAnchor>
						<ButtonLikeAnchor
							className={metric === "watchtime" ? "active" : "inactive"}
							onClick={() => setMetric("watchtime")}
						>
							{t("EVENTS.EVENTS.DETAILS.USAGE.METRIC_WATCHTIME")}
						</ButtonLikeAnchor>
					</nav>
					<DatePicker
						selectsRange
						selected={startDate}
						startDate={startDate}
						endDate={endDate}
						maxDate={new Date()}
						onChange={(dates: [Date | null, Date | null]) => {
							const [start, end] = dates;
							if (start) {
								setStartDate(start);
							}
							// Clear end when a new range starts, so react-datepicker
							// treats the next click as completing it rather than
							// starting yet another new range.
							setEndDate(end);
						}}
						showYearDropdown
						showMonthDropdown
						swapRange
						allowSameDay
						dateFormat="P"
						popperPlacement="bottom"
						popperClassName="datepicker-custom"
						className="usage-date-range-input"
						locale={dateLocale}
					/>
				</div>

				{hasError && (
					<NotificationComponent
						notification={{
							type: "error",
							message: "EVENTS.EVENTS.DETAILS.USAGE.NOT_AVAILABLE",
							id: 0,
						}}
					/>
				)}

				{!isFetching && !hasError && (
					<>
						<div className="usage-chart-title">{t("EVENTS.EVENTS.DETAILS.USAGE.PER_DAY")}</div>
						<BarChart
							values={dailyTotals.map(day => day.total)}
							axisLabels={dailyTotals.map(day => day.label)}
							options={chartOptions}
						/>

						<div className="usage-chart-title">{t("EVENTS.EVENTS.DETAILS.USAGE.BY_HOUR_OF_DAY")}</div>
						<BarChart
							values={hourlyTotals}
							axisLabels={HOUR_LABELS}
							options={chartOptions}
						/>
					</>
				)}
			</div>
		</div>
	);
};

const buildChartOptions = (metric: Metric): ChartOptions<"bar"> => ({
	responsive: true,
	plugins: {
		legend: { display: false },
		tooltip: {
			callbacks: {
				label: context => {
					const value = context.parsed.y ?? 0;
					return metric === "watchtime" ? formatHMS(value) : String(value);
				},
			},
		},
	},
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				precision: metric === "views" ? 0 : undefined,
				callback: value => metric === "watchtime" ? formatHMS(Number(value)) : value,
			},
		},
	},
});

export default EventDetailsUsageDailyDetail;
