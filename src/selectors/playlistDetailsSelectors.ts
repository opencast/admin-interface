import { RootState } from "../store";

/**
 * This file contains selectors regarding details of a playlist
 */

export const showModal = (state: RootState) => state.playlistDetails.modal.show;
export const getModalPage = (state: RootState) => state.playlistDetails.modal.page;
export const getModalPlaylist = (state: RootState) => state.playlistDetails.modal.playlist;

export const getPlaylistDetailsMetadata = (state: RootState) => state.playlistDetails.metadata;
export const getPlaylistDetailsEntries = (state: RootState) => state.playlistDetails.entries;
export const getPlaylistDetailsEntriesChanged = (state: RootState) => state.playlistDetails.entriesChanged;
export const getPlaylistDetailsAcl = (state: RootState) => state.playlistDetails.acl;
export const getPlaylistDetailsPolicyTemplateId = (state: RootState) => state.playlistDetails.policyTemplateId;
