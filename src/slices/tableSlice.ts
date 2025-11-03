import { EntityState, PayloadAction, SerializedError, createEntityAdapter, createSlice, nanoid } from "@reduxjs/toolkit";
import { aclsTableConfig, TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { Server } from "./serverSlice";
import { Recording } from "./recordingSlice";
import { Job } from "./jobSlice";
import { Service } from "./serviceSlice";
import { User } from "./userSlice";
import { Group } from "./groupSlice";
import { AclResult } from "./aclSlice";
import { ThemeDetailsType } from "./themeSlice";
import { Series } from "./seriesSlice";
import { Event } from "./eventSlice";
import { eventsTableConfig } from "../configs/tableConfigs/eventsTableConfig";
import { seriesTableConfig } from "../configs/tableConfigs/seriesTableConfig";
import { recordingsTableConfig } from "../configs/tableConfigs/recordingsTableConfig";
import { jobsTableConfig } from "../configs/tableConfigs/jobsTableConfig";
import { serversTableConfig } from "../configs/tableConfigs/serversTableConfig";
import { servicesTableConfig } from "../configs/tableConfigs/servicesTableConfig";
import { usersTableConfig } from "../configs/tableConfigs/usersTableConfig";
import { groupsTableConfig } from "../configs/tableConfigs/groupsTableConfig";
import { themesTableConfig } from "../configs/tableConfigs/themesTableConfig";
import { RootState } from "../store";

/*
Overview of the structure of the data in arrays in state
const pages = [{
	active: false,
	label: "",
	number: 1
}, ...]

const rows = [{
		id: 1,
		data: [{for each column a value}]
}, ...]

const columns = [{
		style: "",
		deactivated: true,
		name: "",
		sortable: false,
		label: "",
		translate: false,
		template: ""
}, ...]
 */

/**
 * This file contains methods/thunks used to manage the table in the main view and its state changes
 */

export type Page = {
	active: boolean,
	label: string,
	number: number,
};

export type Pagination = {
	limit: number,
	offset: number,
	totalItems: number,
	directAccessibleNo: number,
}

export function isRowSelectable(row: Row) {
	if ("id" in row === true) {
		return true;
	}
	return false;
}

export function isEvent(row: Event | Series | Recording | Server | Job | Service | User | Group | AclResult | ThemeDetailsType): row is Event {
	return (row as Event).event_status !== undefined;
}

export function isSeries(row: Row | Event | Series | Recording | Server | Job | Service | User | Group | AclResult | ThemeDetailsType): row is Series {
	return (row as Series).organizers !== undefined;
}

// TODO: Improve row typing. While this somewhat correctly reflects the current state of our code, it is rather annoying to work with.
export type Row = {
	id: string, // For use with entityAdapter. Directly taken from event/series etc. if available
	selected: boolean // If the row was marked in the ui by the user
} & (Event | Series | Recording | Server | Job | Service | User | Group | AclResult | ThemeDetailsType)

export type SubmitRow = {
	selected: boolean
} & (Event | Series | Recording | Server | Job | Service | User | Group | AclResult | ThemeDetailsType)

export type Resource = "events" | "series" | "recordings" | "jobs" | "servers" | "services" | "users" | "groups" | "acls" | "themes"

export type ReverseOptions = "ASC" | "DESC"

export type TableState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	multiSelect: { [key in Resource]: boolean },
	resource: Resource,
	pages: Page[],
	columns: TableConfig["columns"],
	sortBy: { [key in Resource]: string },  // Key is resource, value is actual sorting parameter
	predicate: string,
	reverse: { [key in Resource]: ReverseOptions },  // Key is resource, value is actual sorting parameter
	rows: EntityState<Row, string>,
	maxLabel: string,
	pagination: Pagination,
}

const rowsAdapter = createEntityAdapter<Row>();

// Since not all rows are guaranteed to have an id: string, this computes one
function getRowKey(row: SubmitRow): string {
	if ("id" in row && row.id != null) {
		return `${row.id}`; // works for Event, Series, Recording, etc.
	}
	if ("cores" in row) { // Server
		return `${row.hostname}`;
	}
	if ("completed" in row) { // Service
		return `${row.name}`;
	}
	if ("username" in row) { // User
		return `${row.username}`;
	}

	// Fallback
	return nanoid();
}

// initial redux state
const initialState: TableState = {
	status: "uninitialized",
	error: null,
	multiSelect: {
		events: eventsTableConfig.multiSelect,
		series: seriesTableConfig.multiSelect,
		recordings: recordingsTableConfig.multiSelect,
		jobs: jobsTableConfig.multiSelect,
		servers: serversTableConfig.multiSelect,
		services: servicesTableConfig.multiSelect,
		users: usersTableConfig.multiSelect,
		groups: groupsTableConfig.multiSelect,
		acls: aclsTableConfig.multiSelect,
		themes: themesTableConfig.multiSelect,
	},
	resource: "events",
	pages: [],
	columns: [],
	sortBy: {
		events: "date",
		series: "createdDateTime",
		recordings: "status",
		jobs: "id",
		servers: "online",
		services: "status",
		users: "name",
		groups: "name",
		acls: "name",
		themes: "name",
	},
	predicate: "",
	reverse: {
		events: "DESC",
		series: "DESC",
		recordings: "ASC",
		jobs: "ASC",
		servers: "ASC",
		services: "ASC",
		users: "ASC",
		groups: "ASC",
		acls: "ASC",
		themes: "ASC",
	},
	rows: rowsAdapter.getInitialState(),
	maxLabel: "",
	pagination: {
		limit: 10,
		offset: 0,
		totalItems: 0,
		directAccessibleNo: 3,
	},
};

const tableSlice = createSlice({
	name: "table",
	initialState,
	reducers: {
		loadResourceIntoTable(state, action: PayloadAction<{
			multiSelect: TableState["multiSelect"][Resource],
			columns: TableConfig["columns"],
			resource: TableState["resource"],
			pages: TableState["pages"],
			rows: SubmitRow[],
			sortBy: TableState["sortBy"][Resource],
			reverse: TableState["reverse"][Resource],
			totalItems: TableState["pagination"]["totalItems"],
		}>) {
			state.multiSelect[action.payload.resource] = action.payload.multiSelect;
			state.columns = action.payload.columns;
			state.resource = action.payload.resource;
			state.pages = action.payload.pages;
			state.sortBy[action.payload.resource] = action.payload.sortBy;
			state.reverse[action.payload.resource] = action.payload.reverse;
			state.pagination = {
				...state.pagination,
				totalItems: action.payload.totalItems,
			};

			// Entity Adapter preparations
			const rows: Row[] = [];

			action.payload.rows.forEach(row => {
				const rowId = getRowKey(row);                // new stable id

				// @ts-expect-error: Id will not be number
				rows.push({
					...row,
					id: rowId,
				});
			});

			// Replace state with the fetched entities
			rowsAdapter.setAll(state.rows, rows);

		},
		loadColumns(state, action: PayloadAction<
			TableState["columns"]
		>) {
			state.columns = action.payload;
		},
		selectRow(state, action: PayloadAction<
			string
		>) {
			const id = action.payload;
			const row = state.rows.entities[id];
			if (row) {
				rowsAdapter.updateOne(state.rows, {
					id,
					changes: { selected: !row.selected },
				});
			}
		},
		selectAll(state) {
			rowsAdapter.updateMany(
				state.rows,
				state.rows.ids.map(id => ({ id, changes: { selected: true } })),
			);
		},
		deselectAll(state) {
			rowsAdapter.updateMany(
				state.rows,
				state.rows.ids.map(id => ({ id, changes: { selected: false } })),
			);
		},
		reverseTable(state, action: PayloadAction<
			TableState["reverse"][Resource]
		>) {
			state.reverse[state.resource] = action.payload;
		},
		setSortBy(state, action: PayloadAction<
			TableState["sortBy"][Resource]
		>) {
			state.sortBy[state.resource] = action.payload;
		},
		createPage(state, action: PayloadAction<
			Page
		>) {
			state.pages = state.pages.concat(action.payload);
		},
		updatePageSize(state, action: PayloadAction<
			TableState["pagination"]["limit"]
		>) {
			state.pagination = {
				...state.pagination,
				limit: action.payload,
			};
		},
		setPages(state, action: PayloadAction<
			TableState["pages"]
		>) {
			state.pages = action.payload;
		},
		setTotalItems(state, action: PayloadAction<
			TableState["pagination"]["totalItems"]
		>) {
			state.pagination = {
				...state.pagination,
				totalItems: action.payload,
			};
		},
		setOffset(state, action: PayloadAction<
			TableState["pagination"]["offset"]
		>) {
			state.pagination = {
				...state.pagination,
				offset: action.payload,
			};
		},
		setDirectAccessiblePages(state, action: PayloadAction<
			TableState["pagination"]["directAccessibleNo"]
		>) {
			state.pagination = {
				...state.pagination,
				directAccessibleNo: action.payload,
			};
		},
		setPageActive(state, action: PayloadAction<
			number
		>) {
			const pageNumber = action.payload;
			state.pages = state.pages.map(page => {
				if (page.number === pageNumber) {
					return {
						...page,
						active: true,
					};
				} else {
					return {
						...page,
						active: false,
					};
				}
			});
		},
		resetTableProperties: state => {
			state.columns = initialState.columns;
			state.pages = initialState.pages;
			state.rows = initialState.rows;
			state.pagination.offset = initialState.pagination.offset;
		},
	},
});

export const {
	selectIds: selectRowIds,
	selectById: selectRowById,
} = rowsAdapter.getSelectors<RootState>(s => s.table.rows);

export const rowsSelectors = rowsAdapter.getSelectors<RootState>(
	s => s.table.rows,
);

export const {
	loadResourceIntoTable,
	loadColumns,
	selectRow,
	selectAll,
	deselectAll,
	reverseTable,
	setSortBy,
	createPage,
	updatePageSize,
	setPages,
	setTotalItems,
	setOffset,
	setDirectAccessiblePages,
	setPageActive,
	resetTableProperties,
} = tableSlice.actions;

// Export the slice reducer as the default export
export default tableSlice.reducer;
