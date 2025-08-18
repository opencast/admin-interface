import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getFilters, getStats } from "../../selectors/tableFilterSelectors";
import {
	editFilterValue,
	resetFilterValues,
	fetchStats,
	Stats as StatsType,
	editTextFilter,
	removeTextFilter,
} from "../../slices/tableFilterSlice";
import { loadEventsIntoTable } from "../../thunks/tableThunks";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchEvents } from "../../slices/eventSlice";
import { ParseKeys } from "i18next";
import BaseButton from "./BaseButton";

/**
 * This component renders the status bar of the event view and filters depending on these
 */
const Stats = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, "events"));
	const stats = useAppSelector(state => getStats(state));

	// Filter with value of clicked status
	const showStatsFilter = async (stats: StatsType) => {
		dispatch(resetFilterValues());
		let filterValue;
		stats.filters.forEach(f => {
			if (f.name.toLowerCase() === "textfilter") {
				dispatch(editTextFilter({ text: f.value, resource: "events" }));
				return;
			} else {
				dispatch(removeTextFilter("events"));
			}
			const filter = filterMap.find(({ name }) => name === f.name);
			filterValue = f.value;
			if (filter) {
				dispatch(editFilterValue({ filterName: filter.name, value: filterValue, resource: "events" }));
			}
		});
		await dispatch(fetchEvents());
		dispatch(loadEventsIntoTable());
	};

	const loadStats = async () => {
		// Fetching stats from server
		await dispatch(fetchStats());
	};

	useEffect(() => {
		// Load stats on mount
		loadStats();

		const fetchEventsInterval = setInterval(() => loadStats(), 5000);

		return () => clearInterval(fetchEventsInterval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className="main-stats">
				{/* Show one counter for each status */}
				{stats.map((st, key) => (
					<div className="col" key={key}>
						<BaseButton
							className="stat"
							tooltipText={"DASHBOARD.BUTTON_TOOLTIP"}
							tooltipParams={{ filterName: t(st.description as ParseKeys) }}
							aria-label={t("DASHBOARD.BUTTON_TOOLTIP", { filterName: t(st.description as ParseKeys) })}
							onClick={() => showStatsFilter(st)}
						>
							<div>{st.count}</div>
							{/* Show the description of the status, if defined,
								else show name of filter and its value*/}
							{st.description ? (
								<span>{t(st.description as ParseKeys)}</span>
							) : (
								st.filters.map((filter, key) => (
									<span key={key}>
										{t(filter.filter as ParseKeys)}: {t(filter.value as ParseKeys)}
									</span>
								))
							)}
						</BaseButton>
					</div>
				))}
			</div>
		</>
	);
};

export default Stats;
