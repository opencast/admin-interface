import { useRef } from "react";
import { Group, deleteGroup } from "../../../slices/groupSlice";
import { fetchGroupDetails } from "../../../slices/groupDetailsSlice";
import { ActionCellDelete } from "../../shared/ActionCellDelete";
import { useAppDispatch } from "../../../store";
import { ModalHandle } from "../../shared/modals/Modal";
import GroupDetailsModal from "./modal/GroupDetailsModal";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";
import { LuFileText } from "react-icons/lu";

/**
 * This component renders the action cells of groups in the table view
 */
const GroupsActionsCell = ({
	row,
}: {
	row: Group
}) => {
	const dispatch = useAppDispatch();

	const detailsModalRef = useRef<ModalHandle>(null);

	const deletingGroup = (id: string) => {
		dispatch(deleteGroup(id));
	};

	const hideGroupDetails = () => {
		detailsModalRef.current?.close?.();
	};

	const showGroupDetails = async () => {
		await dispatch(fetchGroupDetails(row.id));

		detailsModalRef.current?.open();
	};

	return (
		<>
			{/* edit/show group */}
			<ButtonLikeAnchor
				onClick={() => showGroupDetails()}
				className={"action-cell-button"}
				editAccessRole={"ROLE_UI_GROUPS_EDIT"}
				tooltipText={"USERS.GROUPS.TABLE.TOOLTIP.DETAILS"}
			>
				<LuFileText />
			</ButtonLikeAnchor>

			{/* modal displaying details about group */}
			<GroupDetailsModal
				close={hideGroupDetails}
				groupName={row.name}
				modalRef={detailsModalRef}
			/>

			{/* delete group */}
			<ActionCellDelete
				editAccessRole={"ROLE_UI_GROUPS_DELETE"}
				tooltipText={"USERS.GROUPS.TABLE.TOOLTIP.DELETE"}
				resourceId={row.id}
				resourceName={row.name}
				resourceType={"GROUP"}
				deleteMethod={deletingGroup}
			/>
		</>
	);
};

export default GroupsActionsCell;
