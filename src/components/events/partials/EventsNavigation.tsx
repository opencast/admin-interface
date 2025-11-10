import { ParseKeys } from "i18next";

/**
 * Utility file for the navigation bar
 */
export const eventsLinks: {
	path: string,
	accessRole: string,
	text: ParseKeys
}[] = [
	{
		path: "/events/events",
		accessRole: "ROLE_UI_EVENTS_VIEW",
		text: "EVENTS.EVENTS.NAVIGATION.EVENTS",
	},
	{
		path: "/events/series",
		accessRole: "ROLE_UI_SERIES_VIEW",
		text: "EVENTS.EVENTS.NAVIGATION.SERIES",
	},
];
