import React from "react";
import { loadServersIntoTable } from "../../../thunks/tableThunks";
import { getUserInformation } from "../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
	Server,
	fetchServers,
	setServerMaintenance,
} from "../../../slices/serverSlice";

/**
 * This component renders the maintenance cells of servers in the table view
 */
const ServersMaintenanceCell = ({
	row,
}: {
	row: Server
}) => {
	const user = useAppSelector(state => getUserInformation(state));
	const dispatch = useAppDispatch();

	const onClickCheckbox = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await dispatch(setServerMaintenance({ host: row.hostname, maintenance: e.target.checked }));
		await dispatch(fetchServers());
		dispatch(loadServersIntoTable());
	};

	return (
		<>
			{hasAccess("ROLE_UI_SERVERS_MAINTENANCE_EDIT", user) && (
				<input
					type="checkbox"
					onChange={e => onClickCheckbox(e)}
					name="maintenanceStatus"
					checked={row.maintenance}
				/>
			)}
		</>
	);
};

export default ServersMaintenanceCell;
