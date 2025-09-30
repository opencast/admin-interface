import { useTranslation } from "react-i18next";
import { getFilters } from "../../../selectors/tableFilterSelectors";
import { editFilterValue } from "../../../slices/tableFilterSlice";
import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvents } from "../../../slices/eventSlice";
import { renderValidDate } from "../../../utils/dateUtils";
import { Event } from "../../../slices/eventSlice";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";

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
		<ButtonLikeAnchor
			onClick={() => addFilter(row.date)}
			className={"crosslink"}
			// tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.START"} // Disabled due to performance concerns
		>
			{t("dateFormats.date.short", { date: renderValidDate(row.technical_start) })}
		</ButtonLikeAnchor>
	);
};

export default EventsTechnicalDateCell;
