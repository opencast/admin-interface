import { fetchPlaylists, Playlist } from "../../../slices/playlistSlice";
import { loadPlaylistsIntoTable } from "../../../thunks/tableThunks";
import MultiValueCell from "../../shared/MultiValueCell";

/**
 * This component renders the creator cells of playlists in the table view
 */
const PlaylistCreatorCell = ({ row }: { row: Playlist }) => (
  <MultiValueCell
    resource="playlists"
    values={[row.creator]}
    filterName="creator"
    fetchResource={fetchPlaylists}
    loadResourceIntoTable={loadPlaylistsIntoTable}
  />
);

export default PlaylistCreatorCell;
