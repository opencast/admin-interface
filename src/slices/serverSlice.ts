import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { serversTableConfig } from "../configs/tableConfigs/serversTableConfig";
import axios from "axios";
import { getURLParams } from "../utils/resourceUtils";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of servers
 */
type FetchServers = {
	total: ServerState["total"],
	count: ServerState["count"],
	limit: ServerState["limit"],
	offset: ServerState["offset"],
	results: ServerState["results"],
};

export type Server = {
	cores: number,
	hostname: string,
	maintenance: boolean,
	nodeName: string,
	online: boolean,
	queued: number,
	running: number
}

type ServerState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	results: Server[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
}

// Fill columns initially with columns defined in serversTableConfig
const initialColumns = serversTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of servers in redux store
const initialState: ServerState = {
	status: "uninitialized",
	error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
};

// fetch servers from server
export const fetchServers = createAppAsyncThunk("servers/fetchServers", async (_, { getState }) => {
	const state = getState();
	const params = getURLParams(state, "servers");
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
  // /servers.json?limit=0&offset=0&filter={filter}&sort={sort}
	const res = await axios.get<FetchServers>("/admin-ng/server/servers.json", { params: params });
	return res.data;
});

// change maintenance status of a server/host
export const setServerMaintenance = createAppAsyncThunk("servers/setServerMaintenance", async (params: {
	host: Server["hostname"],
	maintenance: Server["maintenance"]
}) => {
	const { host, maintenance } = params;
	const data = new URLSearchParams();
	data.append("host", host);
	data.append("maintenance", String(maintenance));

	axios
		.post("/services/maintenance", data)
		.then(response => {
			console.info(response);
		})
		.catch(response => {
			console.error(response);
		});
});

const serverSlice = createSlice({
	name: "servers",
	initialState,
	reducers: {
		setServerColumns(state, action: PayloadAction<
			ServerState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchServers.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchServers.fulfilled, (state, action: PayloadAction<FetchServers>) => {
				state.status = "succeeded";
				const servers = action.payload;
				state.total = servers.total;
				state.count = servers.count;
				state.limit = servers.limit;
				state.offset = servers.offset;
				state.results = servers.results;
			})
			.addCase(fetchServers.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			});
	},
});

export const { setServerColumns } = serverSlice.actions;

// Export the slice reducer as the default export
export default serverSlice.reducer;
