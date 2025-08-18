import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import {
	deselectAll,
	loadResourceIntoTable,
	selectAll,
	selectRow,
	setOffset,
	setPageActive,
	setPages,
} from "../slices/tableSlice";
import {
	setEventColumns,
	setShowActions as showEventsActions,
	fetchEvents,
} from "../slices/eventSlice";
import {
	getPageOffset,
	getResourceType,
	getSelectedRows,
	getTablePages,
	getTablePagination,
} from "../selectors/tableSelectors";
import {
	fetchSeries,
	setSeriesColumns,
	showActionsSeries,
} from "../slices/seriesSlice";
import { fetchJobs, setJobColumns } from "../slices/jobSlice";
import { fetchServers, setServerColumns } from "../slices/serverSlice";
import { fetchServices, setServiceColumns } from "../slices/serviceSlice";
import { fetchUsers, setUserColumns } from "../slices/userSlice";
import { fetchGroups } from "../slices/groupSlice";
import { fetchThemes, setThemeColumns } from "../slices/themeSlice";
import { fetchRecordings, setRecordingsColumns } from "../slices/recordingSlice";
import { setGroupColumns } from "../slices/groupSlice";
import { fetchAcls, setAclColumns } from "../slices/aclSlice";
import { AppDispatch, AppThunk, RootState } from "../store";

/**
 * This file contains methods/thunks used to manage the table in the main view and its state changes
 * */

// Method to load events into the table
export const loadEventsIntoTable = (): AppThunk => (dispatch, getState) => {
	const { events, table } = getState();
	const total = events.total;

	const pagination = table.pagination;
	// check which events are currently selected
	const resource = events.results.map(result => {
		const current = table.rows.find(row => "id" in row && row.id === result.id);

		if (!!current && table.resource === "events") {
			return {
				...result,
				selected: current.selected,
			};
		} else {
			return {
				...result,
				selected: false,
			};
		}
	});

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "events" as const,
		rows: resource,
		columns: events.columns,
		multiSelect: table.multiSelect["events"],
		pages: pages,
		sortBy: table.sortBy["events"],
		reverse: table.reverse["events"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

// Method to load series into the table
export const loadSeriesIntoTable = (): AppThunk => (dispatch, getState) => {
	const { series, table } = getState();
	const total = series.total;
	const pagination = table.pagination;

	// check which events are currently selected
	const resource = series.results.map(result => {
		const current = table.rows.find(row => "id" in row && row.id === result.id);

		if (!!current && table.resource === "series") {
			return {
				...result,
				selected: current.selected,
			};
		} else {
			return {
				...result,
				selected: false,
			};
		}
	});

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "series" as const,
		rows: resource,
		columns: series.columns,
		multiSelect: table.multiSelect["series"],
		pages: pages,
		sortBy: table.sortBy["series"],
		reverse: table.reverse["series"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadRecordingsIntoTable = (): AppThunk => (dispatch, getState) => {
	const { recordings, table } = getState();
	const pagination = table.pagination;
	const resource = recordings.results;
	const total = recordings.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "recordings" as const,
		columns: recordings.columns,
		multiSelect: table.multiSelect["recordings"],
		pages: pages,
		sortBy: table.sortBy["recordings"],
		reverse: table.reverse["recordings"],
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadJobsIntoTable = (): AppThunk => (dispatch, getState) => {
	const { jobs, table } = getState();
	const pagination = table.pagination;
	const resource = jobs.results;
	const total = jobs.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "jobs" as const,
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		columns: jobs.columns,
		multiSelect: table.multiSelect["jobs"],
		pages: pages,
		sortBy: table.sortBy["jobs"],
		reverse: table.reverse["jobs"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadServersIntoTable = (): AppThunk => (dispatch, getState) => {
	const { servers, table } = getState();
	const pagination = table.pagination;
	const resource = servers.results;
	const total = servers.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "servers" as const,
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		columns: servers.columns,
		multiSelect: table.multiSelect["servers"],
		pages: pages,
		sortBy: table.sortBy["servers"],
		reverse: table.reverse["servers"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadServicesIntoTable = (): AppThunk => (dispatch, getState) => {
	const { services, table } = getState();
	const pagination = table.pagination;
	const resource = services.results;
	const total = services.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		pages: pages,
		totalItems: total,
		resource: "services" as const,
		columns: services.columns,
		multiSelect: table.multiSelect["services"],
		sortBy: table.sortBy["services"],
		reverse: table.reverse["services"],
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadUsersIntoTable = (): AppThunk => (dispatch, getState) => {
	const { users, table } = getState();
	const pagination = table.pagination;
	const resource = users.results;
	const total = users.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "users" as const,
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		columns: users.columns,
		multiSelect: table.multiSelect["users"],
		pages: pages,
		sortBy: table.sortBy["users"],
		reverse: table.reverse["users"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadGroupsIntoTable = (): AppThunk => (dispatch, getState) => {
	const { groups, table } = getState();
	const pagination = table.pagination;
	const resource = groups.results;
	const total = groups.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "groups" as const,
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		columns: groups.columns,
		multiSelect: table.multiSelect["groups"],
		pages: pages,
		sortBy: table.sortBy["groups"],
		reverse: table.reverse["groups"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadAclsIntoTable = (): AppThunk => (dispatch, getState) => {
	const { acls, table } = getState();
	const pagination = table.pagination;
	const resource = acls.results;
	const total = acls.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "acls" as const,
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		columns: acls.columns,
		multiSelect: table.multiSelect["acls"],
		pages: pages,
		sortBy: table.sortBy["acls"],
		reverse: table.reverse["acls"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

export const loadThemesIntoTable = (): AppThunk => (dispatch, getState) => {
	const { themes, table } = getState();
	const pagination = table.pagination;
	const resource = themes.results;
	const total = themes.total;

	const pages = calculatePages(total / pagination.limit, pagination.offset);

	const tableData = {
		resource: "themes" as const,
		rows: resource.map(obj => {
			return { ...obj, selected: false };
		}),
		columns: themes.columns,
		multiSelect: table.multiSelect["themes"],
		pages: pages,
		sortBy: table.sortBy["themes"],
		reverse: table.reverse["themes"],
		totalItems: total,
	};

	dispatch(loadResourceIntoTable(tableData));
};

// Navigate between pages
export const goToPage = (pageNumber: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
	dispatch(deselectAll());
	dispatch(setOffset(pageNumber));

	const state = getState();
	const offset = getPageOffset(state);
	const pages = getTablePages(state);

	if (pages) {
		dispatch(setPageActive(offset ? pages[offset].number : pageNumber));
	}

	// Get resources of page and load them into table
	switch (getResourceType(state)) {
		case "events": {
			await dispatch(fetchEvents());
			dispatch(loadEventsIntoTable());
			break;
		}
		case "series": {
			await dispatch(fetchSeries());
			dispatch(loadSeriesIntoTable());
			break;
		}
		case "recordings": {
			await dispatch(fetchRecordings());
			dispatch(loadRecordingsIntoTable());
			break;
		}
		case "jobs": {
			await dispatch(fetchJobs());
			dispatch(loadJobsIntoTable());
			break;
		}
		case "servers": {
			await dispatch(fetchServers());
			dispatch(loadServersIntoTable());
			break;
		}
		case "services": {
			await dispatch(fetchServices());
			dispatch(loadServicesIntoTable());
			break;
		}
		case "users": {
			await dispatch(fetchUsers());
			dispatch(loadUsersIntoTable());
			break;
		}
		case "groups": {
			await dispatch(fetchGroups());
			dispatch(loadGroupsIntoTable());
			break;
		}
		case "acls": {
			await dispatch(fetchAcls());
			dispatch(loadAclsIntoTable());
			break;
		}
		case "themes": {
			await dispatch(fetchThemes());
			dispatch(loadThemesIntoTable());
			break;
		}
	}
};

// Update pages for example if page size was changed
export const updatePages = () => async (dispatch: AppDispatch, getState: () => RootState) => {
	const state = getState();

	const pagination = getTablePagination(state);

	const pages = calculatePages(
		pagination.totalItems / pagination.limit,
		pagination.offset,
	);

	dispatch(setPages(pages));

	// Get resources of page and load them into table
	switch (getResourceType(state)) {
		case "events": {
			await dispatch(fetchEvents());
			dispatch(loadEventsIntoTable());
			break;
		}
		case "series": {
			await dispatch(fetchSeries());
			dispatch(loadSeriesIntoTable());
			break;
		}
		case "recordings": {
			await dispatch(fetchRecordings());
			dispatch(loadRecordingsIntoTable());
			break;
		}
		case "jobs": {
			await dispatch(fetchJobs());
			dispatch(loadJobsIntoTable());
			break;
		}
		case "servers": {
			await dispatch(fetchServers());
			dispatch(loadServersIntoTable());
			break;
		}
		case "services": {
			await dispatch(fetchServices());
			dispatch(loadServicesIntoTable());
			break;
		}
		case "users": {
			await dispatch(fetchUsers());
			dispatch(loadUsersIntoTable());
			break;
		}
		case "groups": {
			await dispatch(fetchGroups());
			dispatch(loadGroupsIntoTable());
			break;
		}
		case "acls": {
			await dispatch(fetchAcls());
			dispatch(loadAclsIntoTable());
			break;
		}
		case "themes": {
			await dispatch(fetchThemes());
			dispatch(loadThemesIntoTable());
			break;
		}
	}
};

// Select all rows on table page
export const changeAllSelected = (selected: boolean): AppThunk => (dispatch, getState) => {
	const state = getState();

	if (selected) {
		switch (getResourceType(state)) {
			case "events": {
				dispatch(showEventsActions(true));
				break;
			}
			case "series": {
				dispatch(showActionsSeries(true));
				break;
			}
		}
		dispatch(selectAll());
	} else {
		switch (getResourceType(state)) {
			case "events": {
				dispatch(showEventsActions(false));
				break;
			}
			case "series": {
				dispatch(showActionsSeries(false));
				break;
			}
		}
		dispatch(deselectAll());
	}
};

// Select certain columns
export const changeColumnSelection = (updatedColumns: TableConfig["columns"]) => async (
	dispatch: AppDispatch, getState: () => RootState,
) => {
	const state = getState();

	switch (getResourceType(state)) {
		case "events": {
			dispatch(setEventColumns(updatedColumns));

			if (getSelectedRows(state).length > 0) {
				dispatch(showEventsActions(true));
			} else {
				dispatch(showEventsActions(false));
			}

			dispatch(loadEventsIntoTable());

			await dispatch(fetchEvents());
			dispatch(loadEventsIntoTable());

			break;
		}
		case "series": {
			dispatch(setSeriesColumns(updatedColumns));

			if (getSelectedRows(state).length > 0) {
				dispatch(showActionsSeries(true));
			} else {
				dispatch(showActionsSeries(false));
			}

			dispatch(loadSeriesIntoTable());
			break;
		}
		case "recordings": {
			dispatch(setRecordingsColumns(updatedColumns));
			dispatch(loadRecordingsIntoTable());
			break;
		}
		case "jobs": {
			dispatch(setJobColumns(updatedColumns));
			dispatch(loadJobsIntoTable());
			break;
		}
		case "servers": {
			dispatch(setServerColumns(updatedColumns));
			dispatch(loadServersIntoTable());
			break;
		}
		case "services": {
			dispatch(setServiceColumns(updatedColumns));
			dispatch(loadServicesIntoTable());
			break;
		}
		case "users": {
			dispatch(setUserColumns(updatedColumns));
			dispatch(loadUsersIntoTable());
			break;
		}
		case "groups": {
			dispatch(setGroupColumns(updatedColumns));
			dispatch(loadGroupsIntoTable());
			break;
		}
		case "acls": {
			dispatch(setAclColumns(updatedColumns));
			dispatch(loadAclsIntoTable());
			break;
		}
		case "themes": {
			dispatch(setThemeColumns(updatedColumns));
			dispatch(loadThemesIntoTable());
			break;
		}
	}
};

// Select certain row
export const changeRowSelection = (id: number | string): AppThunk => (dispatch, getState) => {
	dispatch(selectRow(id));

	const state = getState();

	switch (getResourceType(state)) {
		case "events": {
			if (getSelectedRows(state).length > 0) {
				dispatch(showEventsActions(true));
			} else {
				dispatch(showEventsActions(false));
			}
			break;
		}
		case "series": {
			if (getSelectedRows(state).length > 0) {
				dispatch(showActionsSeries(true));
			} else {
				dispatch(showActionsSeries(false));
			}
			break;
		}
	}
};

const calculatePages = (numberOfPages: number, offset: number) => {
	const pages = [];

	for (let i = 0; i < numberOfPages || (i === 0 && numberOfPages === 0); i++) {
		pages.push({
			number: i,
			label: (i + 1).toString(),
			active: i === offset,
		});
	}

  if (pages.every(page => page.active === false)) {
    pages[0].active = true;
  }

	return pages;
};
