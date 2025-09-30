import { useNavigate } from "react-router";
import { setSpecificEventFilter } from "../../../slices/tableFilterSlice";
import { useAppDispatch } from "../../../store";
import { Recording } from "../../../slices/recordingSlice";
import BaseButton from "../../shared/BaseButton";

/**
 * This component renders the name cells of recordings in the table view
 */
const RecordingsNameCell = ({
	row,
}: {
	row: Recording
}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const redirectToEvents = async (locationName: string) => {
		// set the location filter value of events to location name
		await dispatch(setSpecificEventFilter({ filter: "location", filterValue: locationName }));
		navigate("/events/events");
	};

	return (
		<BaseButton
			className="button-like-anchor crosslink"
			// tooltipText={"RECORDINGS.RECORDINGS.TABLE.TOOLTIP.NAME"} // Disabled due to performance concerns
			onClick={() => redirectToEvents(row.name)}
		>
			{row.name}
		</BaseButton>
	);
};

export default RecordingsNameCell;
