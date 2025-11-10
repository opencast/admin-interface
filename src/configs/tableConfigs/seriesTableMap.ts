import SeriesTitleCell from "../../components/events/partials/SeriesTitleCell";
import SeriesOrganizersCell from "../../components/events/partials/SeriesOrganizersCell";
import SeriesContributorsCell from "../../components/events/partials/SeriesContributorsCell";
import SeriesDateTimeCell from "../../components/events/partials/SeriesDateTimeCell";
import SeriesActionsCell from "../../components/events/partials/SeriesActionsCell";

/**
 * This map contains the mapping between the template strings above and the corresponding react component.
 * This helps to render different templates of cells more dynamically
 */
export const seriesTemplateMap = {
	SeriesTitleCell: SeriesTitleCell,
	SeriesOrganizersCell: SeriesOrganizersCell,
	SeriesContributorsCell: SeriesContributorsCell,
	SeriesDateTimeCell: SeriesDateTimeCell,
	SeriesActionsCell: SeriesActionsCell,
};
