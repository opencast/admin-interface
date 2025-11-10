import { RootState } from "../store";

/**
 * This file contains selectors regarding events
 */
export const getEvents = (state: RootState) => state.events.results;
export const getVisibilityEventColumns = (state: RootState) => state.events.columns;
export const isShowActions = (state: RootState) => state.events.showActions;
export const isLoading = (state: RootState) => state.events.status === "loading";
export const getEventMetadata = (state: RootState) => state.events.metadata;
export const getExtendedEventMetadata = (state: RootState) => state.events.extendedMetadata;
export const isLoadingScheduling = (state: RootState) =>
	state.events.statusSchedulingInfo === "loading";
export const getSchedulingEditedEvents = (state: RootState) =>
	state.events.schedulingInfo.editedEvents;
export const getSchedulingSeriesOptions = (state: RootState) =>
	state.events.schedulingInfo.seriesOptions;
export const getTotalEvents = (state: RootState) => state.events.total;
export const getAssetUploadOptions = (state: RootState) => state.events.uploadAssetOptions;
export const getSourceUploadOptions = (state: RootState) => state.events.uploadSourceOptions;
export const isFetchingAssetUploadOptions = (state: RootState) =>
	state.events.isFetchingAssetUploadOptions;
export const getAssetUploadWorkflow = (state: RootState) =>
	state.events.uploadAssetWorkflow;
