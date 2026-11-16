import { jobsTemplateMap } from "../../configs/tableConfigs/jobsTableConfig";
import { getTotalJobs } from "../../selectors/jobSelectors";
import { Job } from "../../slices/jobSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import TablePage from "../shared/TablePage";
import { Row } from "../../slices/tableSlice";

/**
 * This component renders the table view of jobs
 */
const Jobs = () => {
	return (
		<TablePage<Row & Job>
			resource={"jobs"}
			getTotalResources={getTotalJobs}
			navBarLinks={systemsLinks}
			caption={"SYSTEMS.JOBS.TABLE.CAPTION"}
			templateMap={jobsTemplateMap}
		/>
	);
};

export default Jobs;
