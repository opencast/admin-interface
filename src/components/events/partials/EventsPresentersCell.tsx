import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import FilterCell from "../../shared/FilterCell";

/**
 * This component renders the presenters cells of events in the table view
 */
const EventsPresentersCell = ({
	row,
}: {
	row: Event
}) => {
	return (
		<FilterCell
			resource={"events"}
			filterName={"presentersBibliographic"}
			filterItems={row.presenters.map(presenter => ({
				filterValue: presenter,
				children: presenter,
				// cellTooltipText: "EVENTS.EVENTS.TABLE.TOOLTIP.PRESENTER", // Disabled due to performance concerns
			}))}
			fetchResource={fetchEvents}
			loadResourceIntoTable={loadEventsIntoTable}
		/>
	);
};

export default EventsPresentersCell;
