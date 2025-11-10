import moment from "moment";
import "moment/min/locales.min";
import { getCurrentLanguageInformation } from "./utils";
import { DataResolution, TimeMode } from "../slices/statisticsSlice";
import type { ChartOptions, TooltipItem } from "chart.js";

/**
 * This file contains functions that are needed for thunks for statistics
 */

/* creates callback function for formatting the labels of the xAxis in a statistics diagram */
function createXAxisTickCallback(
	timeMode: TimeMode,
	dataResolution: DataResolution,
	language: string,
) {
	let formatString = "L";
	if (timeMode === "year") {
		formatString = "MMMM";
	} else if (timeMode === "month") {
		formatString = "dddd, Do";
	} else {
		if (dataResolution === "yearly") {
			formatString = "YYYY";
		} else if (dataResolution === "monthly") {
			formatString = "MMMM";
		} else if (dataResolution === "daily") {
			if (language === "en-US" || language === "en-GB") {
				formatString = "MMMM Do, YYYY";
			} else {
				formatString = "Do MMMM YYYY";
			}
		} else if (dataResolution === "hourly") {
			formatString = "LLL";
		}
	}

	return function (tickValue: number | string) {
		// @ts-expect-error: Typescript does not like "this", but the chart.js documentation insists we should do it this way
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		return moment(this.getLabelForValue(tickValue)).locale(language).format(formatString);
	};
};

/* creates callback function for the displayed label when hovering over a data point in a statistics diagram */
const createTooltipCallback = (
	timeMode: TimeMode,
	dataResolution: DataResolution,
	language: string,
) => {
	let formatString;
	if (timeMode === "year") {
		formatString = "MMMM YYYY";
	} else if (timeMode === "month") {
		if (language === "en-US" || language === "en-GB") {
			formatString = "dddd, MMMM Do, YYYY";
		} else {
			formatString = "dddd, Do MMMM YYYY";
		}
	} else {
		if (dataResolution === "yearly") {
			formatString = "YYYY";
		} else if (dataResolution === "monthly") {
			formatString = "MMMM YYYY";
		} else if (dataResolution === "daily") {
			if (language === "en-US" || language === "en-GB") {
				formatString = "dddd, MMMM Do, YYYY";
			} else {
				formatString = "dddd, Do MMMM YYYY";
			}
		} else {
			if (language === "en-US" || language === "en-GB") {
				formatString = "dddd, MMMM Do, YYYY HH:mm";
			} else {
				formatString = "dddd, Do MMMM YYYY, HH:mm";
			}
		}
	}

	return (tooltipItem: TooltipItem<"bar">) => {
		const date = tooltipItem.label;
		const finalDate = moment(date).locale(language).format(formatString);
		return finalDate + ": " + tooltipItem.formattedValue;
	};
};

/* creates options for statistics chart */
export const createChartOptions = (
	timeMode: TimeMode,
	dataResolution: DataResolution,
): ChartOptions<"bar"> => {
	// Get info about the current language and its date locale
	const currentLanguageInfo = getCurrentLanguageInformation();
	let currentLanguage = "";
	if (currentLanguageInfo) {
		currentLanguage = currentLanguageInfo.dateLocale.code;
	}

	return {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: createTooltipCallback(timeMode, dataResolution, currentLanguage),
				},
			},
		},
		layout: {
			padding: {
				top: 20,
				left: 20,
				right: 20,
			},
		},
		scales: {
			x:
				{
					ticks: {
						callback: createXAxisTickCallback(
							timeMode,
							dataResolution,
							currentLanguage,
						),
					},
				},

			y: {
				suggestedMin: 0,
			},
		},

	};
};

/* creates the url for downloading a csv file with current statistics */
export const createDownloadUrl = (
	resourceId: string,
	resourceType: string,
	providerId: string,
	from: Date | string,
	to: Date | string,
	dataResolution: string,
) => {
	const csvUrlSearchParams = new URLSearchParams({
		dataResolution: dataResolution,
		providerId: providerId,
		resourceId: resourceId,
		resourceType: resourceType,
		from: moment(from).toJSON(),
		to: moment(to).endOf("day").toJSON(),
	});

	return "/admin-ng/statistics/export.csv?" + csvUrlSearchParams.toString();
};
