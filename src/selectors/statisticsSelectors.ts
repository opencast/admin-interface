import { RootState } from "../store";

/* selectors for statistics page */
export const hasStatistics = (state: RootState) => state.statistics.statistics.length > 0;
export const getStatistics = (state: RootState) => state.statistics.statistics;
export const hasStatisticsError = (state: RootState) => state.statistics.hasStatisticsError;
export const isFetchingStatistics = (state: RootState) =>
	state.statistics.status === "loading";
