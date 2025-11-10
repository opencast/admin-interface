import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

/* selectors for modal */
export const showModal = (state: RootState) => state.eventDetails.modal.show;
export const getModalPage = (state: RootState) => state.eventDetails.modal.page;
export const getModalEvent = (state: RootState) => state.eventDetails.modal.event;
export const getModalWorkflowId = (state: RootState) => state.eventDetails.modal.workflowId;
export const getModalWorkflowTabHierarchy = (state: RootState) =>
	state.eventDetails.modal.workflowTabHierarchy;
export const getModalAssetsTabHierarchy = (state: RootState) =>
	state.eventDetails.modal.assetsTabHierarchy;

/* selectors for metadata */
export const getMetadata = (state: RootState) => state.eventDetails.metadata;
export const getExtendedMetadata = (state: RootState) => state.eventDetails.extendedMetadata;
export const isFetchingMetadata = (state: RootState) =>
	state.eventDetails.statusMetadata === "loading";

/* selectors for assets */
export const getAssets = (state: RootState) => state.eventDetails.assets;
export const isFetchingAssets = (state: RootState) =>
	state.eventDetails.statusAssets === "loading";
export const isFetchingAssetAttachments = (state: RootState) =>
	state.eventDetails.statusAssetAttachments === "loading";
export const isFetchingAssetAttachmentDetails = (state: RootState) =>
	state.eventDetails.statusAssetAttachmentDetails === "loading";
export const isFetchingAssetCatalogs = (state: RootState) =>
	state.eventDetails.statusAssetCatalogs === "loading";
export const isFetchingAssetCatalogDetails = (state: RootState) =>
	state.eventDetails.statusAssetCatalogDetails === "loading";
export const isFetchingAssetMedia = (state: RootState) =>
	state.eventDetails.statusAssetMedia === "loading";
export const isFetchingAssetMediaDetails = (state: RootState) =>
	state.eventDetails.statusAssetMediaDetails === "loading";
export const isFetchingAssetPublications = (state: RootState) =>
	state.eventDetails.statusAssetPublications === "loading";
export const isFetchingAssetPublicationDetails = (state: RootState) =>
	state.eventDetails.statusAssetPublicationDetails === "loading";
export const isTransactionReadOnly = (state: RootState) =>
	state.eventDetails.transactionsReadOnly;
export const getUploadAssetOptions = (state: RootState) =>
	state.eventDetails.uploadAssetOptions;
export const getUploadSourceOptions = (state: RootState) =>
	state.eventDetails.uploadSourceOptions;
export const getAssetAttachments = (state: RootState) =>
	state.eventDetails.assetAttachments;
export const getAssetAttachmentDetails = (state: RootState) =>
	state.eventDetails.assetAttachmentDetails;
export const getAssetCatalogs = (state: RootState) => state.eventDetails.assetCatalogs;
export const getAssetCatalogDetails = (state: RootState) =>
	state.eventDetails.assetCatalogDetails;
export const getAssetMedia = (state: RootState) => state.eventDetails.assetMedia;
export const getAssetMediaDetails = (state: RootState) =>
	state.eventDetails.assetMediaDetails;
export const getAssetPublications = (state: RootState) =>
	state.eventDetails.assetPublications;
export const getAssetPublicationDetails = (state: RootState) =>
	state.eventDetails.assetPublicationDetails;

/* selectors for policies */
export const getPolicies = (state: RootState) => state.eventDetails.policies;
export const getPolicyTemplateId = (state: RootState) => state.eventDetails.policyTemplateId;

/* selectors for comments */
export const getComments = (state: RootState) => state.eventDetails.comments;
export const getCommentReasons = (state: RootState) => state.eventDetails.commentReasons;
export const isFetchingComments = (state: RootState) =>
	state.eventDetails.statusComments === "loading";
export const isSavingComment = (state: RootState) =>
	state.eventDetails.statusSaveComment === "loading";
export const isSavingCommentReply = (state: RootState) =>
	state.eventDetails.statusSaveCommentReply === "loading";

/* selectors for scheduling */
export const getSchedulingProperties = (state: RootState) =>
	state.eventDetails.scheduling.hasProperties;
export const isFetchingScheduling = (state: RootState) =>
	state.eventDetails.statusScheduling === "loading";
export const isSavingScheduling = (state: RootState) =>
	state.eventDetails.statusSaveScheduling === "loading";
export const getSchedulingSource = (state: RootState) =>
	state.eventDetails.schedulingSource;
export const getSchedulingConflicts = (state: RootState) =>
	state.eventDetails.schedulingConflicts;
export const isCheckingConflicts = (state: RootState) =>
	state.eventDetails.statusCheckConflicts === "loading";

/* selectors for workflows */
export const getWorkflows = (state: RootState) => state.eventDetails.workflows;
export const getWorkflowsSortedByDate = createSelector(
	[getWorkflows],
	workflows => {
		return ({
			...workflows,
			entries: [...workflows.entries].sort(
				(a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime(),
			),
		});
	},
);
export const isFetchingWorkflows = (state: RootState) =>
	state.eventDetails.statusWorkflows === "loading";
export const getWorkflowDefinitions = (state: RootState) =>
	state.eventDetails.workflowDefinitions;
export const getWorkflowConfiguration = (state: RootState) =>
	state.eventDetails.workflowConfiguration;
export const getWorkflow = (state: RootState) => state.eventDetails.workflows.workflow;
export const isFetchingWorkflowDetails = (state: RootState) =>
	state.eventDetails.statusWorkflowDetails === "loading" || state.eventDetails.statusWorkflowDetails === "uninitialized";
export const getBaseWorkflow = (state: RootState) => state.eventDetails.baseWorkflow;
export const performingWorkflowAction = (state: RootState) =>
	state.eventDetails.statusDoWorkflowAction === "loading";
export const deletingWorkflow = (state: RootState) =>
	state.eventDetails.statusDeleteWorkflow === "loading";
export const getWorkflowOperations = (state: RootState) =>
	state.eventDetails.workflowOperations;
// Get the workflow operation currently running (or the last one that was run)
export const getLatestWorkflowOperation = createSelector(
	[getWorkflowOperations],
	operations => {
		const entries = operations.entries;

		for (let i = entries.length - 1; i >= 0; i--) {
			const operation = entries[i];
			if (operation.id !== null) {
				return { operation, index: i };
			}
		}

		return null; // if none found
	},
);
// Get operation by root_job_id, or jobId
export const getWorkflowByJobId = createSelector(
	[
		getWorkflowOperations,
		(_operations, rootJobId: number) => rootJobId,
		(_operations, _rootJobId: number, jobId: number) => jobId,
	],
	(operations, rootJobId, jobId) => {
		let operation = null;
		let index = null;

		index = operations.entries.findIndex(
			entry => entry.id === rootJobId,
		);
		operation = operations.entries[index];

		if (!operation) {
			index = operations.entries.findIndex(
				entry => entry.id === jobId,
			);
			operation = operations.entries[index];
		}

		if (operation) {
			return { operation, index };
		}

		return null;
	},
);
export const isFetchingWorkflowOperations = (state: RootState) =>
	state.eventDetails.statusWorkflowOperations === "loading";
export const getWorkflowOperationDetails = (state: RootState) =>
	state.eventDetails.workflowOperationDetails;
export const isFetchingWorkflowOperationDetails = (state: RootState) =>
	state.eventDetails.statusWorkflowOperationDetails === "loading";
export const getWorkflowErrors = (state: RootState) => state.eventDetails.workflowErrors;
export const isFetchingWorkflowErrors = (state: RootState) =>
	state.eventDetails.statusWorkflowErrors === "loading";
export const getWorkflowErrorDetails = (state: RootState) =>
	state.eventDetails.workflowErrorDetails;
export const isFetchingWorkflowErrorDetails = (state: RootState) =>
	state.eventDetails.statusWorkflowErrorDetails === "loading";

export const getEventDetailsTobiraData = (state: RootState) =>
	state.eventDetails.tobiraData;
export const getEventDetailsTobiraDataError = (state: RootState) =>
	state.eventDetails.errorTobiraData;
export const getEventDetailsTobiraStatus = (state: RootState) =>
	state.eventDetails.statusTobiraData;

/* selectors for publications */
export const getPublications = (state: RootState) => state.eventDetails.publications;

/* selectors for statistics */
export const hasStatistics = (state: RootState) =>
	state.eventDetails.statistics.length > 0;
export const getStatistics = (state: RootState) => state.eventDetails.statistics;
export const hasStatisticsError = (state: RootState) =>
	state.eventDetails.hasStatisticsError;
export const isFetchingStatistics = (state: RootState) =>
	state.eventDetails.statusStatistics === "loading";
