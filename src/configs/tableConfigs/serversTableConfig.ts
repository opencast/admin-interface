import { TableConfig } from "./aclsTableConfig";

/**
 * Config that contains the columns and further information regarding servers. These are the information that never or hardly changes.
 * That's why it is hard coded here and not fetched from server.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: servers)
 * - category type (here: systems)
 * - is multi select possible?
 */
export const serversTableConfig: TableConfig = {
	columns: [
		{
			template: "ServersStatusCell",
			name: "online",
			label: "SYSTEMS.SERVERS.TABLE.STATUS",
		},
		{
			name: "hostname",
			label: "SYSTEMS.SERVERS.TABLE.HOST_NAME",
			sortable: true,
		},
		{
			name: "nodeName",
			label: "SYSTEMS.SERVERS.TABLE.NODE_NAME",
			sortable: true,
		},
		{
			name: "cores",
			label: "SYSTEMS.SERVERS.TABLE.CORES",
			sortable: true,
		},
		{
			name: "running",
			label: "SYSTEMS.SERVERS.TABLE.RUNNING",
			sortable: true,
		},
		{
			name: "queued",
			label: "SYSTEMS.SERVERS.TABLE.QUEUED",
			sortable: true,
		},
		{
			template: "ServersMaintenanceCell",
			name: "maintenance",
			label: "SYSTEMS.SERVERS.TABLE.MAINTENANCE",
			sortable: true,
		},
	],
	caption: "SYSTEMS.SERVERS.TABLE.CAPTION",
	resource: "servers",
	category: "systems",
	multiSelect: false,
};
