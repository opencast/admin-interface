import { getFilters } from "../../../selectors/tableFilterSelectors";
import { editFilterValue } from "../../../slices/tableFilterSlice";
import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import { IconButton } from "../../shared/IconButton";

/**
 * This component renders the location cells of events in the table view
 */
const EventsLocationCell = ({
	row,
}: {
	row: Event
}) => {
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, "events"));

	// Filter with value of current cell
	const addFilter = (location: string) => {
		const filter = filterMap.find(({ name }) => name === "location");
		if (filter) {
			dispatch(editFilterValue({ filterName: filter.name, value: location, resource: "events" }));
			dispatch(fetchEvents());
			dispatch(loadEventsIntoTable());
		}
	};

	return (
		// Link template for location of event
		<IconButton
			callback={() => addFilter(row.location)}
			iconClassname={"crosslink"}
			tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.LOCATION"}
		>
			{row.location}
		</IconButton>
	);
};

export default EventsLocationCell;
