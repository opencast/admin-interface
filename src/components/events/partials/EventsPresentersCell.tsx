import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import MultiValueCell from "../../shared/MultiValueCell";

/**
 * This component renders the presenters cells of events in the table view
 */
const EventsPresentersCell = ({
	row,
}: {
	row: Event
}) => {
	return (
		<MultiValueCell
			resource="events"
			values={row.presenters}
			filterName="presentersBibliographic"
			fetchResource={fetchEvents}
			loadResourceIntoTable={loadEventsIntoTable}
			// tooltipText="EVENTS.EVENTS.TABLE.TOOLTIP.PRESENTER"  // Disabled due to performance concerns
		/>
	);
};

export default EventsPresentersCell;
