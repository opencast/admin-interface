import { RootState } from "../store";

/**
 * This file contains selectors regarding playlists
 */
export const getPlaylists = (state: RootState) => state.playlists.results;
export const getVisibilityPlaylistColumns = (state: RootState) => state.playlists.columns;
export const isLoading = (state: RootState) => state.playlists.status === "loading";
export const getTotalPlaylists = (state: RootState) => state.playlists.total;
