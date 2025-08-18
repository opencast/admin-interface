import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import _ from "lodash";
import {
	getSeriesDetailsExtendedMetadata,
	getStatistics,
} from "../selectors/seriesDetailsSelectors";
import { addNotification } from "./notificationSlice";
import {
	transformMetadataCollection,
	transformMetadataForUpdate,
} from "../utils/resourceUtils";
import { transformToIdValueArray } from "../utils/utils";
import { NOTIFICATION_CONTEXT, NOTIFICATION_CONTEXT_TOBIRA } from "../configs/modalConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { Acl } from "./aclSlice";
import { DataResolution, Statistics, TimeMode, fetchStatistics, fetchStatisticsValueUpdate } from "./statisticsSlice";
import { TransformedAcl } from "./aclDetailsSlice";
import { MetadataCatalog } from "./eventSlice";
import { Series, TobiraPage } from "./seriesSlice";
import { TobiraTabHierarchy } from "../components/events/partials/ModalTabsAndPages/DetailsTobiraTab";
import { TobiraFormProps } from "../components/events/partials/ModalTabsAndPages/NewTobiraPage";
import { handleTobiraError } from "./shared/tobiraErrors";
import { AppThunk } from "../store";


/**
 * This file contains redux reducer for actions affecting the state of a series
 */
export type TobiraData = {
	baseURL: string,
	id: string,
	hostPages: TobiraPage[],
};

type SeriesDetailsState = {
	statusMetadata: "uninitialized" | "loading" | "succeeded" | "failed",
	errorMetadata: SerializedError | null,
	statusAcl: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAcl: SerializedError | null,
	statusTheme: "uninitialized" | "loading" | "succeeded" | "failed",
	errorTheme: SerializedError | null,
	statusThemeNames: "uninitialized" | "loading" | "succeeded" | "failed",
	errorThemeNames: SerializedError | null,
	statusStatistics: "uninitialized" | "loading" | "succeeded" | "failed",
	errorStatistics: SerializedError | null,
	statusStatisticsValue: "uninitialized" | "loading" | "succeeded" | "failed",
	errorStatisticsValue: SerializedError | null,
	statusTobiraData: "uninitialized" | "loading" | "succeeded" | "failed",
	errorTobiraData: SerializedError | null,
  	metadata: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	acl: TransformedAcl[],
	policyTemplateId: number,
	theme: { id: string, value: string } | null,
	themeNames: { id: string, value: string }[],
	fetchingStatisticsInProgress: boolean,
	statistics: Statistics[],
	hasStatisticsError: boolean,
	tobiraTab: TobiraTabHierarchy,
	tobiraData: TobiraData,
}

// Initial state of series details in redux store
const initialState: SeriesDetailsState = {
	statusMetadata: "uninitialized",
	errorMetadata: null,
	statusAcl: "uninitialized",
	errorAcl: null,
	statusTheme: "uninitialized",
	errorTheme: null,
	statusThemeNames: "uninitialized",
	errorThemeNames: null,
	statusStatistics: "uninitialized",
	errorStatistics: null,
	statusStatisticsValue: "uninitialized",
	errorStatisticsValue: null,
	statusTobiraData: "uninitialized",
	errorTobiraData: null,
	metadata: {
		title: "",
		flavor: "",
		fields: [],
	},
	extendedMetadata: [],
	acl: [],
	policyTemplateId: 0,
	theme: null,
	themeNames: [],
	fetchingStatisticsInProgress: false,
	statistics: [],
	hasStatisticsError: false,
	tobiraTab: "main",
	tobiraData: {
		baseURL: "",
		id: "",
		hostPages: [],
	},
};

// fetch metadata of certain series from server
export const fetchSeriesDetailsMetadata = createAppAsyncThunk("seriesDetails/fetchSeriesDetailsMetadata", async (id: Series["id"], { rejectWithValue }) => {
	const res = await axios.get<MetadataCatalog[]>(`/admin-ng/series/${id}/metadata.json`);
	const metadataResponse = res.data;

	const mainCatalog = "dublincore/series";
	let seriesMetadata: SeriesDetailsState["metadata"] | undefined = undefined;
	const extendedMetadata: SeriesDetailsState["extendedMetadata"] = [];

	for (const catalog of metadataResponse) {
		if (catalog.flavor === mainCatalog) {
			seriesMetadata = transformMetadataCollection({ ...catalog });
		} else {
			extendedMetadata.push(transformMetadataCollection({ ...catalog }));
		}
	}

	if (!seriesMetadata) {
		console.error("Main metadata catalog is missing");
		return rejectWithValue("Main metadata catalog is missing");
	}

	return { seriesMetadata, extendedMetadata };
});

// fetch acls of certain series from server
export const fetchSeriesDetailsAcls = createAppAsyncThunk("seriesDetails/fetchSeriesDetailsAcls", async (id: Series["id"], { dispatch }) => {
	type FetchSeriesDetailsAcl = {
		series_access: {
			acl: Omit<TransformedAcl, "user">[]
			current_acl: number
			locked: boolean
		},
	}
	const res = await axios.get<FetchSeriesDetailsAcl>(`/admin-ng/series/${id}/access.json`);
	const response = res.data;

	if (response.series_access.locked) {
		dispatch(
			addNotification({
				type: "warning",
				key: "SERIES_ACL_LOCKED",
				duration: -1,
				context: NOTIFICATION_CONTEXT,
				noDuplicates: true,
			}),
		);
	}

	return { acl: response.series_access.acl, currentAcl: response.series_access.current_acl };
});

// fetch theme of certain series from server
export const fetchSeriesDetailsTheme = createAppAsyncThunk("seriesDetails/fetchSeriesDetailsTheme", async (id: Series["id"]) => {
	const res = await axios.get<{ [key: string]: string }>(`/admin-ng/series/${id}/theme.json`);
	const themeResponse = res.data;

	let seriesTheme: SeriesDetailsState["theme"] = null;

	// check if series has a theme
	if (!_.isEmpty(themeResponse)) {
		// transform response for further use
		seriesTheme = transformToIdValueArray(themeResponse)[0];
	}

	return seriesTheme;
});

// fetch names of possible themes from server
export const fetchSeriesDetailsThemeNames = createAppAsyncThunk("seriesDetails/fetchSeriesDetailsThemeNames", async () => {
	const res = await axios.get<{ [key: string]: string }>("/admin-ng/resources/THEMES.NAME.json");
	const response = res.data;

	// transform response for further use
	const themeNames = transformToIdValueArray(response);

	return themeNames;
});

// update series with new metadata
export const updateSeriesMetadata = createAppAsyncThunk("seriesDetails/updateSeriesMetadata", async (params: {
	id: Series["id"],
	values: { [key: string]: MetadataCatalog["fields"][0]["value"] }
	catalog: MetadataCatalog,
}, { dispatch }) => {
	const { id, values, catalog } = params;

	const { fields, data, headers } = transformMetadataForUpdate(
		catalog,
		values,
	);

	await axios.put(`/admin-ng/series/${id}/metadata`, data, headers);

	// updated metadata in series details redux store
	const seriesMetadata = {
		flavor: catalog.flavor,
		title: catalog.title,
		fields: fields,
	};
	dispatch(setSeriesDetailsMetadata(seriesMetadata));
});

// update series with new metadata
export const updateExtendedSeriesMetadata = createAppAsyncThunk("seriesDetails/updateExtendedSeriesMetadata", async (params: {
	id: Series["id"],
	values: { [key: string]: MetadataCatalog["fields"][0]["value"] }
	catalog: MetadataCatalog,
}, { dispatch, getState }) => {
	const { id, values, catalog } = params;

	const { fields, data, headers } = transformMetadataForUpdate(
		catalog,
		values,
	);

	await axios.put(`/admin-ng/series/${id}/metadata`, data, headers);

	// updated metadata in series details redux store
	const seriesMetadata = {
		flavor: catalog.flavor,
		title: catalog.title,
		fields: fields,
	};

	const oldExtendedMetadata = getSeriesDetailsExtendedMetadata(getState());
	const newExtendedMetadata = [];

	for (const catalog of oldExtendedMetadata) {
		if (
			catalog.flavor === seriesMetadata.flavor &&
			catalog.title === seriesMetadata.title
		) {
			newExtendedMetadata.push(seriesMetadata);
		} else {
			newExtendedMetadata.push(catalog);
		}
	}

	dispatch(setSeriesDetailsExtendedMetadata(newExtendedMetadata));
});

export const updateSeriesAccess = createAppAsyncThunk("seriesDetails/updateSeriesAccess", async (
	params: {
		id: Series["id"],
		policies: { acl: Acl },
		override?: boolean
	}, { dispatch }) => {
	const { id, policies, override } = params;

	const data = new URLSearchParams();

	const overrideString = override ? String(true) : String(false);

	data.append("acl", JSON.stringify(policies));
	data.append("override", overrideString);

	return axios
		.post(`/admin-ng/series/${id}/access`, data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(res => {
			console.info(res);
			dispatch(
				addNotification({
					type: "info",
					key: "SAVED_ACL_RULES",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			return true;
		})
		.catch(res => {
			console.error(res);
			dispatch(
				addNotification({
					type: "error",
					key: "ACL_NOT_SAVED",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			return false;
		});
});

export const updateSeriesTheme = (params: {
	id: string,
	values: { theme: SeriesDetailsState["theme"] },
}): AppThunk => dispatch => {
	const { id, values } = params;

	const themeId = values.theme?.id;

	if (!themeId || themeId === "") {
		axios
			.delete(`/admin-ng/series/${id}/theme`)
			.then(() => {
				dispatch(setSeriesDetailsTheme(values.theme));
				dispatch(
					addNotification({
						type: "warning",
						key: "SERIES_THEME_REPROCESS_EXISTING_EVENTS",
						duration: 10,
						context: NOTIFICATION_CONTEXT,
					}),
				);
			})
			.catch(response => {
				console.error(response);
			});
	} else {
		const data = new URLSearchParams();
		data.append("themeId", themeId);

		axios
			.put<{ [key: string]: string }>(`/admin-ng/series/${id}/theme`, data)
			.then(response => {
				const themeResponse = response.data;

				const seriesTheme = transformToIdValueArray(themeResponse)[0];

				dispatch(setSeriesDetailsTheme(seriesTheme));
				dispatch(
					addNotification({
						type: "warning",
						key: "SERIES_THEME_REPROCESS_EXISTING_EVENTS",
						duration: 10,
						context: NOTIFICATION_CONTEXT,
					}),
				);
			})
			.catch(response => {
				console.error(response);
			});
	}
};

// fetch Tobira data of certain series from server
export const fetchSeriesDetailsTobira = createAppAsyncThunk("seriesDetails/fetchSeriesDetailsTobira", async (
	id: Series["id"],
	{ dispatch },
) => {
	const res = await axios.get<SeriesDetailsState["tobiraData"]>(`/admin-ng/series/${id}/tobira/pages`)
		.catch((error: AxiosError) => handleTobiraError(error, dispatch));

	if (!res) {
		throw new Error();
	}

	const data = res.data;
	return data;
});

export const updateSeriesTobiraPath = createAppAsyncThunk("series/updateSeriesTobiraData", async (
	params: TobiraFormProps & { seriesId: Series["id"] },
	{ dispatch },
) => {
	const tobiraParams = new URLSearchParams();
	const pathComponents = params.breadcrumbs.slice(1).map(crumb => ({
		name: crumb.title,
		pathSegment: crumb.segment,
	}));

	if (params.selectedPage) {
		pathComponents.push({
			// Passing a dummy value here so Tobira won't freak out.
			name: params.selectedPage.title ?? "dummy",
			pathSegment: params.selectedPage.segment,
		});

		tobiraParams.append("pathComponents", JSON.stringify(pathComponents));
		tobiraParams.append("targetPath", params.selectedPage.path);
	}

	if (params.currentPath) {
		tobiraParams.append("currentPath", params.currentPath);
	}

	try {
		const response = await axios.post<unknown>(`/admin-ng/series/${params.seriesId}/tobira/path`, tobiraParams.toString(), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		console.info(response);
		dispatch(addNotification({
			type: "success",
			key: "SERIES_PATH_UPDATED",
			context: NOTIFICATION_CONTEXT_TOBIRA,
		}));

		return response.data;
	} catch (error) {
		console.error(error);
		dispatch(addNotification({
			type: "error",
			key: "SERIES_PATH_NOT_UPDATED",
			context: NOTIFICATION_CONTEXT_TOBIRA,
		}));
		throw error;
	}
});

export const removeSeriesTobiraPath = createAppAsyncThunk("series/removeSeriesTobiraData", async (
	params: Required<Pick<TobiraFormProps, "currentPath">> & { seriesId: Series["id"] },
	{ dispatch },
) => {
	const path = encodeURIComponent(params.currentPath);

	try {
		const response = await axios.delete<unknown>(
			`/admin-ng/series/${params.seriesId}/tobira/${path}`,
		);

		console.info(response);
		dispatch(addNotification({
			type: "success",
			key: "SERIES_PATH_REMOVED",
			context: NOTIFICATION_CONTEXT_TOBIRA,
		}));

		return response.data;
	} catch (error) {
		console.error(error);
		dispatch(addNotification({
			type: "error",
			key: "SERIES_PATH_NOT_REMOVED",
			context: NOTIFICATION_CONTEXT_TOBIRA,
		}));
		throw error;
	}
});

// thunks for statistics
export const fetchSeriesStatistics = createAppAsyncThunk("seriesDetails/fetchSeriesStatistics", async (seriesId: Series["id"], { getState }) => {
	// get prior statistics
	const state = getState();
	const statistics = getStatistics(state);

	return await (
		fetchStatistics(
			seriesId,
			"series",
			statistics,
		)
	);
});

export const fetchSeriesStatisticsValueUpdate = createAppAsyncThunk("seriesDetails/fetchSeriesStatisticsValueUpdate", async (params: {
	id: Series["id"],
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

	return await (
		fetchStatisticsValueUpdate(
			id,
			"series",
			providerId,
			from,
			to,
			dataResolution,
			timeMode,
			statistics,
		)
	);
});

// Reducer for series details
const seriesDetailsSlice = createSlice({
	name: "seriesDetails",
	initialState,
	reducers: {
		setSeriesDetailsTheme(state, action: PayloadAction<
			SeriesDetailsState["theme"]
		>) {
			state.theme = action.payload;
		},
		setSeriesDetailsMetadata(state, action: PayloadAction<
			SeriesDetailsState["metadata"]
		>) {
			state.metadata = action.payload;
		},
		setSeriesDetailsExtendedMetadata(state, action: PayloadAction<
			SeriesDetailsState["extendedMetadata"]
		>) {
			state.extendedMetadata = action.payload;
		},
		setSeriesStatisticsError(state, action: PayloadAction<
			SeriesDetailsState["hasStatisticsError"]
		>) {
			state.hasStatisticsError = action.payload;
		},
		setSeriesStatistics(state, action: PayloadAction<
			SeriesDetailsState["statistics"]
		>) {
			state.statistics = action.payload;
		},
		setTobiraTabHierarchy(state, action: PayloadAction<
			SeriesDetailsState["tobiraTab"]
		>) {
			state.tobiraTab = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchSeriesDetailsMetadata.pending, state => {
				state.statusMetadata = "loading";
			})
			.addCase(fetchSeriesDetailsMetadata.fulfilled, (state, action: PayloadAction<{
				seriesMetadata: SeriesDetailsState["metadata"],
				extendedMetadata: SeriesDetailsState["extendedMetadata"],
			}>) => {
				state.statusMetadata = "succeeded";
				const seriesDetails = action.payload;
				state.metadata = seriesDetails.seriesMetadata;
				state.extendedMetadata = seriesDetails.extendedMetadata;
			})
			.addCase(fetchSeriesDetailsMetadata.rejected, (state, action) => {
				state.statusMetadata = "failed";
				state.errorMetadata = action.error;
			})
			.addCase(fetchSeriesDetailsAcls.pending, state => {
				state.statusAcl = "loading";
			})
			.addCase(fetchSeriesDetailsAcls.fulfilled, (state, action: PayloadAction<{
				acl: SeriesDetailsState["acl"],
				currentAcl: SeriesDetailsState["policyTemplateId"]
			}>) => {
				state.statusAcl = "succeeded";
				const seriesDetailsAcls = action.payload;
				state.acl = seriesDetailsAcls.acl;
				state.policyTemplateId = seriesDetailsAcls.currentAcl;
			})
			.addCase(fetchSeriesDetailsAcls.rejected, (state, action) => {
				state.statusAcl = "failed";
				state.errorAcl = action.error;
			})
			.addCase(fetchSeriesDetailsTheme.pending, state => {
				state.statusTheme = "loading";
			})
			.addCase(fetchSeriesDetailsTheme.fulfilled, (state, action: PayloadAction<
				SeriesDetailsState["theme"]
			>) => {
				state.statusTheme = "succeeded";
				const seriesDetailsTheme = action.payload;
				state.theme = seriesDetailsTheme;
			})
			.addCase(fetchSeriesDetailsTheme.rejected, (state, action) => {
				state.statusTheme = "failed";
				state.errorTheme = action.error;
			})
			.addCase(fetchSeriesDetailsThemeNames.pending, state => {
				state.statusThemeNames = "loading";
			})
			.addCase(fetchSeriesDetailsThemeNames.fulfilled, (state, action: PayloadAction<
				SeriesDetailsState["themeNames"]
			>) => {
				state.statusThemeNames = "succeeded";
				const seriesDetailsThemeNames = action.payload;
				state.themeNames = seriesDetailsThemeNames;
			})
			.addCase(fetchSeriesDetailsThemeNames.rejected, (state, action) => {
				state.statusThemeNames = "failed";
				state.errorThemeNames = action.error;
			})
			.addCase(fetchSeriesDetailsTobira.pending, state => {
				state.statusTobiraData = "loading";
			})
			.addCase(fetchSeriesDetailsTobira.fulfilled, (state, action: PayloadAction<
				SeriesDetailsState["tobiraData"]
			>) => {
				state.errorTobiraData = null;
				state.statusTobiraData = "succeeded";
				state.tobiraData = action.payload;
			})
			.addCase(fetchSeriesDetailsTobira.rejected, (state, action) => {
				state.statusTobiraData = "failed";
				state.errorTobiraData = action.error;
			})
			.addCase(fetchSeriesStatistics.pending, state => {
				state.statusStatistics = "loading";
			})
			.addCase(fetchSeriesStatistics.fulfilled, (state, action: PayloadAction<{
				statistics: SeriesDetailsState["statistics"],
				hasError: SeriesDetailsState["hasStatisticsError"]
			}>) => {
				state.statusStatistics = "succeeded";
				const seriesDetailsStatistics = action.payload;
				state.statistics = seriesDetailsStatistics.statistics;
				state.hasStatisticsError = seriesDetailsStatistics.hasError;
			})
			.addCase(fetchSeriesStatistics.rejected, (state, action) => {
				state.statusStatistics = "failed";
				state.errorStatistics = action.error;
			})
			.addCase(fetchSeriesStatisticsValueUpdate.pending, state => {
				state.statusStatisticsValue = "loading";
			})
			.addCase(fetchSeriesStatisticsValueUpdate.fulfilled, (state, action: PayloadAction<
				SeriesDetailsState["statistics"]
			>) => {
				state.statusStatisticsValue = "succeeded";
				state.statistics = action.payload;
			})
			.addCase(fetchSeriesStatisticsValueUpdate.rejected, (state, action) => {
				state.statusStatisticsValue = "failed";
				state.errorStatisticsValue = action.error;
			});
	},
});

export const {
	setSeriesDetailsTheme,
	setSeriesDetailsMetadata,
	setSeriesDetailsExtendedMetadata,
	setSeriesStatisticsError,
	setSeriesStatistics,
	setTobiraTabHierarchy,
} = seriesDetailsSlice.actions;

// Export the slice reducer as the default export
export default seriesDetailsSlice.reducer;
