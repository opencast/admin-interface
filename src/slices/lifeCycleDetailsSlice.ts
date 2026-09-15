import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { LifeCyclePolicy } from "./lifeCycleSlice";
import { TransformedAcl } from "./aclDetailsSlice";
import { createPolicy } from "../utils/resourceUtils";
import { Ace } from "./aclSlice";
import { addNotification } from "./notificationSlice";
import { AppDispatch } from "../store";


/**
 * This file contains redux reducer for actions affecting the state of a lifeCyclePolicy/capture agent
 */
type LifeCyclePolicyDetailsModal = {
	show: boolean,
	policy: { id: string, title: string } | null,
}

interface LifeCyclePolicyDetailsState extends LifeCyclePolicy {
	statusLifeCyclePolicyDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorLifeCyclePolicyDetails: SerializedError | null,

	modal: LifeCyclePolicyDetailsModal,
	actionsEnum: string[],
	targetTypesEnum: string[],
	timingsEnum: string[],
}

// Initial state of lifeCyclePolicy details in redux store
const initialState: LifeCyclePolicyDetailsState = {
	statusLifeCyclePolicyDetails: "uninitialized",
	errorLifeCyclePolicyDetails: null,
	modal: {
		show: false,
		policy: null,
	},
	actionParameters: {},
	timing: "SPECIFIC_DATE",
	action: "START_WORKFLOW",
	targetType: "EVENT",
	id: "",
	title: "",
	isActive: false,
	isCreatedFromConfig: false,
	actionDate: "",
	cronTrigger: "",
	targetFilters: {},
	accessControlEntries: [],

	actionsEnum: [],
	targetTypesEnum: [],
	timingsEnum: [],
};

// fetch details of certain lifeCyclePolicy from server
export const fetchLifeCyclePolicyDetails = createAppAsyncThunk("lifeCyclePolicyDetails/fetchLifeCyclePolicyDetails", async (id: string) => {
	type ReturnType = LifeCyclePolicy & { actionParameters: string, targetFilters: string, accessControlEntries: {
		id: number,
		allow: boolean,
		role: string,
		action: string,
	}[] }
	const res = await axios.get<ReturnType>(`/api/lifecyclemanagement/policies/${id}`);
	const data = res.data;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	data.actionParameters = JSON.parse(data.actionParameters);
	if (data.action === "START_WORKFLOW") {
		data.actionParameters.workflowParameters = JSON.parse(data.actionParameters.workflowParameters as string);
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	data.targetFilters = JSON.parse(data.targetFilters);

	const accessPolicies : {
		id: number,
		allow: boolean,
		role: string,
		action: string,
	}[] = data.accessControlEntries;
	let acls: TransformedAcl[] = [];

		const json = accessPolicies;
		const newPolicies: { [key: string]: TransformedAcl } = {};
		const policyRoles: string[] = [];
		for (let i = 0; i < json.length; i++) {
			const policy: Ace = json[i];
			if (!newPolicies[policy.role]) {
				newPolicies[policy.role] = createPolicy(policy.role);
				policyRoles.push(policy.role);
			}
			if (policy.action === "read" || policy.action === "write") {
				newPolicies[policy.role][policy.action] = policy.allow;
			} else if (policy.allow === true) { // || policy.allow === "true") {
				newPolicies[policy.role].actions.push(policy.action);
			}
		}
		acls = policyRoles.map(role => newPolicies[role]);

	const result = {
		...data,
		accessControlEntries: acls,
	};

	return result;
});

export const fetchLifeCyclePolicyActions = createAppAsyncThunk("lifeCyclePolicyDetails/fetchLifeCyclePolicyActions", async () => {
	const res = await axios.get<string[]>("/api/lifecyclemanagement/policies/actions");
	const data = res.data;

	return data;
});

export const fetchLifeCyclePolicyTargetTypes = createAppAsyncThunk("lifeCyclePolicyDetails/fetchLifeCyclePolicyTargetTypes", async () => {
	const res = await axios.get<string[]>("/api/lifecyclemanagement/policies/targettypes");
	const data = res.data;

	return data;
});

export const fetchLifeCyclePolicyTimings = createAppAsyncThunk("lifeCyclePolicyDetails/fetchLifeCyclePolicyTimings", async () => {
	const res = await axios.get<string[]>("/api/lifecyclemanagement/policies/timings");
	const data = res.data;

	return data;
});

// Dummy function for compatability
// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
export const fetchLifeCyclePolicyDetailsAcls = createAppAsyncThunk("lifeCyclePolicyDetails/fetchLifeCyclePolicyDetailsAcls", async (id: string, { getState }) => {
	const state = getState();
	return state.lifeCyclePolicyDetails.accessControlEntries;
});

// Dummy function for compatability
export const updateLifeCyclePolicyAccess = createAppAsyncThunk("lifeCyclePolicyDetails/fetchLifeCyclePolicyDetailsAcls", async (params: {
	id: string,
	policies: { acl: { ace: Ace[] } }
}, { dispatch }) => {
	const { id, policies } = params;

	const data = new URLSearchParams();
	data.append("accessControlEntries", JSON.stringify(policies.acl.ace));

	await axios.put(`/api/lifecyclemanagement/policies/${id}`, data)
		.then(_response => {
			dispatch(addNotification({ type: "success", key: "LIFECYCLE_POLICY_ADDED" }));
			return true;
		})
		.catch(response => {
			console.error(response);
			dispatch(addNotification({ type: "error", key: "LIFECYCLEPOLICY_NOT_SAVED" }));
			return false;
		});
});

export const updateLifeCyclePolicy = createAppAsyncThunk("lifeCyclePolicyDetails/updateLifeCyclePolicy", async (policy: LifeCyclePolicy, { dispatch }) => {
	const data = new URLSearchParams();

	Object.entries(policy).forEach(([key, value]) => {
		let stringified = value;
		if (stringified instanceof Date) {
			stringified = stringified.toJSON();
		} else if (stringified === Object(stringified)) {
			stringified = JSON.stringify(stringified);
		}
		// @ts-expect-error: ???
		data.append(key, stringified);
	});

	await axios.put(`/api/lifecyclemanagement/policies/${policy.id}`, data);

	dispatch(setPolicy(policy));
});

/**
 * Open details modal externally
 *
 * @param page modal page
 * @param policy policy to show
 */
export const openModal = (
	policy: LifeCyclePolicyDetailsModal["policy"],
) => (dispatch: AppDispatch) => {
	dispatch(setModalLifeCyclePolicy(policy));
	dispatch(setShowModal(true));
};

const lifeCyclePolicyDetailsSlice = createSlice({
	name: "lifeCyclePolicyDetails",
	initialState,
	reducers: {
		setShowModal(state, action: PayloadAction<
			LifeCyclePolicyDetailsState["modal"]["show"]
		>) {
			state.modal.show = action.payload;
		},
		setModalLifeCyclePolicy(state, action: PayloadAction<
			LifeCyclePolicyDetailsState["modal"]["policy"]
		>) {
			state.modal.policy = action.payload;
		},
		setPolicy(state, action: PayloadAction<LifeCyclePolicy>) {
			state.actionParameters = action.payload.actionParameters;
			state.timing = action.payload.timing;
			state.action = action.payload.action;
			state.targetType = action.payload.targetType;
			state.id = action.payload.id;
			state.title = action.payload.title;
			state.isActive = action.payload.isActive;
			state.isCreatedFromConfig = action.payload.isCreatedFromConfig;
			state.actionDate = action.payload.actionDate;
			state.cronTrigger = action.payload.cronTrigger;
			state.targetFilters = action.payload.targetFilters;
			state.accessControlEntries = action.payload.accessControlEntries;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchLifeCyclePolicyDetails.pending, state => {
				state.statusLifeCyclePolicyDetails = "loading";
			})
			.addCase(fetchLifeCyclePolicyDetails.fulfilled, (state, action: PayloadAction<{
				actionParameters: LifeCyclePolicyDetailsState["actionParameters"],
				timing: LifeCyclePolicyDetailsState["timing"],
				action: LifeCyclePolicyDetailsState["action"],
				targetType: LifeCyclePolicyDetailsState["targetType"],
				id: LifeCyclePolicyDetailsState["id"],
				title: LifeCyclePolicyDetailsState["title"],
				isActive: LifeCyclePolicyDetailsState["isActive"],
				isCreatedFromConfig: LifeCyclePolicyDetailsState["isCreatedFromConfig"],
				actionDate: LifeCyclePolicyDetailsState["actionDate"],
				cronTrigger: LifeCyclePolicyDetailsState["cronTrigger"],
				targetFilters: LifeCyclePolicyDetailsState["targetFilters"],
				accessControlEntries: LifeCyclePolicyDetailsState["accessControlEntries"],
			}>) => {
				state.statusLifeCyclePolicyDetails = "succeeded";
				const lifeCyclePolicyDetails = action.payload;
				state.actionParameters = lifeCyclePolicyDetails.actionParameters;
				state.timing = lifeCyclePolicyDetails.timing;
				state.action = lifeCyclePolicyDetails.action;
				state.targetType = lifeCyclePolicyDetails.targetType;
				state.id = lifeCyclePolicyDetails.id;
				state.title = lifeCyclePolicyDetails.title;
				state.isActive = lifeCyclePolicyDetails.isActive;
				state.isCreatedFromConfig = lifeCyclePolicyDetails.isCreatedFromConfig;
				state.actionDate = lifeCyclePolicyDetails.actionDate;
				state.cronTrigger = lifeCyclePolicyDetails.cronTrigger;
				state.targetFilters = lifeCyclePolicyDetails.targetFilters;
				state.accessControlEntries = lifeCyclePolicyDetails.accessControlEntries;
			})
			.addCase(fetchLifeCyclePolicyDetails.rejected, (state, action) => {
				state.statusLifeCyclePolicyDetails = "failed";
				state.errorLifeCyclePolicyDetails = action.error;
			})
			.addCase(fetchLifeCyclePolicyActions.fulfilled, (state, action: PayloadAction<
				LifeCyclePolicyDetailsState["actionsEnum"]
			>) => {
				const actionsEnum = action.payload;
				state.actionsEnum = actionsEnum;
			})
			.addCase(fetchLifeCyclePolicyTargetTypes.fulfilled, (state, action: PayloadAction<
				LifeCyclePolicyDetailsState["actionsEnum"]
			>) => {
				const targetTypesEnum = action.payload;
				state.targetTypesEnum = targetTypesEnum;
			})
			.addCase(fetchLifeCyclePolicyTimings.fulfilled, (state, action: PayloadAction<
				LifeCyclePolicyDetailsState["actionsEnum"]
			>) => {
				const timingsEnum = action.payload;
				state.timingsEnum = timingsEnum;
			});
	},
});

export const {
	setShowModal,
	setModalLifeCyclePolicy,
	setPolicy,
} = lifeCyclePolicyDetailsSlice.actions;

// Export the slice reducer as the default export
export default lifeCyclePolicyDetailsSlice.reducer;
