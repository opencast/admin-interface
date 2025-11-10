import { fetchSeries, Series } from "../../../slices/seriesSlice";
import { loadSeriesIntoTable } from "../../../thunks/tableThunks";
import MultiValueCell from "../../shared/MultiValueCell";

/**
 * This component renders the contributors cells of series in the table view
 */
const SeriesContributorsCell = ({
	row,
}: {
	row: Series
}) => {
		return (
		<MultiValueCell
			resource="series"
			values={row.contributors}
			filterName="contributors"
			fetchResource={fetchSeries}
			loadResourceIntoTable={loadSeriesIntoTable}
			// tooltipText="EVENTS.SERIES.TABLE.TOOLTIP.CONTRIBUTORS" // Disabled due to performance concerns
		/>
	);
};

export default SeriesContributorsCell;
