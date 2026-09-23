import { TableConfig } from "./aclsTableConfig";

export const lifeCyclePolicyTableConfig: TableConfig = {
	columns: [
		{
			name: "title",
			label: "LIFECYCLE.POLICIES.TABLE.TITLE",
			sortable: true,
		},
		{
			template: "LifeCyclePolicyIsActiveCell",
			name: "isActive",
			label: "LIFECYCLE.POLICIES.TABLE.ISACTIVE",
		},
		{
			name: "timing",
			label: "LIFECYCLE.POLICIES.TABLE.TIMING",
			sortable: true,
		},
		{
			template: "LifeCyclePolicyActionCell",
			name: "actions",
			label: "LIFECYCLE.POLICIES.TABLE.ACTION",
		},
	],
	caption: "TABLE.CAPTION",
	resource: "lifeCyclePolicies",
	category: "events",
	multiSelect: false,
};
