import { serversTemplateMap } from "../../configs/tableConfigs/serversTableMap";
import { getTotalServers } from "../../selectors/serverSelectors";
import {
	loadServersIntoTable,
} from "../../thunks/tableThunks";
import { fetchServers } from "../../slices/serverSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of servers
 */
const Servers = () => {
	return (
		<TablePage
			resource={"servers"}
			fetchResource={fetchServers}
			loadResourceIntoTable={loadServersIntoTable}
			getTotalResources={getTotalServers}
			navBarLinks={systemsLinks}
			caption={"SYSTEMS.SERVERS.TABLE.CAPTION"}
			templateMap={serversTemplateMap}
		/>
	);
};

export default Servers;
