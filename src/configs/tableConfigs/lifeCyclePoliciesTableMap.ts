import LifeCyclePolicyActionCell from "../../components/events/partials/LifeCyclePolicyActionCell";
import LifeCyclePolicyIsActiveCell from "../../components/events/partials/LifeCyclePolicyIsActiveCell";

/**
 * This map contains the mapping between the template strings above and the corresponding react component.
 * This helps to render different templates of cells more dynamically
 */
export const lifeCyclePoliciesTemplateMap = {
	LifeCyclePolicyIsActiveCell: LifeCyclePolicyIsActiveCell,
	LifeCyclePolicyActionCell: LifeCyclePolicyActionCell,
};
