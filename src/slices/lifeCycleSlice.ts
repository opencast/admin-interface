import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { lifeCyclePolicyTableConfig } from "../configs/tableConfigs/lifeCyclePoliciesTableConfig";
import axios from "axios";
import { getURLParams, prepareAccessPolicyRulesForPost } from "../utils/resourceUtils";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { TransformedAcl } from "./aclDetailsSlice";
import { addNotification } from "./notificationSlice";

// type LifeCyclePolicyTiming = "SPECIFIC_DATE" | "REPEATING" | "ALWAYS";
// type LifeCyclePolicyAction = "START_WORKFLOW"
// type LifeCyclePolicyTargetType = "EVENT"
export type CommonMetadataCatalogFlavor = "dublincore/episode"; // TODO: Get this from the backend
export type TargetFilter = {
	value: string | string[],
	type: TargetFiltersType,
	must: boolean
}
export const ALL_TARGET_FILTER_TYPES = ["SEARCH", "WILDCARD", "GREATER_THAN", "LESS_THAN"] as const;
type TargetFilterTypesTuple = typeof ALL_TARGET_FILTER_TYPES;
type TargetFiltersType = TargetFilterTypesTuple[number];

export type LifeCyclePolicy = {
	actionParameters: { [key: string]: unknown }, // JSON. Variable, depends on action1
	timing: string,
	action: string,
	targetType: string,
	id: string,
	title: string,
	isActive: boolean,
	isCreatedFromConfig: boolean,
	actionDate: string, // Date
	cronTrigger: string,
	targetFilters: { [key: string]: { [key: string]: TargetFilter } },
	accessControlEntries: TransformedAcl[]
}

type LifeCycleState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	results: LifeCyclePolicy[],
	columns: TableConfig["columns"],
	total: number,
	offset: number,
	limit: number,
};

// Fill columns initially with columns defined in aclsTableConfig
const initialColumns = lifeCyclePolicyTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of acls in redux store
const initialState: LifeCycleState = {
	status: "uninitialized",
	error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	offset: 0,
	limit: 0,
};

type FetchLifeCyclePolicies = {
	total: number,
	offset: number,
	limit: number,
	results: LifeCyclePolicy[]
}

export const fetchLifeCyclePolicies = createAppAsyncThunk("lifeCycle/fetchLifeCyclePolicies", async (_, { getState }) => {
	const state = getState();
	const params = getURLParams(state, "lifeCyclePolicies");
	const res = await axios.get<FetchLifeCyclePolicies>("/api/lifecyclemanagement/policies", { params: params });
	return res.data;
});

export const postNewLifeCyclePolicy = createAppAsyncThunk("lifeCycle/postNewLifeCyclePolicy", async (
	policy: {
		actionParameters: { [key: string]: unknown },
		timing: string,
		action: string,
		targetType: string,
		title: string,
		isActive: boolean,
		actionDate: string,
		cronTrigger: string,
		targetFilters: { [key: string]: { [key: string]: TargetFilter } },
		accessControlEntries: TransformedAcl[]
	},
	{ dispatch },
) => {
	const data = new URLSearchParams();

	// Format filter collections
	// for (const filterName in policy.targetFilters) {
	//   // policy.targetFilters[filterName]
	//   if (hasOwnProperty(TARGET_FILTER_KEYS_EVENTS, filterName)
	//     && TARGET_FILTER_KEYS_EVENTS[filterName].collection) {
	//       policy.targetFilters[filterName].value = policy.targetFilters[filterName].value.toString()
	//   }
	// }

	// Stringify
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

	data.delete("accessControlEntries");
	data.append("accessControlEntries", JSON.stringify(prepareAccessPolicyRulesForPost(policy.accessControlEntries).acl.ace));

	await axios.post("/api/lifecyclemanagement/policies", data)
		.then(_res => {
			dispatch(addNotification({ type: "success", key: "LIFECYCLE_POLICY_ADDED" }));
		})
		.catch(res => {
			console.error(res);
			dispatch(addNotification({ type: "error", key: "LIFECYCLE_POLICY_NOT_SAVED" }));
		});
});

export const deleteLifeCyclePolicy = createAppAsyncThunk("lifeCycle/fetchLifeCyclePolicies", async (id: string, { dispatch }) => {
	await axios
		.delete(`/api/lifecyclemanagement/policies/${id}`)
		.then(_res => {
			dispatch(addNotification({ type: "success", key: "LIFECYCLE_POLICY_DELETED" }));
		})
		.catch(res => {
			console.error(res);
			dispatch(addNotification({ type: "error", key: "LIFECYCLE_POLICY_NOT_DELETED" }));
		});
});

const lifeCycleSlice = createSlice({
	name: "lifeCycle",
	initialState,
	reducers: {
		setLifeCycleColumns(state, action: PayloadAction<
			LifeCycleState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchLifeCyclePolicies.pending, state => {
				state.status = "loading";
			})
			// Pass the generated action creators to `.addCase()`
			.addCase(fetchLifeCyclePolicies.fulfilled, (state, action: PayloadAction<{
				total: LifeCycleState["total"],
				limit: LifeCycleState["limit"],
				offset: LifeCycleState["offset"],
				results: LifeCycleState["results"],
			}>) => {
				// Same "mutating" update syntax thanks to Immer
				state.status = "succeeded";
				const policies = action.payload;
				state.total = policies.total;
				state.limit = policies.limit;
				state.offset = policies.offset;
				state.results = policies.results;
			})
			.addCase(fetchLifeCyclePolicies.rejected, (state, action) => {
				state.status = "failed";
				state.results = [];
				state.error = action.error;
			});
	},
});

export const { setLifeCycleColumns } = lifeCycleSlice.actions;

// Export the slice reducer as the default export
export default lifeCycleSlice.reducer;
