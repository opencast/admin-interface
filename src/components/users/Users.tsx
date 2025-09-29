import { usersTemplateMap } from "../../configs/tableConfigs/usersTableMap";
import { getTotalUsers } from "../../selectors/userSelectors";
import {
	loadUsersIntoTable,
} from "../../thunks/tableThunks";
import { fetchUsers } from "../../slices/userSlice";
import { usersLinks } from "./partials/UsersNavigation";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of users
 */
const Users = () => {
	return (
		<TablePage
			resource={"users"}
			fetchResource={fetchUsers}
			loadResourceIntoTable={loadUsersIntoTable}
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
