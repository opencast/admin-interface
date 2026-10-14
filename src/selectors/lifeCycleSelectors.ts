import { RootState } from "../store";

/**
 * This file contains selectors regarding acls
 */
export const getLifeCyclePolicies = (state: RootState) => state.lifeCycle.results;
export const getTotalLifeCyclePolicies = (state: RootState) => state.lifeCycle.total;
