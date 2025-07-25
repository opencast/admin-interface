import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import moment from "moment";
import {
	createDownloadUrl,
} from "../utils/statisticsUtils";
import { getHttpHeaders } from "../utils/resourceUtils";
import { getStatistics } from "../selectors/statisticsSelectors";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of statistics
 */
export type TimeMode = "year" | "month" | "custom"
export type DataResolution = "daily" | "monthly" | "yearly" | "weekly" | "hourly"

type FetchData = {
	total: number,
	providerId: string,
	providerType: string,
	values: number[],
	labels: string[],
};

export type Statistics = {
	title: string
	description: string,
	providerId: string,
	providerType: string,
	from: string,
	to: string,
	dataResolution: DataResolution,
	timeMode: TimeMode,
	csvUrl: string, // URL
	values: number[],
	labels: string[],
	totalValue: number,
}

type StatisticsState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	statusUpdate: "uninitialized" | "loading" | "succeeded" | "failed",
	errorUpdate: SerializedError | null,
	statistics: Statistics[],
	hasStatisticsError: boolean,
}

// Initial state of series details in redux store
const initialState: StatisticsState = {
	status: "uninitialized",
	error: null,
	statusUpdate: "uninitialized",
	errorUpdate: null,
	statistics: [],
	hasStatisticsError: false,
};

/* thunks for fetching statistics data */

export const fetchStatisticsPageStatistics = createAppAsyncThunk("statistics/fetchStatisticsPageStatistics", async (organizationId: string, { getState }) => {
	// get prior statistics
	const state = getState();
	const statistics = getStatistics(state);

	return await fetchStatistics(organizationId, "organization", statistics);
});

export const fetchStatisticsPageStatisticsValueUpdate = createAppAsyncThunk("statistics/fetchStatisticsPageStatisticsValueUpdate", async (
	params: {
		id: string,
		providerId: string,
		from: string | Date,
		to: string | Date,
		dataResolution: DataResolution,
		timeMode: TimeMode
	}, { getState }) => {
	const { id, providerId, from, to, dataResolution, timeMode } = params;

	// get prior statistics
	const state = getState();
	const statistics = getStatistics(state);

	return await fetchStatisticsValueUpdate(id, "organization", providerId, from, to, dataResolution, timeMode, statistics);
});

export const fetchStatistics = async (resourceId: string, resourceType: string, statistics: Statistics[]) => {
	let hasError = false;

	// create url params
	const params = new URLSearchParams();
	params.append("resourceType", resourceType);

	let newStatistics: Statistics[] = [];
	const statisticsValueRequest = [];

	// get the available statistics providers from API
	try {
		type FetchProviders = {
			providerId: string,
			dataResolutions: string[],
			description: string,
			title: string,
			providerType: string,
		};
		const response = await axios.get<FetchProviders[]>("/admin-ng/statistics/providers.json", { params });
		// default values to use, when statistics are viewed the first time
		const originalDataResolution = "monthly";
		const originalTimeMode = "year";
		const originalFrom = moment().startOf(originalTimeMode);
		const originalTo = moment().endOf(originalTimeMode);

		// iterate over statistics providers
		for (let i = 0; i < response.data.length; i++) {
			// currently, only time series data can be displayed, for other types, add data directly, then continue
			if (response.data[i].providerType !== "timeSeries") {
				newStatistics.push({
					from: "",
					to: "",
					dataResolution: "daily",
					timeMode: "year",
					csvUrl: "",
					values: [],
					labels: [],
					totalValue: 0,
					...response.data[i],
				});
			} else {
				// case: provider is of type time series
				let from;
				let to;
				let timeMode;
				let dataResolution;

				/* if old values for this statistic exist, use old
				from (date), to (date), timeMode and dataResolution values, otherwise use defaults */
				if (statistics.length > i) {
					from = statistics[i].from;
					to = statistics[i].to;
					timeMode = statistics[i].timeMode;
					dataResolution = statistics[i].dataResolution;
				} else {
					from = originalFrom.format("YYYY-MM-DD");
					to = originalTo.format("YYYY-MM-DD");
					timeMode = originalTimeMode;
					dataResolution = originalDataResolution;
				}

				// create chart options and download url
				const csvUrl = createDownloadUrl(
					resourceId,
					resourceType,
					response.data[i].providerId,
					from,
					to,
					dataResolution,
				);

				// add provider to statistics list and add statistic settings
				newStatistics.push({
					values: [],
					labels: [],
					totalValue: 0,
					...response.data[i],
					from: from,
					to: to,
					timeMode: timeMode as TimeMode,
					dataResolution: dataResolution as DataResolution,
					csvUrl: csvUrl,
				});

				// add settings for this statistic of this resource to value request
				statisticsValueRequest.push({
					dataResolution: dataResolution,
					from: moment(from),
					to: moment(to).endOf("day"),
					resourceId: resourceId,
					providerId: response.data[i].providerId,
				});
			}
		}

		// prepare header and data for statistics values request
		const requestHeaders = getHttpHeaders();
		const requestData = new URLSearchParams({
			data: JSON.stringify(statisticsValueRequest),
		});

		// request statistics values from API
		const dataResponse = await axios.post<FetchData[]>("/admin-ng/statistics/data.json", requestData, requestHeaders);
			// iterate over value responses
			for (const statisticsValue of dataResponse.data) {
				// get the statistic the response is meant for
				const stat = newStatistics.find(
					element => element.providerId === statisticsValue.providerId,
				);

				if (!stat) {
					continue;
				}

				// add values to statistic
				const statistic = {
					...stat,
					values: statisticsValue.values,
					labels: statisticsValue.labels,
					totalValue: statisticsValue.total,
				};

				// put updated statistic into statistics list
				newStatistics = newStatistics.map(oldStat =>
					oldStat === stat ? statistic : oldStat,
				);

				// put statistics list into redux store
				statistics = newStatistics;
				hasError = false;
			}
			statistics = newStatistics;
			hasError = false;
		} catch (leError) {
			// put unfinished statistics list into redux store but set flag that an error occurred
			statistics = newStatistics;
			hasError = true;
			console.error(leError);
		}

		return { statistics, hasError };
};

export const fetchStatisticsValueUpdate = async (
	resourceId: string,
	resourceType: string,
	providerId: string,
	from: string | Date,
	to: string | Date,
	dataResolution: DataResolution,
	timeMode: TimeMode,
	statistics: Statistics[],
) => {
	// settings for this statistic of this resource for value request
	const statisticsValueRequest = [
		{
			dataResolution: dataResolution,
			from: moment(from),
			to: moment(to).endOf("day"),
			resourceId: resourceId,
			providerId: providerId,
		},
	];

	// prepare header and data for statistic values request
	const requestHeaders = getHttpHeaders();
	const requestData = new URLSearchParams({
		data: JSON.stringify(statisticsValueRequest),
	});

	let newStatistics: Statistics[] = [];
	// request statistic values from API
	await axios
		.post<FetchData[]>("/admin-ng/statistics/data.json", requestData, requestHeaders)
		.then(dataResponse => {
			// if only one element is in the response (as expected), get the response
			if (dataResponse.data.length === 1) {
				const newStatisticData = dataResponse.data[0];

				// get the statistic the response is meant for out of the statistics list
				const stat = statistics.find(
					element => element.providerId === providerId,
				);

				if (!stat) {
					return [];
				}

				// get statistic options and download url for new statistic settings
				// const options = createChartOptions(timeMode, dataResolution);
				const csvUrl = createDownloadUrl(
					resourceId,
					resourceType,
					providerId,
					from,
					to,
					dataResolution,
				);

				// update statistic
				const statistic: Statistics = {
					...stat,
					from: from.toString(),
					to: from.toString(),
					dataResolution: dataResolution,
					timeMode: timeMode,
					// options: options,
					csvUrl: csvUrl,
					values: newStatisticData.values,
					labels: newStatisticData.labels,
					totalValue: newStatisticData.total,
				};

				// put updated statistic into statistics list
				newStatistics = statistics.map(oldStat =>
					oldStat === stat ? statistic : oldStat,
				);
			}
		});

	// put updates statistics list into redux store
	return newStatistics;
};



const statisticsSlice = createSlice({
	name: "statistics",
	initialState,
	reducers: {},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchStatisticsPageStatistics.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchStatisticsPageStatistics.fulfilled, (state, action: PayloadAction<{
				statistics: StatisticsState["statistics"],
				hasError: StatisticsState["hasStatisticsError"]
			}>) => {
				state.status = "succeeded";
				const statistics = action.payload;
				state.statistics = statistics.statistics;
				state.hasStatisticsError = statistics.hasError;
			})
			.addCase(fetchStatisticsPageStatistics.rejected, (state, action) => {
				state.status = "failed";
				state.hasStatisticsError = true;
				state.error = action.error;
			})
			.addCase(fetchStatisticsPageStatisticsValueUpdate.pending, state => {
				state.statusUpdate = "loading";
			})
			.addCase(fetchStatisticsPageStatisticsValueUpdate.fulfilled, (state, action: PayloadAction<
				StatisticsState["statistics"]
			>) => {
				state.statusUpdate = "succeeded";
				const statistics = action.payload;
				state.statistics = statistics;
			})
			.addCase(fetchStatisticsPageStatisticsValueUpdate.rejected, (state, action) => {
				state.statusUpdate = "failed";
				state.errorUpdate = action.error;
			});
	},
});

// export const {} = statisticsSlice.actions;

// Export the slice reducer as the default export
export default statisticsSlice.reducer;
