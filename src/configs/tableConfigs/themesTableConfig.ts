import { TableConfig } from "./aclsTableConfig";

/**
 * Config that contains the columns and further information regarding themes. These are the information that never or hardly changes.
 * That's why it is hard coded here and not fetched from server.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: themes)
 * - category type (here: configuration)
 * - is multi select possible?
 */
export const themesTableConfig: TableConfig = {
	columns: [
		{
			name: "name",
			label: "CONFIGURATION.THEMES.TABLE.NAME",
			sortable: true,
		},
		{
			name: "description",
			label: "CONFIGURATION.THEMES.TABLE.DESCRIPTION",
			sortable: true,
		},
		{
			name: "creator",
			label: "CONFIGURATION.THEMES.TABLE.CREATOR",
			sortable: true,
		},
		{
			template: "ThemesDateTimeCell",
			name: "creation_date",
			label: "CONFIGURATION.THEMES.TABLE.CREATED",
			sortable: true,
		},
		{
			template: "ThemesActionsCell",
			name: "actions",
			label: "CONFIGURATION.THEMES.TABLE.ACTION",
		},
	],
	caption: "CONFIGURATION.THEMES.TABLE.CAPTION",
	resource: "themes",
	category: "configuration",
	multiSelect: false,
};
