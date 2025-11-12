import { servicesTemplateMap } from "../../configs/tableConfigs/servicesTableMap";
import {
	loadServicesIntoTable,
} from "../../thunks/tableThunks";
import { getTotalServices } from "../../selectors/serviceSelector";
import { fetchServices } from "../../slices/serviceSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of services
 */
const Services = () => {
	return (
		<TablePage
			resource={"services"}
			fetchResource={fetchServices}
			loadResourceIntoTable={loadServicesIntoTable}
			getTotalResources={getTotalServices}
			navBarLinks={systemsLinks}
			caption={"SYSTEMS.SERVICES.TABLE.CAPTION"}
			templateMap={servicesTemplateMap}
		/>
	);
};

export default Services;
