import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { ParsedCapabilities } from "./recordingSlice";

/**
 * This file contains redux reducer for actions affecting the state of a recording/capture agent
 */
type FetchRecordingDetails = {
	Name: RecordingDetailsState["name"],
	Status: RecordingDetailsState["status"],
	Update: RecordingDetailsState["update"],
	URL: RecordingDetailsState["url"],
	capabilities: RecordingDetailsState["capabilities"],
	configuration: RecordingDetailsState["configuration"],
	Version: RecordingDetailsState["version"],
	Vendor: RecordingDetailsState["vendor"],
	Model: RecordingDetailsState["model"],
	Hardware: RecordingDetailsState["hardware"],
	Firmware: RecordingDetailsState["firmware"],
	parsedCapabilities?: ParsedCapabilities,
}

export interface RecordingDetails {
	name: string,
	status: string,
	update: string,
	url: string,
	capabilities: { key: string, value: string }[],
	configuration: { key: string, value: string }[],
	inputs: { id: string, value: string }[],
	// The capture agent API version the agent speaks, "1" or "2". Vendor information is blank for version 1.
	version: string,
	vendor: string,
	model: string,
	hardware: string,
	firmware: string,
	parsedCapabilities?: ParsedCapabilities,
}

interface RecordingDetailsState extends RecordingDetails {
	statusRecordingDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorRecordingDetails: SerializedError | null,
}

// Initial state of recording details in redux store
const initialState: RecordingDetailsState = {
	statusRecordingDetails: "uninitialized",
	errorRecordingDetails: null,
	name: "",
	status: "",
	update: "",
	url: "",
	capabilities: [],
	configuration: [],
	inputs: [],
	version: "",
	vendor: "",
	model: "",
	hardware: "",
	firmware: "",
};

// fetch details of certain recording from server
export const fetchRecordingDetails = createAppAsyncThunk("recordingDetails/fetchRecordingDetails", async (name: RecordingDetails["name"]) => {
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get<FetchRecordingDetails>(`/admin-ng/capture-agents/${name}`);
	return res.data;
});

const recordingDetailsSlice = createSlice({
	name: "recordingDetails",
	initialState,
	reducers: {},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchRecordingDetails.pending, state => {
				state.statusRecordingDetails = "loading";
			})
			.addCase(fetchRecordingDetails.fulfilled, (state, action: PayloadAction<FetchRecordingDetails>) => {
				state.statusRecordingDetails = "succeeded";
				const recordingDetails = action.payload;
				state.name = recordingDetails.Name;
				state.status = recordingDetails.Status;
				state.update = recordingDetails.Update;
				state.url = recordingDetails.URL;
				state.capabilities = recordingDetails.capabilities;
				state.configuration = recordingDetails.configuration;
				state.inputs = recordingDetails.parsedCapabilities?.inputs ?? [];
				state.version = recordingDetails.Version;
				state.vendor = recordingDetails.Vendor;
				state.model = recordingDetails.Model;
				state.hardware = recordingDetails.Hardware;
				state.firmware = recordingDetails.Firmware;
				state.parsedCapabilities = recordingDetails.parsedCapabilities;
			})
			.addCase(fetchRecordingDetails.rejected, (state, action) => {
				state.statusRecordingDetails = "failed";
				state.errorRecordingDetails = action.error;
			});
	},
});

// export const {} = recordingDetailsSlice.actions;

// Export the slice reducer as the default export
export default recordingDetailsSlice.reducer;
