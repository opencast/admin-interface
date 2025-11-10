import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { prepareAccessPolicyRulesForPost } from "../utils/resourceUtils";
import { addNotification } from "./notificationSlice";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { Acl } from "./aclSlice";
import { AppThunk } from "../store";

/**
 * This file contains redux reducer for actions affecting the state of details of an ACL
 */
export type TransformedAcl = {
	actions: string[],
	role: string,
	read: boolean,
	write: boolean
	user?: {
		username: string,
		name: string,
		email?: string,
	}
}

type AclDetailsState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
  organizationId: string,
	id: number,
	name: string,
	acl: TransformedAcl[],
}

// initial redux state
const initialState: AclDetailsState = {
	status: "uninitialized",
	error: null,
	organizationId: "",
	id: 0,
	name: "",
	acl: [],
};

// fetch details about a certain acl from server
export const fetchAclDetails = createAppAsyncThunk("aclDetails/fetchAclDetails", async (aclId: AclDetailsState["id"]) => {
	type FetchAclDetails = {
		organizationId: string,
		id: number,
		name: string,
		acl: Acl,
	}

	const res = await axios.get<FetchAclDetails>(`/admin-ng/acl/${aclId}`);

	const aclDetails = res.data;

	const acl = aclDetails.acl;
	let transformedAcls: TransformedAcl[] = [];

	// transform policies for further use
  // We do this in order to prepare the information for the acl tab in the details modals,
	// because we render the information differently from how it is usually structured in an ACL
	for (let i = 0; acl.ace.length > i; i++) {
		if (transformedAcls.find(rule => rule.role === acl.ace[i].role)) {
			for (let j = 0; transformedAcls.length > j; j++) {
				// only update entry for policy if already added with other action
				if (transformedAcls[j].role === acl.ace[i].role) {
					if (acl.ace[i].action === "read") {
						transformedAcls[j] = {
							...transformedAcls[j],
							read: acl.ace[i].allow,
						};
						break;
					}
					if (acl.ace[i].action === "write") {
						transformedAcls[j] = {
							...transformedAcls[j],
							write: acl.ace[i].allow,
						};
						break;
					}
					if (
						acl.ace[i].action !== "read" &&
						acl.ace[i].action !== "write" &&
						acl.ace[i].allow === true
					) {
						transformedAcls[j] = {
							...transformedAcls[j],
							actions: transformedAcls[j].actions.concat(acl.ace[i].action),
						};
						break;
					}
				}
			}
		} else {
			// add policy if role not seen before
			if (acl.ace[i].action === "read") {
				transformedAcls = transformedAcls.concat({
					role: acl.ace[i].role,
					read: acl.ace[i].allow,
					write: false,
					actions: [],
				});
			}
			if (acl.ace[i].action === "write") {
				transformedAcls = transformedAcls.concat({
					role: acl.ace[i].role,
					read: false,
					write: acl.ace[i].allow,
					actions: [],
				});
			}
			if (
				acl.ace[i].action !== "read" &&
				acl.ace[i].action !== "write" &&
				acl.ace[i].allow === true
			) {
				transformedAcls = transformedAcls.concat({
					role: acl.ace[i].role,
					read: false,
					write: false,
					actions: [acl.ace[i].action],
				});
			}
		}
	}

	const newDetails = {
		...aclDetails,
		acl: transformedAcls,
	};

	return newDetails;
});

// update details of a certain acl
export const updateAclDetails = (params: {
	values: {
		name: string,
		policies: TransformedAcl[],
	},
	aclId: number,
}): AppThunk => dispatch => {
	const { values, aclId } = params;
	// transform ACLs back to structure used by backend
	const acls = prepareAccessPolicyRulesForPost(values.policies);

	// set params for request body
	const data = new URLSearchParams();
	data.append("name", values.name);
	data.append("acl", JSON.stringify(acls));

	// PUT request
	axios
		.put(`/admin-ng/acl/${aclId}`, data)
		.then(response => {
			console.info(response);
			dispatch(addNotification({ type: "success", key: "ACL_UPDATED" }));
		})
		.catch(response => {
			console.error(response);
			dispatch(addNotification({ type: "error", key: "ACL_NOT_SAVED" }));
		});
};

const aclDetailsSlice = createSlice({
	name: "aclDetails",
	initialState,
	reducers: {},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchAclDetails.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchAclDetails.fulfilled, (state, action: PayloadAction<{
				organizationId: AclDetailsState["organizationId"],
				id: AclDetailsState["id"],
				name: AclDetailsState["name"],
				acl: AclDetailsState["acl"],
			}>) => {
				state.status = "succeeded";
				const acls = action.payload;
				state.organizationId = acls.organizationId;
				state.id = acls.id;
				state.name = acls.name;
				state.acl = acls.acl;
			})
			.addCase(fetchAclDetails.rejected, (state, action) => {
				state.status = "failed";
        state.organizationId = "";
        state.id = 0;
        state.name = "";
        state.acl = [];
				state.error = action.error;
			});
	},
});

// export const {} = aclDetailsSlice.actions;

// Export the slice reducer as the default export
export default aclDetailsSlice.reducer;
