import { aclsTemplateMap } from "../../configs/tableConfigs/aclsTableMap";
import {
	loadAclsIntoTable,
} from "../../thunks/tableThunks";
import { getTotalAcls } from "../../selectors/aclSelectors";
import { fetchAcls } from "../../slices/aclSlice";
import { usersLinks } from "./partials/UsersNavigation";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of acls
 */
const Acls = () => {
	return (
		<TablePage
			resource={"acls"}
			fetchResource={fetchAcls}
			loadResourceIntoTable={loadAclsIntoTable}
			getTotalResources={getTotalAcls}
			navBarLinks={usersLinks}
			navBarCreate={{
				accessRole: "ROLE_UI_ACLS_CREATE",
				text: "USERS.ACTIONS.ADD_ACL",
				resource: "acl",
			}}
			caption={"USERS.ACLS.TABLE.CAPTION"}
			templateMap={aclsTemplateMap}
		/>
	);
};

export default Acls;
