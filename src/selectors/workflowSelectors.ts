import { createSelector } from "reselect";
import { RootState } from "../store";

/**
 * This file contains selectors regarding workflows
 */
export const getWorkflowDef = (state: RootState) => state.workflows.workflows;

const workflows = (state: RootState) => state.workflows;

export const getWorkflowDefById = createSelector(
	[workflows, (_workflows, workflowId: string) => workflowId],
	(workflows, workflowId) => {
		return workflows.workflows.find(
			workflow => workflow.id === workflowId,
		);
	},
);
