import { servicesTemplateMap } from "../../configs/tableConfigs/servicesTableMap";
import { getTotalServices } from "../../selectors/serviceSelector";
import { Service } from "../../slices/serviceSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import TablePage from "../shared/TablePage";
import { Row } from "../../slices/tableSlice";
import { Server } from "../../slices/serverSlice";

/**
 * This component renders the table view of services
 */
const Services = () => {
	return (
		<TablePage<Row & Service & Server>
			resource={"services"}
			getTotalResources={getTotalServices}
			navBarLinks={systemsLinks}
			caption={"SYSTEMS.SERVICES.TABLE.CAPTION"}
			templateMap={servicesTemplateMap}
		/>
	);
};

export default Services;
