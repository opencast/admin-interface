import { jobsTemplateMap } from "../../configs/tableConfigs/jobsTableConfig";
import { getTotalJobs } from "../../selectors/jobSelectors";
import {
	loadJobsIntoTable,
} from "../../thunks/tableThunks";
import { fetchJobs } from "../../slices/jobSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of jobs
 */
const Jobs = () => {
	return (
		<TablePage
			resource={"jobs"}
			fetchResource={fetchJobs}
			loadResourceIntoTable={loadJobsIntoTable}
			getTotalResources={getTotalJobs}
			navBarLinks={systemsLinks}
			caption={"SYSTEMS.JOBS.TABLE.CAPTION"}
			templateMap={jobsTemplateMap}
		/>
	);
};

export default Jobs;
