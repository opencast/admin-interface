import { useTranslation } from "react-i18next";
import { setSpecificEventFilter } from "../../../slices/tableFilterSlice";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../store";
import { Tooltip } from "../../shared/Tooltip";
import { Series } from "../../../slices/seriesSlice";

/**
 * This component renders the title cells of series in the table view
 */
const SeriesTitleCell = ({
	row,
}: {
	row: Series
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const redirectToEvents = async (seriesId: string) => {
		// set the series filter value of events to series title
		await dispatch(setSpecificEventFilter({ filter: "series", filterValue: seriesId }));
		navigate("/events/events");
	};

	return (
		<Tooltip title={t("EVENTS.SERIES.TABLE.TOOLTIP.SERIES")}>
			<button
				className="button-like-anchor crosslink"
				onClick={() => redirectToEvents(row.id)}
			>
				{row.title}
			</button>
		</Tooltip>
	);
};

export default SeriesTitleCell;
