import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { User, deleteUser } from "../../../slices/userSlice";
import { useAppDispatch } from "../../../store";
import { fetchUserDetails } from "../../../slices/userDetailsSlice";
import { Modal, ModalHandle } from "../../shared/modals/Modal";
import UserDetails from "./modal/UserDetails";
import { ActionCellDelete } from "../../shared/ActionCellDelete";
import { IconButton } from "../../shared/IconButton";

/**
 * This component renders the action cells of users in the table view
 */
const UsersActionCell = ({
	row,
}: {
	row: User
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const modalRef = useRef<ModalHandle>(null);

	const deletingUser = (id: string) => {
		dispatch(deleteUser(id));
	};

	const showUserDetails = async () => {
		await dispatch(fetchUserDetails(row.username));

		modalRef.current?.open();
	};

	const hideUserDetails = () => {
		modalRef.current?.close?.();
	};

	return (
		<>
			{/* edit/show user details */}
			<IconButton
				callback={() => showUserDetails()}
				iconClassname={"more"}
				editAccessRole={"ROLE_UI_USERS_EDIT"}
				tooltipText={"USERS.USERS.TABLE.TOOLTIP.DETAILS"}
			/>

			{/* user details modal */}
			<Modal
				header={t("USERS.USERS.DETAILS.EDITCAPTION", { name: row.username })}
				classId="user-details-modal"
				ref={modalRef}
			>
				{/* component that manages tabs of user details modal*/}
				<UserDetails close={hideUserDetails} />
			</Modal>

			{(row.manageable || (row.provider !== "opencast" && row.provider !== "system")) &&
				<ActionCellDelete
					editAccessRole={"ROLE_UI_USERS_DELETE"}
					tooltipText={"USERS.USERS.TABLE.TOOLTIP.DELETE"}
					resourceId={row.username}
					resourceName={row.name}
					resourceType={"USER"}
					deleteMethod={deletingUser}
				/>
			}
		</>
	);
};

export default UsersActionCell;
