import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  getPlaylistDetailsEntries,
  getPlaylistDetailsEntriesChanged,
} from "../../../../selectors/playlistDetailsSelectors";
import {
  PlaylistEntry,
  fetchPlaylistDetails,
  setPlaylistDetailsEntries,
  setPlaylistEntriesChanged,
  updatePlaylistEntries,
} from "../../../../slices/playlistDetailsSlice";
import { SaveEditFooter } from "../../../shared/SaveEditFooter";
import PlaylistEntriesEditor from "./PlaylistEntriesEditor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";


/* Entries management for existing playlist details */
const PlaylistDetailsEntriesTab = ({
  playlistId,
}: {
  playlistId: string,
}) => {
  const dispatch = useAppDispatch();

  const entries = useAppSelector(
    state => getPlaylistDetailsEntries(state),
  );

  const entriesChanged = useAppSelector(
    state => getPlaylistDetailsEntriesChanged(state),
  );

  const setEntries = useCallback((updated: PlaylistEntry[]) => {
    dispatch(setPlaylistDetailsEntries(updated));
    dispatch(setPlaylistEntriesChanged(true));
  }, [dispatch]);

  const saveEntries = () => {
    void dispatch(updatePlaylistEntries({ id: playlistId, entries }));
  };

  const resetEntries = () => {
    void dispatch(fetchPlaylistDetails(playlistId));
  };

  return <>
    <ModalContentTable>
      <PlaylistEntriesEditor
        entries={entries}
        setEntries={setEntries}
        showEngageLinks
      />
    </ModalContentTable>

    <SaveEditFooter
      active={entriesChanged}
      isValid={true}
      reset={resetEntries}
      submit={saveEntries}
    />
  </>;
};

export default PlaylistDetailsEntriesTab;
