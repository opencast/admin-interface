import { LifeCyclePolicy } from "../../../slices/lifeCycleSlice";

/**
 * This component renders the maintenance cells of servers in the table view
 */
const LifeCyclePolicyIsActiveCell = ({
	row,
}: {
	row: LifeCyclePolicy
}) => {

	return (
		<input
			type="checkbox"
			checked={row.isActive}
			disabled={true}
		/>
	);
};

export default LifeCyclePolicyIsActiveCell;
