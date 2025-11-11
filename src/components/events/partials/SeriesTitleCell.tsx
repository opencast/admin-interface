import { Series } from "../../../slices/seriesSlice";
import RedirectCell from "../../shared/RedirectCell";

/**
 * This component renders the title cells of series in the table view
 */
const SeriesTitleCell = ({
	row,
}: {
	row: Series
}) => {
	return (
		<RedirectCell
			path={"/events/events"}
			filterName={"series"}
			filterValue={row.id}
			// tooltipText={"EVENTS.SERIES.TABLE.TOOLTIP.SERIES"} // Disabled due to performance concerns
			resetBeforeRedirect
		>
			{row.title}
		</RedirectCell>
	);
};

export default SeriesTitleCell;
