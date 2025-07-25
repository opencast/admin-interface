import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { setSpecificEventFilter } from "../../../slices/tableFilterSlice";
import { useAppDispatch } from "../../../store";
import { Tooltip } from "../../shared/Tooltip";
import { Recording } from "../../../slices/recordingSlice";

/**
 * This component renders the name cells of recordings in the table view
 */
const RecordingsNameCell = ({
	row,
}: {
	row: Recording
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const redirectToEvents = async (locationName: string) => {
		// set the location filter value of events to location name
		await dispatch(setSpecificEventFilter({ filter: "location", filterValue: locationName }));
		navigate("/events/events");
	};

	return (
		<Tooltip title={t("RECORDINGS.RECORDINGS.TABLE.TOOLTIP.NAME")}>
			<button
				className="button-like-anchor crosslink"
				onClick={() => redirectToEvents(row.name)}
			>
				{row.name}
			</button>
		</Tooltip>
	);
};

export default RecordingsNameCell;
