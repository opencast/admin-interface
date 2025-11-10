import { PayloadAction, SerializedError, createSlice } from '@reduxjs/toolkit'
import { usersTableConfig } from "../configs/tableConfigs/usersTableConfig";
import axios from 'axios';
import { transformToIdValueArray } from "../utils/utils";
import { buildUserBody, getURLParams } from "../utils/resourceUtils";
import { addNotification } from './notificationSlice';
import { TableConfig } from '../configs/tableConfigs/aclsTableConfig';
import { createAppAsyncThunk } from '../createAsyncThunkWithTypes';

/**
 * This file contains redux reducer for actions affecting the state of users
 */
export type UserRole = {
	name: string
	type: string
}

export type User = {
	email?: string,
	manageable: boolean,
	name: string,
	provider: string,
	roles: UserRole[],
	username: string,
}

export type NewUser = {
	email?: string,
	name?: string,
	password: string,
	roles?: UserRole[],
	username: string,
}

type UsersState = {
	status: 'uninitialized' | 'loading' | 'succeeded' | 'failed',
	error: SerializedError | null,
	results: User[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
};

// Fill columns initially with columns defined in usersTableConfig
const initialColumns = usersTableConfig.columns.map((column) => ({
	...column,
	deactivated: false,
}));

// Initial state of users in redux store
const initialState: UsersState = {
	status: 'uninitialized',
  error: null,
	results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	offset: 0,
	limit: 0,
};

// fetch users from server
export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async (_, { getState }) => {
	const state = getState();
	let params = getURLParams(state, "users");
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get("/admin-ng/users/users.json", { params: params });
	return res.data;
});

// new user to backend
export const postNewUser = createAppAsyncThunk('users/postNewUser', async (values: NewUser, {dispatch}) => {
	// get URL params used for post request
	let data = buildUserBody(values);

	axios
		.post("/admin-ng/users", data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		// Usually we would extraReducers for responses, but reducers are not allowed to dispatch
		// (they need to be free of side effects)
		// Since we want to dispatch, we have to handle responses in our thunk
		.then((response) => {
			console.info(response);
			dispatch(addNotification({type: "success", key: "USER_ADDED"}));
		})
		.catch((response) => {
			console.error(response);
			dispatch(addNotification({type: "error", key: "USER_NOT_SAVED"}));
		});
});

// delete user with provided id
export const deleteUser = createAppAsyncThunk('users/deleteUser', async (id: string, {dispatch}) => {
	// API call for deleting an user
	axios
		.delete(`/admin-ng/users/${id}.json`)
		.then((res) => {
			console.info(res);
			// add success notification
			dispatch(addNotification({type: "success", key: "USER_DELETED"}));
		})
		.catch((res) => {
			console.error(res);
			// add error notification
			dispatch(addNotification({type: "error", key: "USER_NOT_DELETED"}));
		});
});

// get users and their user names
export const fetchUsersAndUsernames = async () => {
	let data = await axios.get(
		"/admin-ng/resources/USERS.NAME.AND.USERNAME.json"
	);

	const response = await data.data;

	return transformToIdValueArray(response);
};

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		setUserColumns(state, action: PayloadAction<
			UsersState["columns"]
		>) {
			state.columns = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			// fetchUsers
			.addCase(fetchUsers.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{
				total: UsersState["total"],
				count: UsersState["count"],
				limit: UsersState["limit"],
				offset: UsersState["offset"],
				results: UsersState["results"],
			}>) => {
				state.status = 'succeeded';
				const users = action.payload;
				state.total = users.total;
				state.count = users.count;
				state.limit = users.limit;
				state.offset = users.offset;
				state.results = users.results;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.status = 'failed';
				state.results = [];
				state.error = action.error;
			});
	}
});

export const { setUserColumns } = usersSlice.actions;

// Export the slice reducer as the default export
export default usersSlice.reducer;
