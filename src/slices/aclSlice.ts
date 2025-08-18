import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { TableConfig, aclsTableConfig } from "../configs/tableConfigs/aclsTableConfig";
import axios from "axios";
import { getURLParams, prepareAccessPolicyRulesForPost, transformAclTemplatesResponse } from "../utils/resourceUtils";
import { transformToIdValueArray } from "../utils/utils";
import { NOTIFICATION_CONTEXT_ACCESS } from "../configs/modalConfig";
import { addNotification, removeNotificationWizardAccess } from "./notificationSlice";
import { getUserInformation } from "../selectors/userInfoSelectors";
import { AppDispatch, AppThunk, RootState } from "../store";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { initialFormValuesNewAcl } from "../configs/modalConfig";
import { TransformedAcl } from "./aclDetailsSlice";

/**
 * This file contains redux reducer for actions affecting the state of acls
 */
type FetchAcls = {
	total: AclsState["total"],
	count: AclsState["count"],
	limit: AclsState["limit"],
	offset: AclsState["offset"],
	results: AclsState["results"],
};

export type Ace = {
	action: string,
	allow: boolean,
	role: string,
}

export type Acl = {
	ace: Ace[]
}

export type Role = {
	description: string | undefined,
	name: string,
	organization: string,
	type: string,
	isSanitize: boolean,
	user?: {
		username: string,
		name: string,
		email: string,
	}
}

export type AclResult = {
	acl: Acl,
	id: number,
	name: string,
	organizationId: string,
}

type AclsState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	results: AclResult[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
};

// Fill columns initially with columns defined in aclsTableConfig
const initialColumns = aclsTableConfig.columns.map(column => ({
	...column,
	deactivated: false,
}));

// Initial state of acls in redux store
const initialState: AclsState = {
	status: "uninitialized",
	error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
};

export const fetchAcls = createAppAsyncThunk("acls/fetchAcls", async (_, { getState }) => {
	const state = getState();
	const params = getURLParams(state, "acls");
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get<FetchAcls>("/admin-ng/acl/acls.json", { params: params });
	return res.data;
});

// todo: unite following in one fetch method (maybe also move to own file containing all fetches regarding resources endpoint)
// get acl templates
export const fetchAclTemplates = async () => {
	const data = await axios.get<{ [key: string]: string }>("/admin-ng/resources/ACL.json");

	const response = data.data;

	return transformToIdValueArray(response);
};

// fetch additional actions that a policy allows user to perform on an event
export const fetchAclActions = async () => {
	const data = await axios.get<{ [key: string]: string }>("/admin-ng/resources/ACL.ACTIONS.json");

	const response = data.data;

	const actions = transformToIdValueArray(response);

	return actions;
};

// fetch defaults for the access policy tab in the details views
export const fetchAclDefaults = async () => {
	const data = await axios.get<{ [key: string]: string }>("/admin-ng/resources/ACL.DEFAULTS.json");

	const response = data.data;

	return response;
};

// fetch all policies of an certain acl template
export const fetchAclTemplateById = async (id: string) => {
	const response = await axios.get<AclResult>(`/acl-manager/acl/${id}`);

	const acl = response.data.acl;

	return transformAclTemplatesResponse(acl);
};

// fetch roles for select dialogs and access policy pages
export const fetchRolesWithTarget = async (target: string) => {
	const params = {
		limit: -1,
		target: target,
	};

	const response = await axios.get<Role[]>("/admin-ng/acl/roles.json", { params: params });
	const data = response.data;

	return data;
};

// post new acl to backend
export const postNewAcl = (values: typeof initialFormValuesNewAcl): AppThunk => dispatch => {
	const acls = prepareAccessPolicyRulesForPost(values.policies);

	const data = new URLSearchParams();
	data.append("name", values.name);
	data.append("acl", JSON.stringify(acls));

	axios
		.post("/admin-ng/acl", data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(response => {
			console.info(response);
			dispatch(addNotification({ type: "success", key: "ACL_ADDED" }));
		})
		.catch(response => {
			console.error(response);
			dispatch(addNotification({ type: "error", key: "ACL_NOT_SAVED" }));
		});
};

// delete acl with provided id
export const deleteAcl = (id: number): AppThunk => dispatch => {
	axios
		.delete(`/admin-ng/acl/${id}`)
		.then(res => {
			console.info(res);
			// add success notification
			dispatch(addNotification({ type: "success", key: "ACL_DELETED" }));
		})
		.catch(res => {
			console.error(res);
			// add error notification
			dispatch(addNotification({ type: "error", key: "ACL_NOT_DELETED" }));
		});
};


export const checkAcls = (acls: TransformedAcl[]) => (dispatch: AppDispatch, getState: () => RootState) => {
	// Remove old notifications of context event-access
	// Helps to prevent multiple notifications for same problem
	dispatch(removeNotificationWizardAccess());

	const user = getUserInformation(getState());

	let check = true;
	let bothRights = false;

	for (let i = 0; acls.length > i; i++) {
		// check if a role is chosen
		if (acls[i].role === "") {
			check = false;
		}

		// if not admin, check if there is at least one policy with read and write rights
		if ((acls[i].read && acls[i].write) || user.isAdmin) {
			bothRights = true;
		}

		// check if each policy has read or write right (at least one checkbox should be checked)
		if (!acls[i].read && !acls[i].write) {
			check = false;
		}
	}

	if (!check) {
		dispatch(
			addNotification({
				type: "warning",
				key: "INVALID_ACL_RULES",
				duration: -1,
				context: NOTIFICATION_CONTEXT_ACCESS,
			}),
		);
	}

	if (!bothRights) {
		dispatch(
			addNotification({
				type: "warning",
				key: "MISSING_ACL_RULES",
				duration: -1,
				context: NOTIFICATION_CONTEXT_ACCESS,
			}),
		);
		check = false;
	}

	return check;
};

const aclsSlice = createSlice({
	name: "acls",
	initialState,
	reducers: {
		setAclColumns(state, action: PayloadAction<
			AclsState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchAcls.pending, state => {
				state.status = "loading";
			})
			// Pass the generated action creators to `.addCase()`
			.addCase(fetchAcls.fulfilled, (state, action: PayloadAction<FetchAcls>) => {
				// Same "mutating" update syntax thanks to Immer
				state.status = "succeeded";
				const acls = action.payload;
				state.total = acls.total;
				state.count = acls.count;
				state.limit = acls.limit;
				state.offset = acls.offset;
				state.results = acls.results;
			})
			.addCase(fetchAcls.rejected, (state, action) => {
				state.status = "failed";
				state.results = [];
				state.error = action.error;
			});
	},
});

export const { setAclColumns } = aclsSlice.actions;

// Export the slice reducer as the default export
export default aclsSlice.reducer;
