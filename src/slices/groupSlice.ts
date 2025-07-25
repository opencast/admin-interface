import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { groupsTableConfig } from "../configs/tableConfigs/groupsTableConfig";
import axios, { AxiosError } from "axios";
import { buildGroupBody, getURLParams } from "../utils/resourceUtils";
import { addNotification } from "./notificationSlice";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { initialFormValuesNewGroup } from "../configs/modalConfig";

/**
 * This file contains redux reducer for actions affecting the state of groups
 */
type FetchGroups = {
	total: GroupState["total"],
	count: GroupState["count"],
	limit: GroupState["limit"],
	offset: GroupState["offset"],
	results: GroupState["results"],
};

export type Group = {
	description: string,
	id: string,
	name: string,
  role: string,
	users: {id: string, name: string}[],
}

type GroupState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	results: Group[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
}

// Fill columns initially with columns defined in groupsTableConfig
const initialColumns = groupsTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of groups in redux store
const initialState: GroupState = {
	status: "uninitialized",
	error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
};

// fetch groups from server
export const fetchGroups = createAppAsyncThunk("groups/fetchGroups", async (_, { getState }) => {
	const state = getState();
	const params = getURLParams(state, "groups");
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get<FetchGroups>("/admin-ng/groups/groups.json", { params: params });
	return res.data;
});

// post new group to backend
export const postNewGroup = createAppAsyncThunk("groups/postNewGroup", async (values: typeof initialFormValuesNewGroup, { dispatch }) => {
	// get URL params used for post request
	const data = buildGroupBody(values);

	// POST request
	axios
		.post("/admin-ng/groups", data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(() => {
			dispatch(addNotification({ type: "success", key: "GROUP_ADDED" }));
		})
		.catch((error: AxiosError) => {
			console.error(error);
			if (error.status === 409) {
				dispatch(addNotification({ type: "error", key: "GROUP_CONFLICT" }));
			} else {
				dispatch(addNotification({ type: "error", key: "GROUP_NOT_SAVED" }));
			}
		});
});

export const deleteGroup = createAppAsyncThunk("groups/deleteGroup", async (id: Group["id"], { dispatch }) => {
	// API call for deleting a group
	axios
		.delete(`/admin-ng/groups/${id}`)
		.then(() => {
			// add success notification
			dispatch(addNotification({ type: "success", key: "GROUP_DELETED" }));
		})
		.catch(res => {
			console.error(res);
			// add error notification
			dispatch(addNotification({ type: "error", key: "GROUP_NOT_DELETED" }));
		});
});

const groupSlice = createSlice({
	name: "groups",
	initialState,
	reducers: {
		setGroupColumns(state, action: PayloadAction<
			 GroupState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchGroups.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchGroups.fulfilled, (state, action: PayloadAction<FetchGroups>) => {
				state.status = "succeeded";
				const groups = action.payload;
				state.total = groups.total;
				state.count = groups.count;
				state.limit = groups.limit;
				state.offset = groups.offset;
				state.results = groups.results;
			})
			.addCase(fetchGroups.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			});
	},
});

export const { setGroupColumns } = groupSlice.actions;

// Export the slice reducer as the default export
export default groupSlice.reducer;
