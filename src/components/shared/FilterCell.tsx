import { getFilters } from "../../selectors/tableFilterSelectors";
import { editFilterValue } from "../../slices/tableFilterSlice";
import { AppThunk, useAppDispatch, useAppSelector } from "../../store";
import { Resource } from "../../slices/tableSlice";
import { AsyncThunk } from "@reduxjs/toolkit";
import { ParseKeys } from "i18next";
import { ReactNode } from "react";
import ButtonLikeAnchor from "./ButtonLikeAnchor";

/**
 * This component renders a table cell with one or more clickable items
 * where clicking the items will set a filter
 */
const FilterCell = <T, >({
	resource,
	filterName,
	filterItems,
	fetchResource,
	loadResourceIntoTable,
}: {
	resource: Resource
	filterName: string
	filterItems: {
		filterValue: string
		children: ReactNode
		cellTooltipText?: ParseKeys
	}[]
	fetchResource: AsyncThunk<T, void, any>
	loadResourceIntoTable: () => AppThunk,
}) => {
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, resource));

	// Filter with value of current cell
	const addFilter = async (filterValue: string) => {
		const filter = filterMap.find(({ name }) => name === filterName);
		if (filter) {
			dispatch(editFilterValue({ filterName: filter.name, value: filterValue, resource }));
			await dispatch(fetchResource());
			dispatch(loadResourceIntoTable());
		}
	};

	return (
		// Link template for location of event
		filterItems.map((item, key) => (
			<ButtonLikeAnchor
				key={key}
				onClick={() => addFilter(item.filterValue)}
				className={"crosslink"}
				tooltipText={item.cellTooltipText}
			>
				{item.children}
			</ButtonLikeAnchor>
		))
	);
};

export default FilterCell;
