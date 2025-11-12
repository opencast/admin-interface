import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import DateTimeCell from "../../shared/DateTimeCell";

/**
 * This component renders the start date cells of events in the table view
 */
const EventsDateCell = ({
	row,
}: {
	row: Event
}) => {
	return (
		<DateTimeCell
			resource="events"
			date={row.date}
			filterName="startDate"
			fetchResource={fetchEvents}
			loadResourceIntoTable={loadEventsIntoTable}
			// tooltipText="EVENTS.EVENTS.TABLE.TOOLTIP.START" // Disabled due to performance concerns
		/>
	);
};

export default EventsDateCell;
