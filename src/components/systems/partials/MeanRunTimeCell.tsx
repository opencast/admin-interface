import { Service } from "../../../slices/serviceSlice";
import moment from "moment";

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
			{ moment.utc(moment.duration(row.meanRunTime * 1000).asMilliseconds()).format("HH:mm:ss") }
		</span>
	);
};

export default MeanRunTimeCell;
