import { createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import axios from "axios";

import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { getURLParams, prepareAccessPolicyRulesForPost } from "../utils/resourceUtils";
import { playlistsTableConfig } from "../configs/tableConfigs/playlistsTableConfig";
import { addNotification } from "./notificationSlice";
import { TransformedAcl } from "./aclDetailsSlice";
import { PlaylistEntry } from "./playlistDetailsSlice";
import { MetadataCatalog } from "./eventSlice";
import { AppThunk } from "../store";

/**
 * Build the metadata catalog for new playlist creation.
 * Unlike series/events, playlists don't have a backend metadata endpoint —
 * the fields are derived from the playlist model itself.
 * The creator field is read-only and pre-filled with the current user's name.
 */
export const getNewPlaylistMetadataFields = (creatorName: string): MetadataCatalog => ({
  title: "EVENTS.PLAYLISTS.NEW.METADATA.CAPTION",
  flavor: "playlist/details",
  fields: [
    {
      id: "title",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.TITLE",
      readOnly: false,
      required: true,
      type: "text",
      value: "",
    },
    {
      id: "description",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.DESCRIPTION",
      readOnly: false,
      required: false,
      type: "text_long",
      value: "",
    },
    {
      id: "creator",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.CREATOR",
      readOnly: true,
      required: false,
      type: "text",
      value: creatorName,
    },
  ],
});


export type Playlist = {
    id: string;
    organization?: string;
    entries: {
        id: number;
        contentId: string;
        type: string;
        title?: string;
        start_date?: string;
        series?: { id: string, title: string };
        presenters?: string[];
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


type FetchPlaylists = {
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


export const postNewPlaylist = (params: {
  values: {
    policies: TransformedAcl[],
    metadata: { [key: string]: unknown },
    entries: PlaylistEntry[],
  },
  metadataFields: { title: string, description: string, creator: string },
}): AppThunk => dispatch => {
  const { values, metadataFields } = params;

  // Build payload from form values
  const playlist: Record<string, unknown> = {
    title: metadataFields.title,
    description: metadataFields.description,
    creator: metadataFields.creator,
    entries: (values.entries || []).map(e => ({ contentId: e.contentId, type: e.type })),
  };

  // Build ACL
  const access = prepareAccessPolicyRulesForPost(values.policies);
  const accessControlEntries: { allow: boolean, role: string, action: string }[] = [];
  if (access.acl?.ace) {
    for (const ace of access.acl.ace) {
      accessControlEntries.push({ allow: ace.allow, role: ace.role, action: ace.action });
    }
  }
  playlist.accessControlEntries = accessControlEntries;

  const data = new URLSearchParams();
  data.append("playlist", JSON.stringify(playlist));

  axios
    .post("/admin-ng/playlists", data.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then(response => {
      console.info(response);
      dispatch(addNotification({ type: "success", key: "PLAYLIST_ADDED" }));
    })
    .catch(response => {
      console.error(response);
      dispatch(addNotification({ type: "error", key: "PLAYLIST_NOT_SAVED" }));
    });
};


export const deletePlaylist = (id: Playlist["id"]): AppThunk => dispatch => {
  axios
    .delete(`/admin-ng/playlists/${id}`)
    .then(res => {
      console.info(res);
      dispatch(addNotification({ type: "success", key: "PLAYLIST_DELETED" }));
    })
    .catch(res => {
      console.error(res);
      dispatch(addNotification({ type: "error", key: "PLAYLIST_NOT_DELETED" }));
    });
};


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

export const { setPlaylistColumns } = playlistSlice.actions;

export default playlistSlice.reducer;
