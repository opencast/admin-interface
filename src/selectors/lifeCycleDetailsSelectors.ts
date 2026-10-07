import { RootState } from "../store";

/**
 * This file contains selectors regarding details of a certain lifeCyclePolicy/capture agent
 */
/* selectors for modal */
export const showModal = (state: RootState) => state.lifeCyclePolicyDetails.modal.show;
export const getModalLifeCyclePolicy = (state: RootState) => state.lifeCyclePolicyDetails.modal.policy;

export const getLifeCyclePolicyDetails = (state: RootState) => state.lifeCyclePolicyDetails;
export const getLifeCyclePolicyDetailsAcl = (state: RootState) => state.lifeCyclePolicyDetails.accessControlEntries;
export const getLifeCyclePolicyActions = (state: RootState) => state.lifeCyclePolicyDetails.actionsEnum;
export const getLifeCyclePolicyTargetTypes = (state: RootState) => state.lifeCyclePolicyDetails.targetTypesEnum;
export const getLifeCyclePolicyTimings = (state: RootState) => state.lifeCyclePolicyDetails.timingsEnum;
