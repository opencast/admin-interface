import { Series } from "../../../slices/seriesSlice";
import RedirectCell from "../../shared/RedirectCell";
import { resetFilterValues } from "../../../slices/tableFilterSlice";

/**
 * This component renders the title cells of series in the table view
 */
const SeriesTitleCell = ({
	row,
}: {
	row: Series
}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const redirectToEvents = async (seriesId: string) => {
		dispatch(resetFilterValues());
		// set the series filter value of events to series title
		await dispatch(setSpecificEventFilter({ filter: "series", filterValue: seriesId }));
		navigate("/events/events");
	};

	return (
		<RedirectCell
			path={"/events/events"}
			filterName={"series"}
			filterValue={row.id}
			// tooltipText={"EVENTS.SERIES.TABLE.TOOLTIP.SERIES"} // Disabled due to performance concerns
		>
			{row.title}
		</RedirectCell>
	);
};

export default SeriesTitleCell;
