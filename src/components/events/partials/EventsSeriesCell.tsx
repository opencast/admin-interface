import { getFilters } from "../../../selectors/tableFilterSelectors";
import { editFilterValue } from "../../../slices/tableFilterSlice";
import { loadEventsIntoTable } from "../../../thunks/tableThunks";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvents } from "../../../slices/eventSlice";
import { Event } from "../../../slices/eventSlice";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";

/**
 * This component renders the series cells of events in the table view
 */
const EventsSeriesCell = ({
	row,
}: {
	row: Event
}) => {
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, "events"));

	// Filter with value of current cell
	const addFilter = async (seriesId: string) => {
		const filter = filterMap.find(({ name }) => name === "series");
		if (filter) {
			dispatch(editFilterValue({ filterName: filter.name, value: seriesId, resource: "events" }));
			await dispatch(fetchEvents());
			dispatch(loadEventsIntoTable());
		}
	};

	return (
		row.series ? (
			// Link template for series of event
			<ButtonLikeAnchor
				onClick={() => row.series
					? addFilter(row.series.id)
					: console.error("Tried to sort by a series, but the series did not exist.")
				}
				className={"crosslink"}
				// tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.SERIES"} // Disabled due to performance concerns
			>
				{row.series.title}
			</ButtonLikeAnchor>
		)
		: <></>
	);
};

export default EventsSeriesCell;
