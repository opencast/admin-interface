import { createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import axios from "axios";

import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { getURLParams } from "../utils/resourceUtils";
import { playlistsTableConfig } from "../configs/tableConfigs/playlistsTableConfig";


export type Playlist = {
    id: string;
    organization?: string;
    entries: {
        id: number;
        contentId: string;
        type: string;
    }[];
    title: string;
    description: string;
    creator: string;
    updated: string;
    accessControlEntries: {
        id?: number;
        allow: boolean;
        role: string;
        action: string;
    }[];
};


type PlaylistState = {
  status: "uninitialized" | "loading" | "succeeded" | "failed",
  error: SerializedError | null,
  results: Playlist[],
  columns: TableConfig["columns"],
  total: number,
  count: number,
  offset: number,
  limit: number,
}


const initialColumns = playlistsTableConfig.columns.map(column => ({
  ...column,
  deactivated: false,
}));


const initialState: PlaylistState = {
  status: "uninitialized",
  error: null,
  results: [],
  columns: initialColumns,
  total: 0,
  count: 0,
  offset: 0,
  limit: 0,
};

export type FetchPlaylists = {
    offset: number,
    limit: number,
    results: Playlist[],
};


export const fetchPlaylists = createAppAsyncThunk("playlists/fetchPlaylists", async (_, { getState }) => {
  const state = getState();
  const params = getURLParams(state, "playlists");

  const res = await axios.get<FetchPlaylists>("/admin-ng/playlists", { params: params });

  return res.data;
});

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlaylistColumns(state, action: PayloadAction<PlaylistState["columns"]>) {
      state.columns = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchPlaylists.pending, state => {
        state.status = "loading";
      })
      .addCase(fetchPlaylists.fulfilled, (state, action: PayloadAction<FetchPlaylists>) => {
        state.status = "succeeded";
        const playlist = action.payload;
        state.limit = playlist.limit;
        state.offset = playlist.offset;
        state.results = playlist.results;
        state.total = playlist.results.length;
        state.count = playlist.results.length;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error;
      });
  },
});

export const {
  setPlaylistColumns,
} = playlistSlice.actions;

export default playlistSlice.reducer;

