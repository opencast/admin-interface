import { Server } from "../../../slices/serverSlice";

/**
 * This component renders the status cells of servers in the table view
 */
const ServersStatusCell = ({
	row,
}: {
	row: Server
}) => {
	return row.online && !row.maintenance ? (
		<div className="circle green" />
	) : row.online && row.maintenance ? (
		<div className="circle yellow" />
	) : !row.online ? (
		<div className="circle red" />
	) : <></>;
};

export default ServersStatusCell;
