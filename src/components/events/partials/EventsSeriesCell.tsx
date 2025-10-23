import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import FilterCell from "../../shared/FilterCell";

/**
 * This component renders the series cells of events in the table view
 */
const EventsSeriesCell = ({
	row,
}: {
	row: Event
}) => {
	return (
		row.series ? (
			<FilterCell
				resource={"events"}
				filterName={"series"}
				filterItems={[{
					filterValue: row.series.id,
					children: row.series.title,
					// cellTooltipText: "EVENTS.EVENTS.TABLE.TOOLTIP.SERIES", // Disabled due to performance concerns
				}]}
				fetchResource={fetchEvents}
				loadResourceIntoTable={loadEventsIntoTable}
			/>
		)
		: <></>
	);
};

export default EventsSeriesCell;
