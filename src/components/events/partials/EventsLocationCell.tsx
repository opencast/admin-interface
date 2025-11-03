import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import FilterCell from "../../shared/FilterCell";

/**
 * This component renders the location cells of events in the table view
 */
const EventsLocationCell = ({
	row,
}: {
	row: Event
}) => {
	return (
		<>
			{ row.location &&
				<FilterCell
					resource={"events"}
					filterName={"location"}
					filterItems={[{
						filterValue: row.location,
						children: row.location,
						// cellTooltipText: "EVENTS.EVENTS.TABLE.TOOLTIP.LOCATION", // Disabled due to performance concerns
					}]}
					fetchResource={fetchEvents}
					loadResourceIntoTable={loadEventsIntoTable}
				/>
			}
		</>
	);
};

export default EventsLocationCell;
