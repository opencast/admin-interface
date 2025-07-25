import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { recordingsTableConfig } from "../configs/tableConfigs/recordingsTableConfig";
import axios, { AxiosError } from "axios";
import { getURLParams } from "../utils/resourceUtils";
import { addNotification } from "./notificationSlice";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of recordings
 */
export type Recording = {
	id: string,
	inputs: { id: string, value: string }[],
	name: string,
	removable: boolean,
	status: string,
	type: string,
	updated: string,
	url: string,
}

type RecordingState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	results: Recording[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
}

// Fill columns initially with columns defined in recordingsTableConfig
const initialColumns = recordingsTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of recordings in redux store
const initialState: RecordingState = {
	status: "uninitialized",
	error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
};

// fetch recordings from server
export const fetchRecordings = createAppAsyncThunk("recordings/fetchRecordings", async (flag: string | undefined, { getState }) => {
	type Results = {
		Name: string,
		Status: string,
		Update: string,
		URL: string,
		inputs?: { id: string, value: string }[],
	};
	type FetchRecordings = {
		results: Results[],
		total: number,
		count: number,
		offset: number,
		limit: number,
	}
	let res;

	if (flag === "inputs") {
		res = await axios.get<FetchRecordings>(
			"/admin-ng/capture-agents/agents.json?inputs=true",
			);
	} else {
		const state = getState();
		const params = getURLParams(state, "recordings");

		// /agents.json?filter={filter}&limit=100&offset=0&inputs=false&sort={sort}
		res = await axios.get<FetchRecordings>("/admin-ng/capture-agents/agents.json", {
			params: params,
		});
	}

	const recordings: FetchRecordings = res.data;

	const captureAgents = [];

	for (const agent of recordings.results) {
		const transformedAgent = {
			id: agent.Name,
			name: agent.Name,
			status: agent.Status,
			updated: agent.Update,
			inputs: agent.inputs ? [...agent.inputs] : [],
			type: "LOCATION",
			url: agent.URL ? agent.URL : "",
			removable:
				"AGENTS.STATUS.OFFLINE" === agent.Status ||
				"AGENTS.STATUS.UNKNOWN" === agent.Status,
			};

		captureAgents.push(transformedAgent);
	}

	return { ...recordings, results: captureAgents };
});

// delete location with provided id
export const deleteRecording = createAppAsyncThunk("recordings/deleteRecording", async (id: Recording["id"], { dispatch }) => {
	// API call for deleting a location
	axios
		.delete(`/admin-ng/capture-agents/${id}`)
		.then(res => {
			console.info(res);
			// add success notification
			dispatch(addNotification({ type: "success", key: "LOCATION_DELETED" }));
		})
		.catch((error: AxiosError) => {
			console.error(error);
			// add error notification depending on status code
			if (error.status === 401) {
				dispatch(
					addNotification({ type: "error", key: "LOCATION_NOT_DELETED_NOT_AUTHORIZED" }),
				);
			} else {
				dispatch(addNotification({ type: "error", key: "LOCATION_NOT_DELETED" }));
			}
		});
});

const recordingSlice = createSlice({
	name: "recordings",
	initialState,
	reducers: {
		setRecordingsColumns(state, action: PayloadAction<
			RecordingState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchRecordings.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchRecordings.fulfilled, (state, action: PayloadAction<{
				total: RecordingState["total"],
				count: RecordingState["count"],
				limit: RecordingState["limit"],
				offset: RecordingState["offset"],
				results: RecordingState["results"],
			}>) => {
				state.status = "succeeded";
				const recordings = action.payload;
				state.total = recordings.total;
				state.count = recordings.count;
				state.limit = recordings.limit;
				state.offset = recordings.offset;
				state.results = recordings.results;
			})
			.addCase(fetchRecordings.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			});
	},
});

export const { setRecordingsColumns } = recordingSlice.actions;

// Export the slice reducer as the default export
export default recordingSlice.reducer;
