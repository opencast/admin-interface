import { Service } from "../../../slices/serviceSlice";
import { formatHMS } from "../../../utils/dateUtils";

/**
 * This component renders the mean run time cells of systems in the table view
 */
const MeanRunTimeCell = ({
	row,
}: {
	row: Service
}) => {

	return (
		<span>
			{formatHMS(row.meanQueueTime)}
		</span>
	);
};

export default MeanRunTimeCell;
