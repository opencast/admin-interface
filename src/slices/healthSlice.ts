import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { WritableDraft } from "immer";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of information about health status
 * This information is shown in the bell in the header.
 */
const STATES_NAMES = "Service States";
const BACKEND_NAMES = "Backend Services";
const OK = "OK";
const MALFORMED_DATA = "Malformed Data";
const ERROR = "error";

export type HealthStatus = {
	name: string,
	error: boolean,
	status: string,
}

type HealthState = {
	statusHealth: "uninitialized" | "loading" | "succeeded" | "failed",
	errorHealth: SerializedError | null,
  service: HealthStatus[],
  error: boolean,
  numErr: number,
}

// Initial state of health status in redux store
const initialState: HealthState = {
	statusHealth: "uninitialized",
	errorHealth: null,
	service: [
		{
			name: STATES_NAMES,
			error: false,
			status: "",
		},
		{
			name: BACKEND_NAMES,
			error: false,
			status: "",
		},
	],
	error: false,
	numErr: 0,
};

type FetchHealthStatusResponse = {
	health: {
		healthy: number,
		warning: number,
		error: number,
	}
}

// Fetch health status and transform it to further use
export const fetchHealthStatus = createAppAsyncThunk("health/fetchHealthStatus", async () => {
	const res = await axios.get<FetchHealthStatusResponse>("/services/health.json");
	return res.data;
});

const healthSlice = createSlice({
	name: "health",
	initialState,
	reducers: {
		setError(state, action: PayloadAction<{
			error: HealthState["error"],
		}>) {
			state.error = action.payload.error;
		},
    addNumError(state, action: PayloadAction<{
			numError: HealthState["numErr"],
		}>) {
			state.numErr = state.numErr + action.payload.numError;
		},
    resetNumError(state) {
			state.numErr = 0;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchHealthStatus.pending, state => {
				state.statusHealth = "loading";
			})
			.addCase(fetchHealthStatus.fulfilled, (state, action: PayloadAction<
				FetchHealthStatusResponse
			>) => {
				state.statusHealth = "succeeded";

				const health = action.payload.health;
				let healthStatus;
				if (undefined === action.payload || undefined === health) {
					healthStatus = {
						name: STATES_NAMES,
						status: MALFORMED_DATA,
						error: true,
					};
					state.service = mapHealthStatus(state, healthStatus);
					state.error = true;
					state.numErr += 1;
				} else {
					let abnormal = 0;
					abnormal = health["warning"] + health["error"];
					if (abnormal === 0) {
						healthStatus = {
							name: BACKEND_NAMES,
							status: OK,
							error: false,
						};
						state.service = mapHealthStatus(state, healthStatus);
						state.error = false;
					} else {
						healthStatus = {
							name: BACKEND_NAMES,
							status: ERROR,
							error: true,
						};
						state.service = mapHealthStatus(state, healthStatus);
						state.error = true;
					}
					state.numErr = abnormal;
				}
			})
			.addCase(fetchHealthStatus.rejected, (state, action) => {
				state.statusHealth = "failed";

				const healthStatus = {
					name: STATES_NAMES,
					status: action.error.message ?? "",
					error: true,
				};
				state.service = mapHealthStatus(state, healthStatus);
				state.error = true;
				state.numErr += 1;

				state.errorHealth = action.error;
			});
	},
});

const mapHealthStatus = (state: WritableDraft<HealthState>, updatedHealthStatus: HealthStatus) => {
	return state.service.map(healthStatus => {
		if (healthStatus.name === updatedHealthStatus.name) {
			return updatedHealthStatus;
		}
		return healthStatus;
	});
};

export const { setError } = healthSlice.actions;

// Export the slice reducer as the default export
export default healthSlice.reducer;
