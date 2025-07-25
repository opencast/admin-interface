import { Service } from "../../../slices/serviceSlice";
import moment from "moment";

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
			{ moment.utc(moment.duration(row.meanQueueTime * 1000).asMilliseconds()).format("HH:mm:ss") }
		</span>
	);
};

export default MeanQueueTimeCell;
