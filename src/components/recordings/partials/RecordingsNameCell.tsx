import { Recording } from "../../../slices/recordingSlice";
import RedirectCell from "../../shared/RedirectCell";

/**
 * This component renders the name cells of recordings in the table view
 */
const RecordingsNameCell = ({
	row,
}: {
	row: Recording
}) => {
	return (
		<RedirectCell
			path={"/events/events"}
			filterName={"location"}
			filterValue={row.name}
			// tooltipText={"RECORDINGS.RECORDINGS.TABLE.TOOLTIP.NAME"} // Disabled due to performance concerns
		>
			{row.name}
		</RedirectCell>
	);
};

export default RecordingsNameCell;
