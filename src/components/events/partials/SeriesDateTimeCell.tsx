import { fetchSeries, Series } from "../../../slices/seriesSlice";
import { loadSeriesIntoTable } from "../../../thunks/tableThunks";
import DateTimeCell from "../../shared/DateTimeCell";

/**
 * This component renders the creation date cells of series in the table view
 */
const SeriesDateTimeCell = ({
	row,
}: {
	row: Series
}) => {
	return (
		<>
			{row.creation_date !== undefined &&
				<DateTimeCell
					resource="series"
					date={row.creation_date}
					filterName="CreationDate"
					fetchResource={fetchSeries}
					loadResourceIntoTable={loadSeriesIntoTable}
					// tooltipText="EVENTS.SERIES.TABLE.TOOLTIP.CREATION" // Disabled due to performance concerns
				/>
			}
		</>
	);
};

export default SeriesDateTimeCell;
