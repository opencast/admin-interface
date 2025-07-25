import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { isRelativeDateSpanValue, relativeDateSpanToFilterValue } from "../utils/dateUtils";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { FilterProfile } from "./tableFilterProfilesSlice";
import { Resource } from "./tableSlice";
import { FetchEvents } from "./eventSlice";

/**
 * This file contains redux reducer for actions affecting the state of table filters
 * This information is used to filter the entries of the table in the main view.
 */

export type FilterData = {
	label: string,
	name: string,
	options?: {
		label: string,
		value: string,
	}[],
	translatable?: boolean,
	type: string,
	resource: string, // Not from the backend. We set this to keep track of which table this filter belongs to
	value: string,
}

export type TextFilter = {
	text: string,
	resource: string // Not from the backend. We set this to keep track of which table this filter belongs to
}

export type Stats = {
	count: number,
	description: string,
	filters: {
		filter: string,
		name: string,
		value: string,
	}[],
	name: string,
	order: number,
}

type TableFilterState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	statusStats: "uninitialized" | "loading" | "succeeded" | "failed",
	errorStats: SerializedError | null,
	currentResource: string,
	data: FilterData[],
	filterProfiles: FilterProfile[],
	textFilter: TextFilter[],
	selectedFilter: string,
	secondFilter: string,
	stats: Stats[],
}

// Initial state of table filters in redux store
const initialState: TableFilterState = {
	status: "uninitialized",
	error: null,
	statusStats: "uninitialized",
	errorStats: null,
	currentResource: "",
	data: [],
	filterProfiles: [],
	textFilter: [],
	selectedFilter: "",
	secondFilter: "",
	stats: [],
};

// Fetch table filters from opencast instance and transform them for further use
export const fetchFilters = createAppAsyncThunk("tableFilters/fetchFilters", async (resource: TableFilterState["currentResource"], { getState }) => {
	type FetchFilters = {
		[key: string]: {
			label: string,
			type: string,
			translatable?: boolean,
			options?: { [key: string]: string },
		}
	};
	const data = await axios.get<FetchFilters>(
		`/admin-ng/resources/${resource}/filters.json`,
	);
	const resourceData = data.data;

	const filters = transformResponse(resourceData);
	const filtersList: TableFilterState["data"] = Object.keys(filters.filters).map(key => {
		const filter = filters.filters[key];
		return {
			...filter,
			name: key,
			resource: resource,
		};
	});

	if (resource === "events") {
		filtersList.push({
			label: "FILTERS.EVENTS.PRESENTERS_BIBLIOGRAPHIC.LABEL",
			name: "presentersBibliographic",
			translatable: false,
			type: "select",
			resource: "events",
			value: "",
		});
	}

	// Do all this purely to keep set filter values saved if the tab gets switched
	let oldData = getState().tableFilters.data;

	for (const oldFilter of oldData) {
		const foundIndex = filtersList.findIndex(x => x.name === oldFilter.name && x.resource === oldFilter.resource);
		if (foundIndex >= 0) {
			filtersList[foundIndex].value = oldFilter.value;
		}
	}

	oldData = oldData.filter(filter => filter.resource !== resource);
	filtersList.push(...oldData);

	return { filtersList, resource };
});

export const fetchStats = createAppAsyncThunk("tableFilters/fetchStats", async () => {
	type FetchStats = { [key: string]: string }
	type Stat = {
		filters: {
			filter: string,
			name: string,
			value: string,
		}[],
		description: string,
		order: number,
}
	// fetch information about possible status an event can have
	const data = await axios.get<FetchStats>("/admin-ng/resources/STATS.json");
	const response = data.data;

	// transform response
	const statsResponse = Object.keys(response).map(key => {
		// TODO: Handle JSON parsing errors
		const stat = JSON.parse(response[key]) as Stat;
		return {
			...stat,
			name: key,
			count: 0,
		};
	});

	const stats: TableFilterState["stats"] = [];

	// fetch for each status the corresponding count of events having this status
	for (const [i, _] of statsResponse.entries()) {
		const filter: string[] = [];
		statsResponse[i].filters.forEach((_, j) => {
			let value = statsResponse[i].filters[j].value;
			const name = statsResponse[i].filters[j].name;

			// If not string
			if (isRelativeDateSpanValue(value)) {
				value = relativeDateSpanToFilterValue(
					value.relativeDateSpan.from,
					value.relativeDateSpan.to,
					value.relativeDateSpan.unit,
				);
				// set date span as filter value
				statsResponse[i].filters[j].value = value;
			}
			filter.push(name + ":" + value);
		});
		const data = await axios.get<FetchEvents>("/admin-ng/event/events.json", {
			params: {
				filter: filter.join(","),
				limit: 1,
			},
		});

		const response = data.data;

		// add count to status information fetched before
		statsResponse[i] = {
			...statsResponse[i],
			count: response.total,
		};

		// fill stats array for redux state
		stats.push(statsResponse[i]);
	}

	stats.sort(compareOrder);

	return stats;
});

export const setSpecificEventFilter = createAppAsyncThunk("tableFilters/setSpecificEventFilter", async (params: { filter: string, filterValue: string }, { dispatch, getState }) => {
	const { filter, filterValue } = params;
	const { tableFilters } = getState();

	const filterToChange = tableFilters.data.find(({ name }) => name === filter);

	if (!filterToChange) {
		await dispatch(fetchFilters("events"));
	}

	if (filterToChange) {
		dispatch(editFilterValue({
			filterName: filterToChange.name,
			value: filterValue,
			resource: "events",
		}));
	}
});

export const setSpecificServiceFilter = createAppAsyncThunk("tableFilters/setSpecificServiceFilter", async (params: { filter: string, filterValue: string }, { dispatch, getState }) => {
	const { filter, filterValue } = params;
	const { tableFilters } = getState();

	let filterToChange = tableFilters.data.find(({ name }) => name === filter);

	if (!filterToChange) {
		const fetchedFilters = await dispatch(fetchFilters("services")) as {
			payload: { filtersList: FilterData[] }
		};
		filterToChange = fetchedFilters.payload.filtersList.find(({ name }: { name: string }) => name === filter);
	}

	if (filterToChange) {
		dispatch(editFilterValue({
			filterName: filterToChange.name,
			value: filterValue,
			resource: "services",
		}));
	}
});

// Transform received filter.json to a structure that can be used for filtering
function transformResponse(data: {
	[key: string]: {
		label: string,
		options?: { [key: string]: string },
		translatable?: boolean,
		type: string,
	}
}) {
	type ParsedFilters = {
		[key: string]: {
			value: string
			label: string
			options?: { value: string, label: string }[]
			translatable?: boolean,
			type: string,
		}
	}

	const filters = Object.keys(data).reduce((acc, key) => {
		const newOptions: {
			label: string,
			value: string,
		}[] = [];
		acc[key] = {
			...data[key],
			value: "",
			options: newOptions,
		};
		return acc;
	}, {} as ParsedFilters);

	try {
		for (const key in data) {
			if (!data[key].options) {
				continue;
			}
			let filterArr: { value: string, label: string }[] = [];
			const options = data[key].options;
			for (const subKey in options) {
				filterArr.push({ value: subKey, label: options[subKey] });
			}
			filterArr = filterArr.sort(function (a, b) {
				if (a.label.toLowerCase() < b.label.toLowerCase()) {
					return -1;
				}
				if (a.label.toLowerCase() > b.label.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			filters[key].options = filterArr;
		}
	} catch (e) {
		let errorMessage;
		if (e instanceof Error) {
			errorMessage = e.message;
		} else {
			errorMessage = String(e);
		}
		console.error(errorMessage);
	}

	return { filters: filters };
}

// compare function for sort stats array by order property
const compareOrder = (a: { order: number }, b: { order: number }) => {
	if (a.order < b.order) {
		return -1;
	}
	if (a.order > b.order) {
		return 1;
	}
	return 0;
};


const tableFilterSlice = createSlice({
	name: "tableFilters",
	initialState,
	reducers: {
		editFilterValue(state, action: PayloadAction<{
			filterName: TableFilterState["data"][0]["name"],
			value: TableFilterState["data"][0]["value"],
			resource: Resource
		}>) {
			const { filterName, value, resource } = action.payload;
			state.data = state.data.map(filter => {
				return filter.name === filterName && filter.resource === resource
					? { ...filter, value: value }
					: filter;
			});
		},
		resetFilterValues(state) {
			state.data = state.data.map(filter => {
				return { ...filter, value: "" };
			});
		},
		editTextFilter(state, action: PayloadAction<
			TableFilterState["textFilter"][0]
		>) {
			const textFilter = action.payload;

			const existingIndex = state.textFilter.findIndex(obj => obj.resource === textFilter.resource);

			let updatedItems;
			if (existingIndex !== -1) {
				updatedItems = state.textFilter.map((filter, index) =>
					index === existingIndex ? { ...filter, ...textFilter } : filter,
				);
			} else {
				updatedItems = [...state.textFilter, textFilter];
			}

			state.textFilter = updatedItems;
		},
		removeTextFilter(state, action: PayloadAction<
			TableFilterState["textFilter"][0]["resource"]
		>) {
			state.textFilter = state.textFilter.filter(fil => fil.resource !== action.payload);
		},
		loadFilterProfile(state, action: PayloadAction<
			TableFilterState["data"]
		>) {
			const filterMap = action.payload;
			state.data = filterMap;
		},
		editSelectedFilter(state, action: PayloadAction<
			TableFilterState["selectedFilter"]
		>) {
			const filter = action.payload;
			state.selectedFilter = filter;
		},
		removeSelectedFilter(state) {
			state.selectedFilter = "";
		},
		editSecondFilter(state, action: PayloadAction<
			TableFilterState["secondFilter"]
		>) {
			const filter = action.payload;
			state.secondFilter = filter;
		},
		removeSecondFilter(state) {
			state.secondFilter = "";
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchFilters.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchFilters.fulfilled, (state, action: PayloadAction<{
				filtersList: TableFilterState["data"],
				resource: TableFilterState["currentResource"],
			}>) => {
				state.status = "succeeded";
				const tableFilters = action.payload;
				state.data = tableFilters.filtersList;
				state.currentResource = tableFilters.resource;

			})
			.addCase(fetchFilters.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			})
			.addCase(fetchStats.pending, state => {
				state.statusStats = "loading";
			})
			.addCase(fetchStats.fulfilled, (state, action: PayloadAction<
				TableFilterState["stats"]
			>) => {
				state.statusStats = "succeeded";
				const stats = action.payload;
				state.stats = stats;
			})
			.addCase(fetchStats.rejected, (state, action) => {
				state.statusStats = "failed";
				state.errorStats = action.error;
			});
	},
});

export const {
	editFilterValue,
	resetFilterValues,
	editTextFilter,
	removeTextFilter,
	loadFilterProfile,
	editSelectedFilter,
	removeSelectedFilter,
	editSecondFilter,
	removeSecondFilter,
} = tableFilterSlice.actions;

// Export the slice reducer as the default export
export default tableFilterSlice.reducer;
