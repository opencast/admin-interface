import { ParseKeys } from "i18next";

/**
 * Utility file for the navigation bar
 */
export const usersLinks: {
	path: string
	accessRole: string
	text: ParseKeys
}[] = [
	{
		path: "/users/users",
		accessRole: "ROLE_UI_USERS_VIEW",
		text: "USERS.NAVIGATION.USERS",
	},
	{
		path: "/users/groups",
		accessRole: "ROLE_UI_GROUPS_VIEW",
		text: "USERS.NAVIGATION.GROUPS",
	},
	{
		path: "/users/acls",
		accessRole: "ROLE_UI_ACLS_VIEW",
		text: "USERS.NAVIGATION.PERMISSIONS",
	},
];
