import MeanRunTimeCell from "../../components/systems/partials/MeanRunTimeCell";
import MeanQueueTimeCell from "../../components/systems/partials/MeanQueueTimeCell";
import ServicesActionCell from "../../components/systems/partials/ServicesActionsCell";
import ServersStatusCell from "../../components/systems/partials/ServersStatusCell";

/**
 * This map contains the mapping between the template strings above and the corresponding react component.
 * This helps to render different templates of cells more dynamically. Even empty needed, because Table component
 * uses template map.
 */
export const servicesTemplateMap = {
	ServersStatusCell: ServersStatusCell,
	MeanRunTimeCell: MeanRunTimeCell,
	MeanQueueTimeCell: MeanQueueTimeCell,
	ServicesActionsCell: ServicesActionCell,
};
