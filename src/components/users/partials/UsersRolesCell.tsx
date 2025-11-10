import { useTranslation } from "react-i18next";
import { fetchUsers, User } from "../../../slices/userSlice";
import MultiValueCell from "../../shared/MultiValueCell";
import { loadUsersIntoTable } from "../../../thunks/tableThunks";

/**
 * This component renders the roles cells of users in the table view
 */
const UsersRolesCell = ({
	row,
}: {
	row: User
}) => {
	const { t } = useTranslation();

	const getRoleString = () => {
		const displayRoles = [];
		const squashedRoles = [];
		let roleCountUI = 0;
		let roleCountAPI = 0;
		let roleCountCaptureAgent = 0;

		for (const role of row.roles) {
			if (role.name.startsWith("ROLE_UI")) {
				roleCountUI++;
			} else if (role.name.startsWith("ROLE_API")) {
				roleCountAPI++;
			} else if (role.name.startsWith("ROLE_CAPTURE_AGENT")) {
				roleCountCaptureAgent++;
			} else {
				displayRoles.push(role.name);
			}
		}

		if (roleCountUI > 0) {
      const desc = t("USERS.USERS.TABLE.COLLAPSED.UI");
			squashedRoles.push(`${roleCountUI} ${desc}`);
		}
		if (roleCountAPI > 0) {
      const desc = t("USERS.USERS.TABLE.COLLAPSED.API");
			squashedRoles.push(`${roleCountAPI} ${desc}`);
		}
		if (roleCountCaptureAgent > 0) {
      const desc = t("USERS.USERS.TABLE.COLLAPSED.CAPTURE_AGENT");
			squashedRoles.push(`${roleCountCaptureAgent} ${desc}`);
		}

		return { displayRoles, squashedRoles };
	};

	const { displayRoles, squashedRoles } = getRoleString();

	return (
		<>
			<MultiValueCell
				resource="users"
				values={displayRoles}
				filterName="Role"
				fetchResource={fetchUsers}
				loadResourceIntoTable={loadUsersIntoTable}
				tooltipText="USERS.USERS.TABLE.TOOLTIP.ROLES"
			/>
			{ displayRoles.length > 0 && squashedRoles.length > 0 && <span>, </span> }
			<span>{squashedRoles.join(", ")}</span>
		</>
	);
};

export default UsersRolesCell;
