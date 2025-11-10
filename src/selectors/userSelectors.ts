/**
 * This file contains selectors regarding users
 */
import { createSelector } from "reselect";
import { RootState } from "../store";

export const getUsers = (state: RootState) => state.users.results;
export const getTotalUsers = (state: RootState) => state.users.total;

export const getUsernames = createSelector(getUsers, users => {
	return users.map(user => user.username);
});
