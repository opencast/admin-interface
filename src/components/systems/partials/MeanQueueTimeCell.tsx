import { Service } from "../../../slices/serviceSlice";
import { formatHMS } from "../../../utils/dateUtils";

/**
 * This component renders the mean queue time cells of systems in the table view
 */
const MeanQueueTimeCell = ({
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

export default MeanQueueTimeCell;
