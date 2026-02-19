import { getCurrentLanguageInformation } from "./utils";
import { DataResolution, TimeMode } from "../slices/statisticsSlice";
import type { ChartOptions, TooltipItem } from "chart.js";
import i18n from "../i18n/i18n";
import { endOfDay, format, parseISO } from "date-fns";

/**
 * This file contains functions that are needed for thunks for statistics
 */

/* creates callback function for formatting the labels of the xAxis in a statistics diagram */
function createXAxisTickCallback(
	timeMode: TimeMode,
	dataResolution: DataResolution,
	language: string,
) {
	let formatString = "P";
	if (timeMode === "year") {
		formatString = "MMMM";
	} else if (timeMode === "month") {
		formatString = "EEEE, Do";
	} else {
		if (dataResolution === "yearly") {
			formatString = "yyyy";
		} else if (dataResolution === "monthly") {
			formatString = "MMMM";
		} else if (dataResolution === "daily") {
			if (language === "en-US" || language === "en-GB") {
				formatString = "MMMM do, yyyy";
			} else {
				formatString = "do MMMM yyyy";
			}
		} else if (dataResolution === "hourly") {
			formatString = "PPp";
		}
	}

	return function (tickValue: number | string) {
		const locale = getCurrentLanguageInformation(language)?.dateLocale;
		// @ts-expect-error: Typescript does not like "this", but the chart.js documentation insists we should do it this way
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		return format(parseISO(this.getLabelForValue(tickValue)), formatString, { locale });
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
		formatString = "MMMM yyyy";
	} else if (timeMode === "month") {
		if (language === "en-US" || language === "en-GB") {
			formatString = "EEEE, MMMM do, yyyy";
		} else {
			formatString = "EEEE, do MMMM yyyy";
		}
	} else {
		if (dataResolution === "yearly") {
			formatString = "yyyy";
		} else if (dataResolution === "monthly") {
			formatString = "MMMM yyyy";
		} else if (dataResolution === "daily") {
			if (language === "en-US" || language === "en-GB") {
				formatString = "EEEE, MMMM do, yyyy";
			} else {
				formatString = "EEEE, do MMMM yyyy";
			}
		} else {
			if (language === "en-US" || language === "en-GB") {
				formatString = "EEEE, MMMM do, yyyy HH:mm";
			} else {
				formatString = "EEEE, do MMMM yyyy, HH:mm";
			}
		}
	}

	return (tooltipItem: TooltipItem<"bar">) => {
		const date = tooltipItem.label;
		const locale = getCurrentLanguageInformation(language)?.dateLocale;
		const finalDate = format(parseISO(date), formatString, { locale });
		return finalDate + ": " + tooltipItem.formattedValue;
	};
};

/* creates options for statistics chart */
export const createChartOptions = (
	timeMode: TimeMode,
	dataResolution: DataResolution,
): ChartOptions<"bar"> => {
	// Get info about the current language and its date locale
	const currentLanguageInfo = getCurrentLanguageInformation(i18n.language);
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
		from: from instanceof Date ? from.toISOString() : parseISO(from).toISOString(),
		to: to instanceof Date ? endOfDay(to).toISOString() : endOfDay(parseISO(to)).toISOString(),
	});

	return "/admin-ng/statistics/export.csv?" + csvUrlSearchParams.toString();
};
