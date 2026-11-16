import { serversTemplateMap } from "../../configs/tableConfigs/serversTableMap";
import { getTotalServers } from "../../selectors/serverSelectors";
import { Server } from "../../slices/serverSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import TablePage from "../shared/TablePage";
import { Row } from "../../slices/tableSlice";

/**
 * This component renders the table view of servers
 */
const Servers = () => {
	return (
		<TablePage<Row & Server>
			resource={"servers"}
			getTotalResources={getTotalServers}
			navBarLinks={systemsLinks}
			caption={"SYSTEMS.SERVERS.TABLE.CAPTION"}
			templateMap={serversTemplateMap}
		/>
	);
};

export default Servers;
