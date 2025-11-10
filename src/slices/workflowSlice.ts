import camelcaseKeys from "camelcase-keys";
import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";

/**
 * This file contains redux reducer for actions affecting the state of workflows
 */
export type FieldSetField = {
	name: string
	value: unknown,
	type: string,
	checked: boolean,
	fieldset?: FieldSetField[]
	defaultValue?: unknown
	max?: number // number field
	min?: number // number field
	[key: string]: unknown
}

type ConfigurationPanelField = {
	// We could potentially specify 'fieldset' more, but I cannot find a definition
	// for which key value pairs are allowed
	fieldset?: FieldSetField[]  // Values can be anything
	legend?: string,
	description?: string,
}

export type Workflow = {
	configurationPanel: string,  // XML
	configurationPanelJson: string | ConfigurationPanelField[],  // 'string' will always be the empty string
	description: string,
	displayOrder: number,
	id: string,
	tags: string[],
	title: string,
}

type WorkflowState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	defaultWorkflowId: string,
	workflows: Workflow[],
};

// Initial state of workflows in redux store
const initialState: WorkflowState = {
	status: "uninitialized",
	error: null,
	defaultWorkflowId: "",
	workflows: [],
};

// fetch workflow definitions from server
export const fetchWorkflowDef = createAppAsyncThunk("workflow/fetchWorkflowDef", async (type: string) => {
	type NewProcessing = {
		default_workflow_id: string,
		workflows: Workflow[],
	}
	let urlParams;

	switch (type) {
		case "tasks": {
			urlParams = {
				tags: "archive",
			};
			break;
		}
		case "delete-event": {
			urlParams = {
				tags: "delete",
			};
			break;
		}
		case "event-details":
			urlParams = {
				tags: "schedule",
			};
			break;
		default: {
			urlParams = {
				tags: "upload,schedule",
			};
		}
	}

	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get<NewProcessing>("/admin-ng/event/new/processing?", { params: urlParams });

	let workflows = camelcaseKeys(res.data.workflows);

	workflows = workflows.map((workflow: Workflow) => {
		if (workflow.configurationPanelJson.length > 0) {
			return {
				...workflow,
				// TODO: Handle JSON parsing errors
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				configurationPanelJson: JSON.parse(
					workflow.configurationPanelJson as string,
				),
			};
		} else {
			return workflow;
		}
	});

	const workflowDef = {
		defaultWorkflowId: res.data.default_workflow_id,
		workflows: workflows,
	};

	return workflowDef;
});

const workflowSlice = createSlice({
	name: "workflow",
	initialState,
	reducers: {},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchWorkflowDef.pending, state => {
				state.status = "loading";
			})
			// Pass the generated action creators to `.addCase()`
			.addCase(fetchWorkflowDef.fulfilled, (state, action: PayloadAction<{
				defaultWorkflowId: WorkflowState["defaultWorkflowId"],
				workflows: WorkflowState["workflows"],
			}>) => {
				// Same "mutating" update syntax thanks to Immer
				state.status = "succeeded";
				const acls = action.payload;
				state.defaultWorkflowId = acls.defaultWorkflowId;
				state.workflows = acls.workflows;
			})
			.addCase(fetchWorkflowDef.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error;
			});
	},
});

// export const {} = workflowSlice.actions;

// Export the slice reducer as the default export
export default workflowSlice.reducer;
