import { TableConfig } from "./aclsTableConfig";

/**
 * Config that contains the columns and further information regarding services. These are the information that never or hardly changes.
 * That's why it is hard coded here and not fetched from server.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: services)
 * - category type (here: systems)
 * - is multi select possible?
 */
export const servicesTableConfig: TableConfig = {
	columns: [
		{
			template: "ServersStatusCell",
			name: "online",
			label: "SYSTEMS.SERVICES.TABLE.ONLINE",
		},
		{
			name: "status",
			label: "SYSTEMS.SERVICES.TABLE.STATUS",
			translate: true,
			sortable: true,
		},
		{
			name: "name",
			label: "SYSTEMS.SERVICES.TABLE.NAME",
			sortable: true,
		},
		{
			name: "hostname",
			label: "SYSTEMS.SERVICES.TABLE.HOST_NAME",
			sortable: true,
		},
		{
			name: "nodeName",
			label: "SYSTEMS.SERVICES.TABLE.NODE_NAME",
			sortable: true,
		},
		{
			name: "completed",
			label: "SYSTEMS.SERVICES.TABLE.COMPLETED",
			sortable: true,
		},
		{
			name: "running",
			label: "SYSTEMS.SERVICES.TABLE.RUNNING",
			sortable: true,
		},
		{
			name: "queued",
			label: "SYSTEMS.SERVICES.TABLE.QUEUED",
			sortable: true,
		},
		{
			template: "MeanRunTimeCell",
			name: "meanRunTime",
			label: "SYSTEMS.SERVICES.TABLE.MEAN_RUN_TIME",
			sortable: true,
		},
		{
			template: "MeanQueueTimeCell",
			name: "meanQueueTime",
			label: "SYSTEMS.SERVICES.TABLE.MEAN_QUEUE_TIME",
			sortable: true,
		},
		{
			template: "ServicesActionsCell",
			name: "actions",
			label: "SYSTEMS.SERVICES.TABLE.ACTION",
		},
	],
	caption: "SYSTEMS.SERVICES.TABLE.CAPTION",
	resource: "services",
	category: "systems",
	multiSelect: false,
};
