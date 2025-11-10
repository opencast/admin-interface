import { ParseKeys } from "i18next";

/**
 * Utility file for the navigation bar
 */
export const systemsLinks: {
	path: string
	accessRole: string
	text: ParseKeys
}[] = [
	{
		path: "/systems/jobs",
		accessRole: "ROLE_UI_JOBS_VIEW",
		text: "SYSTEMS.NAVIGATION.JOBS",
	},
	{
		path: "/systems/servers",
		accessRole: "ROLE_UI_SERVERS_VIEW",
		text: "SYSTEMS.NAVIGATION.SERVERS",
	},
	{
		path: "/systems/services",
		accessRole: "ROLE_UI_SERVICES_VIEW",
		text: "SYSTEMS.NAVIGATION.SERVICES",
	},
];
