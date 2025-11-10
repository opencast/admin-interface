import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

/**
 * This file contains selectors regarding acls
 */
export const getAcls = (state: RootState) => state.acls.results;
export const getTotalAcls = (state: RootState) => state.acls.total;
export const getAclDefaults = (state: RootState) => state.acls.aclDefaults;
export const getAclDefaultActions = createSelector(
	[getAclDefaults],
	aclDefaults => aclDefaults["default_actions"] ? aclDefaults["default_actions"].split(",") : [], // derived value
);
export const getAclDefaultTemplate = (state: RootState) => state.acls.aclDefaultTemplate;
