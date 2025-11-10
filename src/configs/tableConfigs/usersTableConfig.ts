import { TableConfig } from "./aclsTableConfig";

/**
 * Config that contains the columns and further information regarding users. These are the information that never or hardly changes.
 * That's why it is hard coded here and not fetched from server.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: users)
 * - category type (here: users)
 * - is multi select possible?
 */
export const usersTableConfig: TableConfig = {
	columns: [
		{
			name: "name",
			label: "USERS.USERS.TABLE.NAME",
			sortable: true,
		},
		{
			name: "username",
			label: "USERS.USERS.TABLE.USERNAME",
			sortable: true,
		},
		{
			name: "email",
			label: "USERS.USERS.TABLE.EMAIL",
			sortable: true,
		},
		{
			template: "UsersRolesCell",
			name: "roles",
			label: "USERS.USERS.TABLE.ROLES",
			sortable: false,
		},
		{
			name: "provider",
			label: "USERS.USERS.TABLE.PROVIDER",
			sortable: true,
		},
		{
			template: "UsersActionsCell",
			name: "actions",
			label: "USERS.USERS.TABLE.ACTION",
		},
	],
	caption: "USERS.USERS.TABLE.CAPTION",
	resource: "users",
	category: "users",
	multiSelect: false,
};

