import { useTranslation } from "react-i18next";
import { editFilterValue } from "../../slices/tableFilterSlice";
import { getFilters } from "../../selectors/tableFilterSelectors";
import { AppThunk, useAppDispatch, useAppSelector } from "../../store";
import { renderValidDate } from "../../utils/dateUtils";
import { ParseKeys } from "i18next";
import { AsyncThunk } from "@reduxjs/toolkit";
import { Resource } from "../../slices/tableSlice";
import ButtonLikeAnchor from "./ButtonLikeAnchor";

/**
 * This component renders the start date cells of events in the table view
 */
const DateTimeCell = ({
	resource,
	date,
	filterName,
	fetchResource,
	loadResourceIntoTable,
	tooltipText,
}: {
	resource: Resource
	date: string
	filterName: string
	fetchResource: AsyncThunk<any, void, any>
	loadResourceIntoTable: () => AppThunk
	tooltipText: ParseKeys
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, resource));

	// Filter with value of current cell
	const addFilter = async (date: string) => {
		const filter = filterMap.find(({ name }) => name === filterName);
		if (filter) {
			const startDate = new Date(date);
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setSeconds(0);
			const endDate = new Date(date);
			endDate.setHours(23);
			endDate.setMinutes(59);
			endDate.setSeconds(59);

			dispatch(editFilterValue({ filterName: filter.name, value: startDate.toISOString() + "/" + endDate.toISOString(), resource }));
			await dispatch(fetchResource());
			dispatch(loadResourceIntoTable());
		}
	};

	return (
		// Link template for start date of event
		<ButtonLikeAnchor
			onClick={() => addFilter(date)}
			className={"crosslink"}
			tooltipText={tooltipText}
		>
			{t("dateFormats.date.short", { date: renderValidDate(date) })}
		</ButtonLikeAnchor>
	);
};

export default DateTimeCell;
