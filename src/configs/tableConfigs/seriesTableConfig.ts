import { TableConfig } from "./aclsTableConfig";

/**
 * Config that contains the columns and further information regarding series. These are the information that never or hardly changes.
 * That's why it is hard coded here and not fetched from server.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: series)
 * - category type (here: events)
 * - is multi select possible?
 */
export const seriesTableConfig: TableConfig = {
	columns: [
		{
			template: "SeriesTitleCell",
			name: "title",
			label: "EVENTS.SERIES.TABLE.TITLE",
			sortable: true,
		},
		{
			template: "SeriesOrganizersCell",
			name: "organizers",
			label: "EVENTS.SERIES.TABLE.ORGANIZERS",
			sortable: true,
		},
		{
			template: "SeriesContributorsCell",
			name: "contributors",
			label: "EVENTS.SERIES.TABLE.CONTRIBUTORS",
			sortable: true,
		},
		{
			template: "SeriesDateTimeCell",
			name: "createdDateTime",
			label: "EVENTS.SERIES.TABLE.CREATED",
			sortable: true,
		},
		{
			template: "SeriesActionsCell",
			name: "actions",
			label: "EVENTS.SERIES.TABLE.ACTION",
		},
	],
	caption: "EVENTS.SERIES.TABLE.CAPTION",
	resource: "series",
	category: "events",
	multiSelect: true,
};
