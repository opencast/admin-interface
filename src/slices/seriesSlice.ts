import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { seriesTableConfig } from "../configs/tableConfigs/seriesTableConfig";
import axios, { AxiosError } from "axios";
import {
	getURLParams,
	prepareAccessPolicyRulesForPost,
	prepareMetadataFieldsForPost,
	transformMetadataCollection,
} from "../utils/resourceUtils";
import {
	transformToIdValueArray,
} from "../utils/utils";
import { addNotification } from "./notificationSlice";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { TransformedAcl } from "./aclDetailsSlice";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { MetadataCatalog } from "./eventSlice";
import { handleTobiraError } from "./shared/tobiraErrors";

/**
 * This file contains redux reducer for actions affecting the state of series
 */
type FetchSeries = {
	total: SeriesState["total"],
	count: SeriesState["count"],
	limit: SeriesState["limit"],
	offset: SeriesState["offset"],
	results: SeriesState["results"],
};

export type Series = {
	contributors: string[],
	createdBy?: string,
	creation_date?: string,
	id: string,
	language?: string,
	license?: string,
	managedAcl?: string,
	organizers: string[],
	rightsHolder?: string,
	title: string,
}

type Theme = {
	description: string,
	id: string,
	name: string,
}

export interface TobiraPage {
	title?: string,
	path: string,
	segment: string,
	children: TobiraPage[],
	ancestors: TobiraPage[]

	subpages?: string,  // not returned by endpoint
	new?: boolean,      // not returned by endpoint
	blocks: {
		id: string,
	}[],
}

type SeriesState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	statusMetadata: "uninitialized" | "loading" | "succeeded" | "failed",
	errorMetadata: SerializedError | null,
	statusThemes: "uninitialized" | "loading" | "succeeded" | "failed",
	errorThemes: SerializedError | null,
	statusTobiraPage: "uninitialized" | "loading" | "succeeded" | "failed",
	errorTobiraPage: SerializedError | null,
	results: Series[],
	columns: TableConfig["columns"],
	showActions: boolean,
	total: number,
	count: number,
	offset: number,
	limit: number,
	metadata: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	themes: Theme[],
	deletionAllowed: boolean,
	hasEvents: boolean,
	tobiraPage: TobiraPage,
}

// Fill columns initially with columns defined in seriesTableConfig
const initialColumns = seriesTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of series in redux store
const initialState: SeriesState = {
	status: "uninitialized",
	error: null,
	statusMetadata: "uninitialized",
	errorMetadata: null,
	statusThemes: "uninitialized",
	errorThemes: null,
	statusTobiraPage: "uninitialized",
	errorTobiraPage: null,
	results: [],
	columns: initialColumns,
	showActions: false,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
	metadata: {
		title: "",
		flavor: "",
		fields: [],
	},
	extendedMetadata: [],
	themes: [],
	deletionAllowed: true,
	hasEvents: false,
	tobiraPage: {
		title: undefined,
		path: "/",
		segment: "",
		children: [],
		ancestors: [],
		blocks: [],
	},
};

// fetch series from server
export const fetchSeries = createAppAsyncThunk("series/fetchSeries", async (_, { getState }) => {
	const state = getState();
	const params = getURLParams(state, "series");
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	// /series.json?sortorganizer={sortorganizer}&sort={sort}&filter={filter}&offset=0&limit=100
	const res = await axios.get<FetchSeries>("/admin-ng/series/series.json", { params: params });
	return res.data;
});

// fetch series metadata from server
export const fetchSeriesMetadata = createAppAsyncThunk("series/fetchSeriesMetadata", async (_, { rejectWithValue }) => {
	const res = await axios.get<MetadataCatalog[]>("/admin-ng/series/new/metadata");
	const data = res.data;

	const mainCatalog = "dublincore/series";
	let metadata: SeriesState["metadata"] | undefined = undefined;
	const extendedMetadata = [];

	for (const metadataCatalog of data) {
		if (metadataCatalog.flavor === mainCatalog) {
			metadata = transformMetadataCollection({ ...metadataCatalog });
		} else {
			extendedMetadata.push(
				transformMetadataCollection({ ...metadataCatalog }),
			);
		}
	}

	if (!metadata) {
		console.error("Main metadata catalog is missing");
		return rejectWithValue("Main metadata catalog is missing");
	}

	return { metadata, extendedMetadata };
});

// fetch series themes from server
export const fetchSeriesThemes = createAppAsyncThunk("series/fetchSeriesThemes", async () => {
	const res = await axios.get("/admin-ng/series/new/themes");
	const data = await res.data as { [key: string]: { name: string, description: string } };
	// Transform object of objects to array of objects
	const themes = Object.keys(data).map(key => {
		return {
			id: key,
			...data[key],
		};
	});
	return themes;
});

// post new series to backend
export const postNewSeries = createAppAsyncThunk("series/postNewSeries", async (params: {
	values: {
		[key: string]: any;
		policies: TransformedAcl[],
		// contributor: string[],
		// creator: string[],
		// description: string,
		// language: string,
		// license: string,
		// publisher: string[],
		// rightsHolder: string,
		// subject: string,
		theme: string,
		// title: string,
		selectedPage?: TobiraPage,
		breadcrumbs?: TobiraPage[],
	},
	metadataInfo: MetadataCatalog,
	extendedMetadata: MetadataCatalog[]
}, { dispatch }) => {
	const { values, metadataInfo, extendedMetadata } = params;

	// prepare metadata provided by user
	const metadata = prepareMetadataFieldsForPost(
		[metadataInfo],
		values,
	);
	const extendedMetadataCatalogs = prepareMetadataFieldsForPost(
		extendedMetadata,
		values,
	);

	// metadata for post request
	for (const entry of extendedMetadataCatalogs) {
		metadata.push(entry);
	}

	const access = prepareAccessPolicyRulesForPost(values.policies);

	// Tobira
	const tobira: any = {};
	if (values.selectedPage && values.breadcrumbs) {
		const existingPages: any[] = [];
		const newPages: any[] = [];
		values.breadcrumbs.concat(values.selectedPage).forEach(function (page: TobiraPage) {
			if (page.new) {
				newPages.push({
					name: page.title,
					pathSegment: page.segment,
				});
			} else {
				existingPages.push(page);
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		tobira["parentPagePath"] = existingPages.pop().path;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		tobira["newPages"] = newPages;
	}


	let jsonData: {
		metadata: typeof metadata,
		options: unknown,
		access: typeof access,
		theme?: number,
		tobira?: any
	} = {
		metadata: metadata,
		options: {},
		access: access,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		tobira: tobira,
	};

	if (values.theme !== "") {
		jsonData = {
			...jsonData,
			theme: parseInt(values.theme),
		};
	}

	const data = new URLSearchParams();
	data.append("metadata", JSON.stringify(jsonData));

	// Todo: process bar notification
	axios
		.post("/admin-ng/series/new", data.toString(), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(response => {
			console.info(response);
			dispatch(addNotification({ type: "success", key: "SERIES_ADDED" }));
		})
		.catch(response => {
			console.error(response);
			dispatch(addNotification({ type: "error", key: "SERIES_NOT_SAVED" }));
		});
});

// check for events of the series and if deleting the series if it has events is allowed
export const checkForEventsDeleteSeriesModal = createAppAsyncThunk("series/checkForEventsDeleteSeriesModal", async (id: Series["id"], { dispatch }) => {
	const hasEventsRequest = await axios.get<{ hasEvents: boolean }>(
		`/admin-ng/series/${id}/hasEvents.json`,
	);
	const hasEventsResponse = hasEventsRequest.data;
	const hasEvents = hasEventsResponse.hasEvents;

	const deleteWithEventsAllowedRequest = await axios.get<{ deleteSeriesWithEventsAllowed: boolean }>(
		"/admin-ng/series/configuration.json",
	);
	const deleteWithEventsAllowedResponse = deleteWithEventsAllowedRequest.data;
	const deleteWithEventsAllowed =
		deleteWithEventsAllowedResponse.deleteSeriesWithEventsAllowed;

	dispatch(
		setSeriesDeletionAllowed({ deletionAllowed: !hasEvents || deleteWithEventsAllowed, hasEvents: hasEvents }),
	);
});

// delete series with provided id
export const deleteSeries = createAppAsyncThunk("series/deleteSeries", async (id: Series["id"], { dispatch }) => {
	// API call for deleting a series
	axios
		.delete(`/admin-ng/series/${id}`)
		.then(res => {
			console.info(res);
			// add success notification
			dispatch(addNotification({ type: "success", key: "SERIES_DELETED" }));
		})
		.catch(res => {
			console.error(res);
			// add error notification
			dispatch(addNotification({ type: "error", key: "SERIES_NOT_DELETED" }));
		});
});

// delete series with provided ids
export const deleteMultipleSeries = createAppAsyncThunk("series/deleteMultipleSeries", async (
	series: {
		contributors: string[],
		createdBy: string,
		creation_date: string,
		hasEvents: false,
		id: string,
		organizers: string[],
		selected: boolean,
		title: string,
	}[],
{ dispatch }) => {
	const data = [];

	for (let i = 0; i < series.length; i++) {
		if (series[i].selected) {
			data.push(series[i].id);
		}
	}

	axios
		.post("/admin-ng/series/deleteSeries", data)
		.then(res => {
			console.info(res);
			// add success notification
			dispatch(addNotification({ type: "success", key: "SERIES_DELETED" }));
		})
		.catch((error: AxiosError) => {
			console.error(error);
			// add error notification
			dispatch(addNotification({ type: "error", key: "SERIES_NOT_DELETED" }));
		});
});

// fetch metadata of certain series from server
export const fetchSeriesDetailsTobiraNew = createAppAsyncThunk("seriesDetails/fetchSeriesDetailsTobiraNew", async (path: TobiraPage["path"], { dispatch }) => {
	const res = await axios.get<TobiraPage>("/admin-ng/series/new/tobira/page?path=" + path)
		.catch((error: AxiosError) => handleTobiraError(error, dispatch));

	if (!res) {
		throw new Error();
	}

	const data = res.data;
	return data;
});

// Get names and ids of selectable series
export const fetchSeriesOptions = async () => {
	const data = await axios.get<{ [key: string]: string }>("/admin-ng/resources/SERIES.json");

	const response = data.data;

	const seriesCollection = [];
	for (const series of transformToIdValueArray(response)) {
		seriesCollection.push({ value: series.id, name: series.value });
	}

	return seriesCollection;
};

// Check if a series has events
export const hasEvents = async (seriesId: Series["id"]) => {
	const data = await axios.get<{ hasEvents: boolean }>(`/admin-ng/series/${seriesId}/hasEvents.json`);

	return (data.data).hasEvents;
};

// Get series configuration and flag indicating if series with events is allowed to delete
export const getSeriesConfig = async () => {
	const data = await axios.get<{ deleteSeriesWithEventsAllowed: boolean }>("/admin-ng/series/configuration.json");

	const response = data.data;

	return !!response.deleteSeriesWithEventsAllowed;
};

const seriesSlice = createSlice({
	name: "series",
	initialState,
	reducers: {
		setSeriesColumns(state, action: PayloadAction<
			SeriesState["columns"]
		>) {
			state.columns = action.payload;
		},
		showActionsSeries(state, action: PayloadAction<
			SeriesState["showActions"]
		>) {
			state.showActions = action.payload;
		},
		setSeriesDeletionAllowed(state, action: PayloadAction<{
			deletionAllowed: SeriesState["deletionAllowed"],
			hasEvents: SeriesState["hasEvents"],
		}>) {
			state.deletionAllowed = action.payload.deletionAllowed;
			state.hasEvents = action.payload.hasEvents;
		},
		setTobiraPage(state, action: PayloadAction<
			SeriesState["tobiraPage"]
		>) {
			state.tobiraPage = action.payload;
		},
		setErrorTobiraPage(state, action: PayloadAction<
			SeriesState["errorTobiraPage"]
		>) {
			state.errorTobiraPage = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchSeries.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchSeries.fulfilled, (state, action: PayloadAction<FetchSeries>) => {
				state.status = "succeeded";
				const series = action.payload;
				state.total = series.total;
				state.count = series.count;
				state.limit = series.limit;
				state.offset = series.offset;
				state.results = series.results;
			})
			.addCase(fetchSeries.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			})
			.addCase(fetchSeriesMetadata.pending, state => {
				state.statusMetadata = "loading";
			})
			.addCase(fetchSeriesMetadata.fulfilled, (state, action: PayloadAction<{
				metadata: SeriesState["metadata"],
				extendedMetadata: SeriesState["extendedMetadata"],
			}>) => {
				state.statusMetadata = "succeeded";
				const seriesMetadata = action.payload;
				state.metadata = seriesMetadata.metadata;
				state.extendedMetadata = seriesMetadata.extendedMetadata;
			})
			.addCase(fetchSeriesMetadata.rejected, (state, action) => {
				state.statusMetadata = "failed";
				state.extendedMetadata = [];
				state.errorMetadata = action.error;
			})
			.addCase(fetchSeriesThemes.pending, state => {
				state.statusThemes = "loading";
			})
			.addCase(fetchSeriesThemes.fulfilled, (state, action: PayloadAction<
				SeriesState["themes"]
			>) => {
				state.statusThemes = "succeeded";
				const seriesThemes = action.payload;
				state.themes = seriesThemes;
			})
			.addCase(fetchSeriesThemes.rejected, (state, action) => {
				state.statusThemes = "failed";
				state.errorThemes = action.error;
			})
			.addCase(fetchSeriesDetailsTobiraNew.pending, state => {
				state.statusTobiraPage = "loading";
			})
			.addCase(fetchSeriesDetailsTobiraNew.fulfilled, (state, action: PayloadAction<
				SeriesState["tobiraPage"]
			>) => {
				state.statusTobiraPage = "succeeded";
				state.tobiraPage = action.payload;
			})
			.addCase(fetchSeriesDetailsTobiraNew.rejected, (state, action) => {
				state.statusTobiraPage = "failed";
				state.errorTobiraPage = action.error;
			});
	},
});

export const {
	setSeriesColumns,
	showActionsSeries,
	setSeriesDeletionAllowed,
	setTobiraPage,
	setErrorTobiraPage,
} = seriesSlice.actions;

// Export the slice reducer as the default export
export default seriesSlice.reducer;
