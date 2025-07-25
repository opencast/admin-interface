import React from "react";
import { fetchSeries, Series } from "../../../slices/seriesSlice";
import { loadSeriesIntoTable } from "../../../thunks/tableThunks";
import MultiValueCell from "../../shared/MultiValueCell";

/**
 * This component renders the creators cells of series in the table view
 */
const SeriesOrganizersCell = ({
	row,
}: {
	row: Series
}) => {
		return (
			<MultiValueCell
				resource="series"
				values={row.organizers}
				filterName="organizers"
				fetchResource={fetchSeries}
				loadResourceIntoTable={loadSeriesIntoTable}
				tooltipText="EVENTS.SERIES.TABLE.TOOLTIP.ORGANIZER"
			/>
		);
};

export default SeriesOrganizersCell;
