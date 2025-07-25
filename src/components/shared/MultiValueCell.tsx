import React from "react";
import { getFilters } from "../../selectors/tableFilterSelectors";
import { editFilterValue } from "../../slices/tableFilterSlice";
import { AppThunk, useAppDispatch, useAppSelector } from "../../store";
import { IconButton } from "../shared/IconButton";
import { AsyncThunk } from "@reduxjs/toolkit";
import { ParseKeys } from "i18next";
import { Resource } from "../../slices/tableSlice";

/**
 * This component renders the presenters cells of events in the table view
 */
const MultiValueCell = ({
	resource,
	values,
	filterName,
	fetchResource,
	loadResourceIntoTable,
	tooltipText,
}: {
	resource: Resource
	values: string[]
	filterName: string
	fetchResource: AsyncThunk<any, void, any>
	loadResourceIntoTable: () => AppThunk
	tooltipText: ParseKeys,
}) => {
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, resource));

	// Filter with value of current cell
	const addFilter = async (presenter: string) => {
		const filter = filterMap.find(
			({ name }) => name === filterName,
		);
		if (filter) {
			dispatch(editFilterValue({ filterName: filter.name, value: presenter, resource }));
			await dispatch(fetchResource());
			dispatch(loadResourceIntoTable());
		}
	};

	return (
		// Link template for each value
		values.map((value, key) => (
			<IconButton
				key={key}
				callback={() => addFilter(value)}
				iconClassname={"metadata-entry"}
				tooltipText={tooltipText}
			>
				{value}
			</IconButton>
		))
	);
};

export default MultiValueCell;
