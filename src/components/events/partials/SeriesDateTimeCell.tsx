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
			{row.creation_date !== undefined && (() => {
				const creationDate = row.creation_date;
				return (
					<DateTimeCell
						resource="series"
						date={creationDate}
						filterName="CreationDate"
						fetchResource={fetchSeries}
						loadResourceIntoTable={loadSeriesIntoTable}
						tooltipText="EVENTS.SERIES.TABLE.TOOLTIP.CREATION"
					/>
				);
			})()}
		</>
	);
};

export default SeriesDateTimeCell;
