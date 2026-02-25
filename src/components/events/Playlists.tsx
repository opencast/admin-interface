;import TablePage from "../shared/TablePage";
import { fetchPlaylists } from "../../slices/playlistSlice";
import { loadPlaylistsIntoTable } from "../../thunks/tableThunks";
import { getTotalPlaylists } from "../../selectors/playlistSelectors";
import { eventsLinks } from "./partials/EventsNavigation";
import { playlistsTemplateMap } from "../../configs/tableConfigs/playlistsTableMap";
import PlaylistDetailsModal from "./partials/modals/PlaylistDetailsModal";


/**
 * This component renders the table view of playlists
 */
const Playlists = () => <>
  <TablePage
    resource={"playlists"}
    fetchResource={fetchPlaylists}
    loadResourceIntoTable={loadPlaylistsIntoTable}
    getTotalResources={getTotalPlaylists}
    navBarLinks={eventsLinks}
    caption={"EVENTS.PLAYLISTS.TABLE.CAPTION"}
    templateMap={playlistsTemplateMap}
  />
  <PlaylistDetailsModal />
</>;

export default Playlists;
