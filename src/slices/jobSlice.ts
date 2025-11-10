import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { jobsTableConfig } from "../configs/tableConfigs/jobsTableConfig";
import axios from "axios";
import { getURLParams } from "../utils/resourceUtils";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of jobs
 */
type FetchJobs = {
	total: JobState["total"],
	count: JobState["count"],
	limit: JobState["limit"],
	offset: JobState["offset"],
	results: JobState["results"],
};

export type Job = {
	creator: string,
	id: number,
	operation: string,
	processingHost: string,
	processingNode: string,
	started: string,
	status: string,
	submitted: string,
	type: string,
}

type JobState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	results: Job[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
}

// Fill columns initially with columns defined in jobsTableConfig
const initialColumns = jobsTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of jobs in redux store
const initialState: JobState = {
	status: "uninitialized",
	error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
};

export const fetchJobs = createAppAsyncThunk("jobs/fetchJobs", async (_, { getState }) => {
	const state = getState();
	const params = getURLParams(state, "jobs");
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	// /jobs.json?limit=0&offset=0&filter={filter}&sort={sort}
	const res = await axios.get<FetchJobs>("/admin-ng/job/jobs.json?", { params: params });
	return res.data;
});

const jobSlice = createSlice({
	name: "jobs",
	initialState,
	reducers: {
		setJobColumns(state, action: PayloadAction<
			JobState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchJobs.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchJobs.fulfilled, (state, action: PayloadAction<FetchJobs>) => {
				state.status = "succeeded";
				const jobs = action.payload;
				state.total = jobs.total;
				state.count = jobs.count;
				state.limit = jobs.limit;
				state.offset = jobs.offset;
				state.results = jobs.results;
			})
			.addCase(fetchJobs.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			});
	},
});

export const { setJobColumns } = jobSlice.actions;

// Export the slice reducer as the default export
export default jobSlice.reducer;
