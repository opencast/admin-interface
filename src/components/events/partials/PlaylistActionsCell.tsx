import { LuFileText } from "react-icons/lu";

import { fetchPlaylistDetails, openModal } from "../../../slices/playlistDetailsSlice";
import { useAppDispatch } from "../../../store";
import { Playlist } from "../../../slices/playlistSlice";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";
import { PlaylistDetailsPage } from "./modals/PlaylistDetails";


/**
 * This component renders the action cells of playlists in the table view
 */
const PlaylistActionsCell = ({
  row,
}: {
  row: Playlist
}) => {
  const dispatch = useAppDispatch();

  const showPlaylistDetailsModal = async () => {
    await dispatch(fetchPlaylistDetails(row.id));

    dispatch(openModal(PlaylistDetailsPage.Metadata, { id: row.id, title: row.title }));
  };

  return <>
    {/* playlist details */}
    <ButtonLikeAnchor
      onClick={() => showPlaylistDetailsModal()}
      className={"action-cell-button more-series"}
      editAccessRole={"ROLE_UI_PLAYLISTS_DETAILS_VIEW"}
    >
      <LuFileText />
    </ButtonLikeAnchor>
  </>;
};

export default PlaylistActionsCell;
