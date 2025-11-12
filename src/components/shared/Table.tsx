import React, { JSX, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	getMultiSelect,
	getPageOffset,
	getTableColumns,
	getTableDirection,
	getTablePages,
	getTablePagination,
	getTableSorting,
	// getTableStatus,
	getTable,
} from "../../selectors/tableSelectors";
import {
	Row,
	reverseTable,
	setOffset,
	setSortBy,
	updatePageSize,
	Page,
	Pagination as PaginationType,
	ReverseOptions,
	selectRowIds,
	selectRowById,
	rowsSelectors,
} from "../../slices/tableSlice";
import {
	changeAllSelected,
	changeRowSelection,
	goToPage,
	updatePages,
} from "../../thunks/tableThunks";
import cn from "classnames";

import EditTableViewModal from "../shared/EditTableViewModal";

import Notifications from "./Notifications";
import { useAppDispatch, useAppSelector } from "../../store";
import { TableColumn } from "../../configs/tableConfigs/aclsTableConfig";
import ButtonLikeAnchor from "./ButtonLikeAnchor";
import { ModalHandle } from "./modals/Modal";
import { ParseKeys } from "i18next";
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp } from "react-icons/lu";

const containerPageSize = React.createRef<HTMLDivElement>();

export type TemplateMap = {
	[key: string]: ({ row }: { row: any }) => JSX.Element | JSX.Element[]
}

/**
 * This component renders the table in the table views of resources
 */
const Table = ({
	templateMap,
}: {
	templateMap: TemplateMap
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const editTableViewModalRef = useRef<ModalHandle>(null);
	const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

	const forceDeselectAll = () => {
		dispatch(changeAllSelected(false));
		if (selectAllCheckboxRef.current?.checked) {
			selectAllCheckboxRef.current.checked = false;
		}
	};

	const showEditTableViewModal = () => {
		editTableViewModalRef.current?.open();
	};

	const hideEditTableViewModal = () => {
		editTableViewModalRef.current?.close?.();
	};


	return (
		<>
			<Notifications context="above_table" />
			<div className="action-bar">
				<ul>
					<li>
						<ButtonLikeAnchor
							onClick={() => showEditTableViewModal()}
						>
							{t("TABLE_EDIT")}
						</ButtonLikeAnchor>
					</li>
				</ul>
			</div>

			{/* Display modal for editing table view if table edit button is clicked */}
			<EditTableViewModal
				close={hideEditTableViewModal}
				modalRef={editTableViewModalRef}
			/>

			<table className={"main-tbl highlight-hover"}>
				<thead>
					<tr>
						<MultiSelect
							selectAllCheckboxRef={selectAllCheckboxRef}
						/>
						<TableHeadRows
							forceDeselectAll={forceDeselectAll}
						/>
					</tr>
				</thead>
				<tbody>
					<TableBody
						templateMap={templateMap}
					/>
				</tbody>
			</table>

			<div id="tbl-view-controls-container">
				{/* Selection of page size */}
				<PageSize
					forceDeselectAll={forceDeselectAll}
				/>
				{/* Pagination and navigation trough pages */}
				<Pagination
					forceDeselectAll={forceDeselectAll}
				/>
			</div>
		</>
	);
};

// Only show if multiple selection is possible
const MultiSelect = ({ selectAllCheckboxRef }: { selectAllCheckboxRef: React.RefObject<HTMLInputElement | null> }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const multiSelect = useAppSelector(state => getMultiSelect(state));
	const table = useAppSelector(state => getTable(state));

	const isNewEventAdded = table.flags?.events?.isNewEventAdded;

	// Select or deselect all rows on a page
	const onChangeAllSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.checked;
		dispatch(changeAllSelected(selected));
	};
   	useEffect(() => {
  	if (isNewEventAdded && multiSelect) {
   	 if (selectAllCheckboxRef.current?.checked) {
		selectAllCheckboxRef.current.checked = false;
			}
		  }
	// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isNewEventAdded, multiSelect]);

	return (
		<>
			{multiSelect &&
				<th className="small">
					{/* Checkbox to select all rows*/}
					<input
						ref={selectAllCheckboxRef}
						type="checkbox"
						onChange={e => onChangeAllSelected(e)}
						aria-label={t("EVENTS.EVENTS.TABLE.SELECT_ALL")}
					/>
				</th>
			}
		</>
	);
};

const TableHeadRows = ({ forceDeselectAll }: { forceDeselectAll: () => unknown }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const columns = useAppSelector(state => getTableColumns(state));
	const sortBy = useAppSelector(state => getTableSorting(state));
	const reverse = useAppSelector(state => getTableDirection(state));

	const sortByColumn = (colName: string) => {
		// By sorting, any selected item has to be deselected!
		forceDeselectAll();
		dispatch(setSortBy(colName));
		let direction: ReverseOptions = "ASC";
		if (reverse && reverse === "ASC") {
			direction = "DESC";
		}
		dispatch(reverseTable(direction));
		dispatch(updatePages());
	};

	return (
		<>
			{columns.map((column, key) =>
				column.deactivated ? null : column.sortable ? ( // Check if column is sortable and render accordingly
					<th
						key={key}
						className={cn({
							"col-sort": !!sortBy && column.name === sortBy,
							sortable: true,
						})}
						onClick={() => sortByColumn(column.name)}
					>
						<span>
							<span>{t(column.label)}</span>
							<div>
								<LuChevronUp
									className={cn("chevron-up", { active: reverse === "ASC" && column.name === sortBy })}
								/>
								<LuChevronDown
									className={cn("chevron-down", { active: reverse === "ASC" && column.name === sortBy })}
								/>
							</div>
						</span>
					</th>
				) : (
					<th key={key} className={cn({ sortable: false })}>
						<span>{t(column.label)}</span>
					</th>
				),
			)}
		</>
	);
};

const TableBody = ({ templateMap }: { templateMap: TemplateMap }) => {
	const { t } = useTranslation();

	const columnCount = useAppSelector(state => getTableColumns(state).length);
	const rowCount = useAppSelector(rowsSelectors.selectTotal);
	// const status = useAppSelector(state => getTableStatus(state));

	return (
		<>
			{status === "loading" && rowCount === 0 ? (
				<tr>
					<td colSpan={columnCount} style={{ textAlign: "center" }}>
						<i className="fa fa-spinner fa-spin fa-2x fa-fw" />
					</td>
				</tr>
			) : !(status === "loading") && rowCount === 0 ? (
				// Show if no results and table is not loading
				<tr>
					<td colSpan={columnCount}>{t("TABLE_NO_RESULT")}</td>
				</tr>
			) : (
				!(status === "loading") &&
				// Repeat for each row in table.rows
				<TableRows
					templateMap={templateMap}
				/>
			)}
		</>
	);
};

const TableRows = ({ templateMap }: { templateMap: TemplateMap }) => {
	const rowKeys = useAppSelector(selectRowIds);

	return (
		<>
			{rowKeys.map(rowKey => (
				<TableRow
					key={rowKey}
					rowKey={rowKey}
					templateMap={templateMap}
				/>
			))}
		</>
	);
};

const TableRow = ({ rowKey, templateMap }: { rowKey: string, templateMap: TemplateMap }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const row = useAppSelector(state => selectRowById(state, rowKey));

	const columns = useAppSelector(state => getTableColumns(state));
	const multiSelect = useAppSelector(state => getMultiSelect(state));

	const tryToGetValueForKeyFromRowAsString = (row: Row, key: string) => {
		if (key in row) {
			const value = row[key as keyof Row];
			if (typeof value === "string") {
				return value;
			}
		}

		return "";
	};

	const renderCell = (column: TableColumn, index: number) => {
		if (column.deactivated) {
			return null;
		}

		// Column template available
		if (column.template && templateMap[column.template]) {
			return (
				<td key={index}>
					<ColumnTemplate row={row} column={column} templateMap={templateMap} />
				</td>
			);
		}

		// Nothing available
		if (!column.template && !column.translate) {
			return <td key={index}>{column.name in row ? row[column.name as keyof Row] : ""}</td>;
		}

		// Translation available
		if (!column.template && column.translate) {
			return <td key={index}>{t(tryToGetValueForKeyFromRowAsString(row, column.name) as ParseKeys)}</td>;
		}



		return <td key={index} />;
	};

	return (
		<tr>
			{/* Show if multi selection is possible */}
			{/* Checkbox for selection of row */}
			{multiSelect && (
				<td>
					<input
						type="checkbox"
						checked={row.selected}
						onChange={() => dispatch(changeRowSelection(row.id))}
						aria-label={t("EVENTS.EVENTS.TABLE.SELECT_EVENT", { title: "title" in row ? row.title : row.id })}
					/>
				</td>
			)}
			{/* Populate table */}
			{columns.map(renderCell)}
		</tr>
	);
};

// Apply a column template and render corresponding components
const ColumnTemplate = ({ row, column, templateMap }: {row: Row, column: TableColumn, templateMap: TemplateMap}) => {
	if (!column.template) {
		return <></>;
	}
	const Template = templateMap[column.template];
	return <Template row={row} />;
};

/**
 * Change amount of rows displayed in the table
 */
const PageSize = ({ forceDeselectAll }: { forceDeselectAll: () => unknown }) => {
	const dispatch = useAppDispatch();
	const pagination = useAppSelector(state => getTablePagination(state));

	const sizeOptions = [10, 20, 50, 100, 1000]; // Size options for pagination
	const [showPageSizes, setShowPageSizes] = useState(false);

	useEffect(() => {
		// Function for handling clicks outside of an open dropdown menu
		const handleClickOutside = (e: MouseEvent) => {
			if (
				e && containerPageSize.current && !containerPageSize.current.contains(e.target as Node)
			) {
				setShowPageSizes(false);
			}
		};

		// Event listener for handle a click outside of dropdown menu
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
		};
	});

	const changePageSize = (size: number) => {
		forceDeselectAll();
		dispatch(updatePageSize(size));
		dispatch(setOffset(0));
		dispatch(updatePages());
	};

	return (
		<div
			className="drop-down-container small flipped"
			onClick={() => setShowPageSizes(!showPageSizes)}
			ref={containerPageSize}
			role="button"
			tabIndex={0}
		>
			<span>{pagination.limit}</span>
			<LuChevronDown className="chevron-down"/>
			{/* Drop down menu for selection of page size */}
			{showPageSizes && (
				<ul className="dropdown-ul">
					{sizeOptions.map((size, key) => (
						<li key={key}>
							<ButtonLikeAnchor
								onClick={() => changePageSize(size)}
							>
								{size}
							</ButtonLikeAnchor>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

/**
 * Switch between table pages
 */
const Pagination = ({ forceDeselectAll }: { forceDeselectAll: () => unknown }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const pageOffset = useAppSelector(state => getPageOffset(state));
	const pages = useAppSelector(state => getTablePages(state));
	const pagination = useAppSelector(state => getTablePagination(state));

	const directAccessible = getDirectAccessiblePages(pages, pagination);

	// Navigation to previous page possible?
	const isNavigatePrevious = () => {
		return pageOffset > 0;
	};

	// Navigation to next page possible?
	const isNavigateNext = () => {
		return pageOffset < pages.length - 1;
	};

	return (
		<div className="pagination">
			<ButtonLikeAnchor
				className={cn("prev", { disabled: !isNavigatePrevious() })}
				aria-disabled={!isNavigatePrevious()}
				onClick={() => {
					dispatch(goToPage(pageOffset - 1));
					forceDeselectAll();
				}}
				tooltipText="TABLE_PREVIOUS"
				aria-label={t("TABLE_PREVIOUS")}
			>
				<LuChevronLeft />
			</ButtonLikeAnchor>
			{directAccessible.map((page, key) =>
				page.active ? (
					<ButtonLikeAnchor key={key}
						className="active"
						aria-label={t("TABLE_CURRENT", { pageNumber: page.label })}
					>
						{page.label}
					</ButtonLikeAnchor>
				) : (
					<ButtonLikeAnchor key={key}
						aria-label={t("TABLE_NUMBERED", { pageNumber: page.label })}
						onClick={() => {
							dispatch(goToPage(page.number));
							forceDeselectAll();
						}}
					>
						{page.label}
					</ButtonLikeAnchor>
				),
			)}

			<ButtonLikeAnchor
				className={cn("next", { disabled: !isNavigateNext() })}
				aria-disabled={!isNavigateNext()}
				onClick={() => {
					dispatch(goToPage(pageOffset + 1));
					forceDeselectAll();
				}}
				tooltipText="TABLE_NEXT"
				aria-label={t("TABLE_NEXT")}
			>
				<LuChevronRight />
			</ButtonLikeAnchor>
		</div>
	);
};

// get all pages directly accessible from current page
const getDirectAccessiblePages = (pages: Page[], pagination: PaginationType) => {
	let startIndex = pagination.offset - pagination.directAccessibleNo,
		endIndex = pagination.offset + pagination.directAccessibleNo,
		i,
		pageToPush;
	const directAccessible = [];

	if (startIndex < 0) {
		// Adjust range if selected range is too low
		endIndex = endIndex - startIndex;
		startIndex = 0;
	}

	if (endIndex >= pages.length) {
		// Adjust range if selected range is too high
		startIndex = startIndex - (endIndex - pages.length) - 1;
		endIndex = pages.length - 1;
	}

	// Adjust start and end index to numbers that are possible
	endIndex = Math.min(pages.length - 1, endIndex);
	startIndex = Math.max(0, startIndex);

	for (i = startIndex; i <= endIndex; i++) {
		if (i === startIndex && startIndex !== 0) {
			// Add first item if start index is not 0 (first page always direct accessible)
			pageToPush = pages[0];
		} else if (i === endIndex && endIndex !== pages.length - 1) {
			// Add last item if end index is not real end (last page always direct accessible)
			pageToPush = pages[pages.length - 1];
		} else if (
			(i === startIndex + 1 && startIndex !== 0) ||
			(i === endIndex - 1 && endIndex !== pages.length - 1)
		) {
			// Add .. at second or second last position if start or end index is not 0
			pageToPush = {
				number: i,
				label: "..",
				active: i === pagination.offset,
			};
		} else {
			pageToPush = pages[i];
		}
		directAccessible.push(pageToPush);
	}

	return directAccessible;
};

export default Table;
