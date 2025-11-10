import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { addNotification } from "./notificationSlice";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of information about current user
 */
type OcVersion = {
	buildNumber: string | undefined,
	consistent: boolean | undefined,
	"last-modified": number | undefined,
	version: string | undefined,
}

type UserInfoOrganization = {
	adminRole: string,
	anonymousRole: string,
	id: string,
	name: string,
	properties: { [key: string]: string },
}

type UserInfoUser = {
	email?: string,
	name: string,
	provider: string,
	username: string,
}

export type UserInfoState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	statusOcVersion: "uninitialized" | "loading" | "succeeded" | "failed",
	errorOcVersion: SerializedError | null,
	isAdmin: boolean,
	isOrgAdmin: boolean,
	org: UserInfoOrganization,
	roles: string[],
	userRole: string,
	user: UserInfoUser,
	ocVersion: OcVersion,
};

// Initial state of userInfo in redux store
const initialState: UserInfoState = {
	status: "uninitialized",
	error: null,
	statusOcVersion: "uninitialized",
	errorOcVersion: null,
	isAdmin: false,
	isOrgAdmin: false,
	org: {
		adminRole: "",
		anonymousRole: "",
		id: "",
		name: "",
		properties: {},
	},
	roles: [],
	userRole: "",
	user: {
		email: "",
		name: "",
		provider: "",
		username: "",
	},
	ocVersion: {
		buildNumber: undefined,
		consistent: undefined,
		"last-modified": undefined,
		version: undefined,
	},
};

export const fetchUserInfo = createAppAsyncThunk("UserInfo/fetchUserInfo", async (_, { dispatch }) => {
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	type FetchUserInfo = {
		org: UserInfoOrganization
		roles: string[]
		userRole: string
		user: UserInfoUser
	}

	const res = await axios.get<FetchUserInfo>("/info/me.json")
		.then(response => {
			return response.data;
		})
		.catch(error => {
			console.error(error);
			dispatch(addNotification({ type: "error", key: "USER_NOT_SAVED" }));
			throw error;
		});

	// Redirect to login if not in ROLE_ADMIN_UI
	if (!(res.roles.includes("ROLE_ADMIN") || res.roles.includes("ROLE_ADMIN_UI"))) {
		window.location.href = "/login.html";
	}

	return res;
});

export const fetchOcVersion = createAppAsyncThunk("UserInfo/fetchOcVersion", async () => {
	const res = await axios.get<OcVersion>("/sysinfo/bundles/version?prefix=opencast");
	return res.data;
});


const userInfoSlice = createSlice({
	name: "userInfo",
	initialState,
	reducers: {},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchUserInfo.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<{
				org: UserInfoState["org"],
				roles: UserInfoState["roles"],
				userRole: UserInfoState["userRole"],
				user: UserInfoState["user"],
			}>) => {
				state.status = "succeeded";
				const userInfo = action.payload;
				state.isAdmin = userInfo.roles.includes("ROLE_ADMIN");
				state.isOrgAdmin = userInfo.roles.includes(userInfo.org.adminRole);
				state.org = userInfo.org;
				state.roles = userInfo.roles;
				state.userRole = userInfo.userRole;
				state.user = userInfo.user;
			})
			.addCase(fetchUserInfo.rejected, (state, action) => {
				state.status = "failed";
				state.org = {
					adminRole: "",
					anonymousRole: "",
					id: "",
					name: "",
					properties: {},
				};
				state.roles = [];
				state.userRole = "";
				state.user = {
					email: "",
					name: "",
					provider: "",
					username: "",
				};
				state.error = action.error;
			})
			.addCase(fetchOcVersion.pending, state => {
				state.statusOcVersion = "loading";
			})
			.addCase(fetchOcVersion.fulfilled, (state, action: PayloadAction<
				OcVersion
			>) => {
				state.statusOcVersion = "succeeded";
				const ocVersion = action.payload;
				state.ocVersion = ocVersion;
			})
			.addCase(fetchOcVersion.rejected, (state, action) => {
				state.statusOcVersion = "failed";
				state.errorOcVersion = action.error;
			});
	},
});


// export const {} = userInfoSlice.actions;

// Export the slice reducer as the default export
export default userInfoSlice.reducer;
