import { useAppDispatch } from "../../../store";
import { deleteLifeCyclePolicy, LifeCyclePolicy } from "../../../slices/lifeCycleSlice";
import { fetchLifeCyclePolicyDetails, openModal } from "../../../slices/lifeCycleDetailsSlice";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";
import { LuFileText } from "react-icons/lu";
import { ActionCellDelete } from "../../shared/ActionCellDelete";

/**
 * This component renders the title cells of series in the table view
 */
const LifeCyclePolicyActionCell = ({
	row,
}: {
	row: LifeCyclePolicy
}) => {
	const dispatch = useAppDispatch();

	const showLifeCyclePolicyDetails = async () => {
		await dispatch(fetchLifeCyclePolicyDetails(row.id));

		dispatch(openModal(row));
	};

	const deletingPolicy = (id: string) => {
		dispatch(deleteLifeCyclePolicy(id));
	};

	return (
		<>
			{/* view details location/recording */}
			<ButtonLikeAnchor
				onClick={() => { showLifeCyclePolicyDetails(); }}
				className={"action-cell-button"}
				editAccessRole={"ROLE_UI_LIFECYCLEPOLICY_DETAILS_VIEW"}
				// tooltipText={"LIFECYCLE.POLICIES.TABLE.TOOLTIP.DETAILS"} // Disabled due to performance concerns
			>
				<LuFileText />
			</ButtonLikeAnchor>


			{/* delete policy */}
			<ActionCellDelete
				editAccessRole={"ROLE_UI_LIFECYCLEPOLICY_DELETE"}
				// tooltipText={"LIFECYCLE.POLICIES.TABLE.TOOLTIP.DELETE"} // Disabled due to performance concerns
				resourceId={row.id}
				resourceName={row.title}
				resourceType={"LIFECYCLE_POLICY"}
				deleteMethod={deletingPolicy}
			/>
		</>
	);
};

export default LifeCyclePolicyActionCell;
