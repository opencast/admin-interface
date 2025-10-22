import EventActionCell from "../../components/events/partials/EventActionCell";
import EventsDateCell from "../../components/events/partials/EventsDateCell";
import EventsPresentersCell from "../../components/events/partials/EventsPresentersCell";
import EventsSeriesCell from "../../components/events/partials/EventsSeriesCell";
import EventsStatusCell from "../../components/events/partials/EventsStatusCell";
import PublishedCell from "../../components/events/partials/PublishedCell";
import EventsLocationCell from "../../components/events/partials/EventsLocationCell";
import EventsEndCell from "../../components/events/partials/EventsEndCell";
import EventsStartCell from "../../components/events/partials/EventsStartCell";
import EventsNotesCell from "../../components/events/partials/EventsNotesCell";

/**
 * This map contains the mapping between the template strings above and the corresponding react component.
 * This helps to render different templates of cells more dynamically
 */
export const eventsTemplateMap = {
	EventActionsCell: EventActionCell,
	EventsDateCell: EventsDateCell,
	EventsStartCell: EventsStartCell,
	EventsEndCell: EventsEndCell,
	EventsLocationCell: EventsLocationCell,
	EventsPresentersCell: EventsPresentersCell,
	EventsSeriesCell: EventsSeriesCell,
	EventsStatusCell: EventsStatusCell,
	PublishedCell: PublishedCell,
	EventsNotesCell: EventsNotesCell,
};
