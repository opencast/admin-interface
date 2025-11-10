/* this file contains constants for available options and used date formats for statistics */

import { TimeMode } from "../slices/statisticsSlice";

// available modes of choosing statistic timeframe
export const statisticTimeModes: {
	value: TimeMode,
	translation: string,
}[] = [
	{
		value: "year",
		translation: "Year",
	},
	{
		value: "month",
		translation: "Month",
	},
	{
		value: "custom",
		translation: "Custom",
	},
];

// data resolutions (or time granularity) for statistics with year or month timeframe
export const fixedStatisticDataResolutions = (timeMode: "month" | "year") => {
	if (timeMode === "month") {
		return "daily";
	}
	if (timeMode === "year") {
		return "monthly";
	}
	return "monthly";
};

// available data resolutions (or time granularity) for statistics with custom timeframe
export const availableCustomStatisticDataResolutions = [
	{ label: "Yearly", value: "yearly" },
	{ label: "Monthly", value: "monthly" },
	{ label: "Daily", value: "daily" },
	{ label: "Hourly", value: "hourly" },
];

// date format strings
export const statisticDateFormatStrings = {
	month: "MMMM YYYY",
	year: "YYYY",
};
