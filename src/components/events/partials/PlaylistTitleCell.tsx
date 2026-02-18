import { Playlist } from "../../../slices/playlistSlice";

/**
 * This component renders the title cells of playlists in the table view
 */
const PlaylistTitleCell = ({ row }: { row: Playlist }) => <span>{row.title}</span>;

export default PlaylistTitleCell;
