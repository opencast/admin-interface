import { setSpecificEventFilter } from "../../../slices/tableFilterSlice";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../store";
import { Series } from "../../../slices/seriesSlice";
import BaseButton from "../../shared/BaseButton";

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
		// set the series filter value of events to series title
		await dispatch(setSpecificEventFilter({ filter: "series", filterValue: seriesId }));
		navigate("/events/events");
	};

	return (
		<BaseButton
			className="button-like-anchor crosslink"
			tooltipText={"EVENTS.SERIES.TABLE.TOOLTIP.SERIES"}
			onClick={() => redirectToEvents(row.id)}
		>
			{row.title}
		</BaseButton>
	);
};

export default SeriesTitleCell;
