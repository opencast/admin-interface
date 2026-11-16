import { usersTemplateMap } from "../../configs/tableConfigs/usersTableMap";
import { getTotalUsers } from "../../selectors/userSelectors";
import { User } from "../../slices/userSlice";
import { usersLinks } from "./partials/UsersNavigation";
import TablePage from "../shared/TablePage";
import { Row } from "../../slices/tableSlice";

/**
 * This component renders the table view of users
 */
const Users = () => {
	return (
		<TablePage<Row & User>
			resource={"users"}
			getTotalResources={getTotalUsers}
			navBarLinks={usersLinks}
			navBarCreate={{
				accessRole: "ROLE_UI_USERS_CREATE",
				text: "USERS.ACTIONS.ADD_USER",
				resource: "user",
			}}
			caption={"USERS.USERS.TABLE.CAPTION"}
			templateMap={usersTemplateMap}
		/>
	);
};

export default Users;
