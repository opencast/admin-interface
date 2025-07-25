import { createSelector } from "reselect";
import { RootState } from "../store";
import { TableState } from "../slices/tableSlice";

/**
 * This file contains selectors regarding the table view
 */

export const getTableRows = (state: RootState) => state.table.rows;
export const getTableColumns = (state: RootState) => state.table.columns;
export const getTablePagination = (state: RootState) => state.table.pagination;
export const getTablePages = (state: RootState) => state.table.pages;
export const getTotalItems = (state: RootState) => state.table.pagination.totalItems;
export const getPageLimit = (state: RootState) => state.table.pagination.limit;
export const getPageOffset = (state: RootState) => state.table.pagination.offset;
export const getNumberDirectAccessiblePages = (state: RootState) => state.table.pagination.directAccessibleNo;
export const getResourceType = (state: RootState) => state.table.resource;
export const getTableSorting = (state: RootState) => state.table.sortBy[state.table.resource];
export const getTableSortingForResource = (state: RootState, resource: TableState["resource"]) => state.table.sortBy[resource];
export const getTableDirection = (state: RootState) => state.table.reverse[state.table.resource];
export const getTableDirectionForResource = (state: RootState, resource: TableState["resource"]) => state.table.reverse[resource];
export const getMultiSelect = (state: RootState) => state.table.multiSelect[state.table.resource];
export const getTable = (state: RootState) => state.table;
export const getDeactivatedColumns = (state: RootState) =>
	state.table.columns.filter(column => column.deactivated);
export const getActivatedColumns = (state: RootState) =>
	state.table.columns.filter(column => !column.deactivated);

export const getSelectedRows = createSelector(getTableRows, rows =>
	rows.filter(row => row.selected),
);
