import { useRef } from "react";
import { AclResult, deleteAcl } from "../../../slices/aclSlice";
import { useAppDispatch } from "../../../store";
import { fetchAclDetails } from "../../../slices/aclDetailsSlice";
import { Modal, ModalHandle } from "../../shared/modals/Modal";
import AclDetails from "./modal/AclDetails";
import { ActionCellDelete } from "../../shared/ActionCellDelete";
import { IconButton } from "../../shared/IconButton";
import { useTranslation } from "react-i18next";

/**
 * This component renders the action cells of acls in the table view
 */
const AclsActionsCell = ({
	row,
}: {
	row: AclResult
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const modalRef = useRef<ModalHandle>(null);

	const hideAclDetails = () => {
		modalRef.current?.close?.();
	};

	const showAclDetails = async () => {
		await dispatch(fetchAclDetails(row.id));

		modalRef.current?.open();
	};

	const deletingAcl = (id: number) => {
		dispatch(deleteAcl(id));
	};

	return (
		<>
			{/* edit/show ACL details */}
			<IconButton
				callback={showAclDetails}
				iconClassname={"more"}
				editAccessRole={"ROLE_UI_ACLS_EDIT"}
				tooltipText={"USERS.ACLS.TABLE.TOOLTIP.DETAILS"}
			/>

			{/* ACL details modal */}
			<Modal
				header={t("USERS.ACLS.DETAILS.HEADER", { name: row.name })}
				classId="acl-details-modal"
				ref={modalRef}
			>
				{/* component that manages tabs of acl details modal*/}
				<AclDetails close={hideAclDetails} />
			</Modal>

			{/* delete ACL */}
			<ActionCellDelete
				editAccessRole={"ROLE_UI_ACLS_DELETE"}
				tooltipText={"USERS.ACLS.TABLE.TOOLTIP.DELETE"}
				resourceId={row.id}
				resourceName={row.name}
				resourceType={"ACL"}
				deleteMethod={deletingAcl}
			/>
		</>
	);
};

export default AclsActionsCell;
