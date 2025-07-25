import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { buildThemeBody } from "../utils/resourceUtils";
import { addNotification } from "./notificationSlice";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { ThemeDetailsInitialValues, ThemeDetailsType } from "./themeSlice";

/**
 * This file contains redux reducer for actions affecting the state of a theme
 */
export type Usage = {
	series: {id: string, title: string}[]
}

type ThemeDetailsState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	statusUsage: "uninitialized" | "loading" | "succeeded" | "failed",
	errorUsage: SerializedError | null,
	details: ThemeDetailsType,
	usage: Usage,
};

// Initial state of theme details in redux store
const initialState: ThemeDetailsState = {
	status: "uninitialized",
	error: null,
	statusUsage: "uninitialized",
	errorUsage: null,
	details: {
		bumperActive: false,
		bumperFile: "",
		creationDate: "",
		creator: "",
		default: false,
		description: "",
		id: 0,
		licenseSlideActive: false,
		licenseSlideBackground: "",
		licenseSlideDescription: "",
		name: "",
		titleSlideActive: false,
		titleSlideBackground: "",
		titleSlideMetadata: "",
		trailerActive: false,
		trailerFile: "",
		watermarkActive: false,
		watermarkFile: "",
		watermarkPosition: "",
	},
	usage: { series: [] },
};

// fetch details of certain theme from server
export const fetchThemeDetails = createAppAsyncThunk("themeDetails/fetchThemeDetails", async (id: ThemeDetailsState["details"]["id"]) => {
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get<ThemeDetailsState["details"]>(`/admin-ng/themes/${id}.json`);
	return res.data;
});

// fetch usage of a certain theme
export const fetchUsage = createAppAsyncThunk("themeDetails/fetchUsage", async (id: ThemeDetailsState["details"]["id"]) => {
	const res = await axios.get<ThemeDetailsState["usage"]>(`/admin-ng/themes/${id}/usage.json`);
	return res.data;
});

// update a certain theme
export const updateThemeDetails = createAppAsyncThunk("themeDetails/updateThemeDetails", async (params: {
	id: ThemeDetailsState["details"]["id"],
	values: ThemeDetailsInitialValues
}, { dispatch }) => {
	const { values, id } = params;
	const data = buildThemeBody(values);

	// request for updating
	axios
		.put(`/admin-ng/themes/${id}`, data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(response => {
			console.info(response);
			dispatch(addNotification({ type: "success", key: "THEME_CREATED" }));
		})
		.catch(response => {
			console.error(response);
			dispatch(addNotification({ type: "error", key: "THEME_NOT_CREATED" }));
		});
});

const themeDetailsSlice = createSlice({
	name: "themeDetails",
	initialState,
	reducers: {},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchThemeDetails.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchThemeDetails.fulfilled, (state, action: PayloadAction<
				ThemeDetailsState["details"]
			>) => {
				state.status = "succeeded";
				const themeDetails = action.payload;
				state.details = themeDetails;
			})
			.addCase(fetchThemeDetails.rejected, (state, action) => {
				state.status = "failed";
				state.details = {
					bumperActive: false,
					bumperFile: "",
					creationDate: "",
					creator: "",
					default: false,
					description: "",
					id: 0,
					licenseSlideActive: false,
					licenseSlideBackground: "",
					licenseSlideDescription: "",
					name: "",
					titleSlideActive: false,
					titleSlideBackground: "",
					titleSlideMetadata: "",
					trailerActive: false,
					trailerFile: "",
					watermarkActive: false,
					watermarkFile: "",
					watermarkPosition: "",
				};
				state.error = action.error;
			})
			.addCase(fetchUsage.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchUsage.fulfilled, (state, action: PayloadAction<
				ThemeDetailsState["usage"]
			>) => {
				state.status = "succeeded";
				const usage = action.payload;
				state.usage = usage;
			})
			.addCase(fetchUsage.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			});
	},
});

// export const {} = aclsSlice.actions;

// Export the slice reducer as the default export
export default themeDetailsSlice.reducer;
