import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { Playlist } from "./playlistSlice";
import { TransformedAcl } from "./aclDetailsSlice";
import { Acl } from "./aclSlice";
import { MetadataCatalog } from "./eventSlice";
import { addNotification } from "./notificationSlice";
import { NOTIFICATION_CONTEXT } from "../configs/modalConfig";
import { AppDispatch } from "../store";
import { PlaylistDetailsPage } from "../components/events/partials/modals/PlaylistDetails";


/**
 * This file contains redux reducer for actions affecting the state of playlist details
 */
export type PlaylistEntry = {
  contentId: string,
  type: string,
  title: string,
  date?: string,
  series?: string,
  presenters?: string[],
};


type PlaylistDetailsModal = {
  show: boolean,
  page: PlaylistDetailsPage,
  playlist: { id: string, title: string } | null,
}

type PlaylistDetailsState = {
  statusMetadata: "uninitialized" | "loading" | "succeeded" | "failed",
  errorMetadata: SerializedError | null,
  modal: PlaylistDetailsModal,
  metadata: MetadataCatalog,
  entries: PlaylistEntry[],
  entriesChanged: boolean,
  acl: TransformedAcl[],
  policyTemplateId: number,
}

/** Converts raw playlist response into `MetadataCatalog` format */
const playlistToMetadataCatalog = (playlist: Playlist): MetadataCatalog => ({
  title: "EVENTS.PLAYLISTS.DETAILS.TABS.METADATA",
  flavor: "playlist/details",
  fields: [
    {
      id: "title",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.TITLE",
      readOnly: false,
      required: true,
      type: "text",
      value: playlist.title,
    },
    {
      id: "description",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.DESCRIPTION",
      readOnly: false,
      required: false,
      type: "text_long",
      value: playlist.description,
    },
    {
      id: "creator",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.CREATOR",
      readOnly: false,
      required: false,
      type: "text",
      value: playlist.creator,
    },
    {
      id: "updated",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.UPDATED",
      readOnly: true,
      required: false,
      type: "date",
      value: playlist.updated,
    },
    {
      id: "entries",
      label: "EVENTS.PLAYLISTS.DETAILS.METADATA.ENTRIES",
      readOnly: true,
      required: false,
      type: "text",
      value: String(playlist.entries.length),
    },
  ],
});

const initialState: PlaylistDetailsState = {
  statusMetadata: "uninitialized",
  errorMetadata: null,
  modal: {
    show: false,
    page: PlaylistDetailsPage.Metadata,
    playlist: null,
  },
  metadata: {
    title: "",
    flavor: "",
    fields: [],
  },
  entries: [],
  entriesChanged: false,
  acl: [],
  policyTemplateId: 0,
};

/** Transforms raw ACL into the `TransformedAcl` format required by the UI */
const transformPlaylistAcl = (entries: Playlist["accessControlEntries"]): TransformedAcl[] => {
  const acl: TransformedAcl[] = [];

  for (const entry of entries || []) {
    const existing = acl.find(a => a.role === entry.role);

    if (existing) {
      existing.read = existing.read || (entry.action === "read" && entry.allow);
      existing.write = existing.write || (entry.action === "write" && entry.allow);
      if (entry.action !== "read" && entry.action !== "write") {
        existing.actions = [...existing.actions, entry.action];
      }
    } else {
      acl.push({
        role: entry.role,
        read: entry.action === "read" && entry.allow,
        write: entry.action === "write" && entry.allow,
        actions: (entry.action !== "read" && entry.action !== "write") ? [entry.action] : [],
      });
    }
  }

  return acl;
};

const mapEntries = (entries: Playlist["entries"]): PlaylistEntry[] =>
  entries.map(entry => ({
    contentId: entry.contentId,
    type: entry.type,
    title: entry.title ?? entry.contentId,
    date: entry.start_date,
    series: entry.series?.title,
    presenters: entry.presenters,
  }));

// Fetch playlist details (metadata + ACL + entries) from server in a single request
export const fetchPlaylistDetails = createAppAsyncThunk("playlistDetails/fetchPlaylistDetails", async (id: string) => {
  const res = await axios.get<Playlist>(`/admin-ng/playlists/${id}`);
  const playlist = res.data;

  return {
    metadata: playlistToMetadataCatalog(playlist),
    acl: transformPlaylistAcl(playlist.accessControlEntries),
    entries: mapEntries(playlist.entries),
  };
});


export const updatePlaylistMetadata = createAppAsyncThunk("playlistDetails/updatePlaylistMetadata", async (params: {
  id: string,
  values: { [key: string]: MetadataCatalog["fields"][0]["value"] },
  catalog: MetadataCatalog,
}, { dispatch }) => {
  const { id, values, catalog } = params;

  const updatePayload: Record<string, unknown> = {};
  for (const field of catalog.fields) {
    if (!field.readOnly && field.id in values) {
      updatePayload[field.id] = values[field.id];
    }
  }

  const data = new URLSearchParams();
  data.append("playlist", JSON.stringify(updatePayload));

  const res = await axios.put<Playlist>(`/admin-ng/playlists/${id}`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const updatedCatalog = playlistToMetadataCatalog(res.data);
  dispatch(setPlaylistDetailsMetadata(updatedCatalog));
});


export const updatePlaylistEntries = createAppAsyncThunk("playlistDetails/updatePlaylistEntries", async (params: {
  id: string,
  entries: PlaylistEntry[],
}, { dispatch }) => {
  const { id, entries } = params;

  const apiEntries = entries.map(e => ({ contentId: e.contentId, type: e.type }));
  const data = new URLSearchParams();
  data.append("playlist", JSON.stringify({ entries: apiEntries }));

  await axios.put(`/admin-ng/playlists/${id}`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  dispatch(setPlaylistEntriesChanged(false));

  dispatch(addNotification({
    type: "info",
    key: "PLAYLIST_ENTRIES_UPDATED",
    duration: 3,
    context: NOTIFICATION_CONTEXT,
  }));
});


export const updatePlaylistAccess = createAppAsyncThunk("playlistDetails/updatePlaylistAccess", async (params: {
  id: string,
  policies: { acl: Acl },
  override?: boolean,
}, { dispatch }) => {
  const { id, policies } = params;

  // Convert ACL back to the format expected by the API.
  const accessControlEntries = policies.acl.ace.map(ace => ({
    allow: ace.allow,
    role: ace.role,
    action: ace.action,
  }));

  const data = new URLSearchParams();
  data.append("playlist", JSON.stringify({ accessControlEntries }));

  await axios.put(`/admin-ng/playlists/${id}`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  dispatch(addNotification({
    type: "info",
    key: "SAVED_ACL_RULES",
    duration: 3,
    context: NOTIFICATION_CONTEXT,
  }));

  // Refetch to get updated ACL
  const res = await axios.get<Playlist>(`/admin-ng/playlists/${id}`);
  dispatch(setPlaylistDetailsAcl(transformPlaylistAcl(res.data.accessControlEntries)));

  return true;
});


export const openModal = (
  page: PlaylistDetailsPage,
  playlist: PlaylistDetailsModal["playlist"],
) => (dispatch: AppDispatch) => {
  dispatch(setModalPlaylist(playlist));
  dispatch(setModalPage(page));
  dispatch(setShowModal(true));
};

const playlistDetailsSlice = createSlice({
  name: "playlistDetails",
  initialState,
  reducers: {
    setShowModal(state, action: PayloadAction<PlaylistDetailsState["modal"]["show"]>) {
      state.modal.show = action.payload;
    },
    setModalPage(state, action: PayloadAction<PlaylistDetailsState["modal"]["page"]>) {
      state.modal.page = action.payload;
    },
    setModalPlaylist(state, action: PayloadAction<PlaylistDetailsState["modal"]["playlist"]>) {
      state.modal.playlist = action.payload;
    },
    setPlaylistDetailsMetadata(state, action: PayloadAction<PlaylistDetailsState["metadata"]>) {
      state.metadata = action.payload;
    },
    setPlaylistDetailsAcl(state, action: PayloadAction<PlaylistDetailsState["acl"]>) {
      state.acl = action.payload;
    },
    setPlaylistDetailsEntries(state, action: PayloadAction<PlaylistDetailsState["entries"]>) {
      state.entries = action.payload;
    },
    setPlaylistEntriesChanged(state, action: PayloadAction<boolean>) {
      state.entriesChanged = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPlaylistDetails.pending, state => {
        state.statusMetadata = "loading";
      })
      .addCase(fetchPlaylistDetails.fulfilled, (state, action: PayloadAction<{
        metadata: MetadataCatalog,
        acl: TransformedAcl[],
        entries: PlaylistEntry[],
      }>) => {
        state.statusMetadata = "succeeded";
        state.metadata = action.payload.metadata;
        state.acl = action.payload.acl;
        state.entries = action.payload.entries;
        state.entriesChanged = false;
      })
      .addCase(fetchPlaylistDetails.rejected, (state, action) => {
        state.statusMetadata = "failed";
        state.errorMetadata = action.error;
      });
  },
});

export const {
  setShowModal,
  setModalPage,
  setModalPlaylist,
  setPlaylistDetailsMetadata,
  setPlaylistDetailsAcl,
  setPlaylistDetailsEntries,
  setPlaylistEntriesChanged,
} = playlistDetailsSlice.actions;

export default playlistDetailsSlice.reducer;
