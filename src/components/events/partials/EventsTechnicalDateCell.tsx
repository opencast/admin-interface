import { useTranslation } from "react-i18next";
import { getFilters } from "../../../selectors/tableFilterSelectors";
import { editFilterValue } from "../../../slices/tableFilterSlice";
import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvents } from "../../../slices/eventSlice";
import { renderValidDate } from "../../../utils/dateUtils";
import { Event } from "../../../slices/eventSlice";
import { IconButton } from "../../shared/IconButton";

/**
 * This component renders the technical date cells of events in the table view
 */
const EventsTechnicalDateCell = ({
	row,
}: {
	row: Event
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, "events"));

	// Filter with value of current cell
	const addFilter = async (date: string) => {
		const filter = filterMap.find(({ name }) => name === "technicalStart");
		if (filter) {
			dispatch(editFilterValue({ filterName: filter.name, value: date + "/" + date, resource: "events" }));
			await dispatch(fetchEvents());
			dispatch(loadEventsIntoTable());
		}
	};

	return (
		// Link template for technical date of event
		<IconButton
			callback={() => addFilter(row.date)}
			iconClassname={"crosslink"}
			tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.START"}
		>
			{t("dateFormats.date.short", { date: renderValidDate(row.technical_start) })}
		</IconButton>
	);
};

export default EventsTechnicalDateCell;
