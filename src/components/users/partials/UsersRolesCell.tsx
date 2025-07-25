import { useTranslation } from "react-i18next";
import { User } from "../../../slices/userSlice";

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
			displayRoles.push(`${roleCountUI} ${desc}`);
		}
		if (roleCountAPI > 0) {
      const desc = t("USERS.USERS.TABLE.COLLAPSED.API");
			displayRoles.push(`${roleCountAPI} ${desc}`);
		}
		if (roleCountCaptureAgent > 0) {
      const desc = t("USERS.USERS.TABLE.COLLAPSED.CAPTURE_AGENT");
			displayRoles.push(`${roleCountCaptureAgent} ${desc}`);
		}

		return displayRoles.join(", ");
	};

	return <span>{getRoleString()}</span>;
};

export default UsersRolesCell;
