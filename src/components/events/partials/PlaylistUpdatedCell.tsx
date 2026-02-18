;import { fetchPlaylists, Playlist } from "../../../slices/playlistSlice";
import { loadPlaylistsIntoTable } from "../../../thunks/tableThunks";
import DateTimeCell from "../../shared/DateTimeCell";

/**
 * This component renders the updated date cells of playlists in the table view
 */
const PlaylistUpdatedCell = ({ row }: { row: Playlist }) => row.updated !== undefined ? (
  <DateTimeCell
    resource="playlists"
    date={row.updated}
    filterName="Updated"
    fetchResource={fetchPlaylists}
    loadResourceIntoTable={loadPlaylistsIntoTable}
  />
) : <></>;

export default PlaylistUpdatedCell;
