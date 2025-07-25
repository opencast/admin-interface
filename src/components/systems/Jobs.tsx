import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import { jobsTemplateMap } from "../../configs/tableConfigs/jobsTableConfig";
import { getTotalJobs } from "../../selectors/jobSelectors";
import { fetchFilters } from "../../slices/tableFilterSlice";
import {
	loadJobsIntoTable,
} from "../../thunks/tableThunks";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchJobs } from "../../slices/jobSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of jobs
 */
const Jobs = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [displayNavigation, setNavigation] = useState(false);

	const jobs = useAppSelector(state => getTotalJobs(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("jobs"));

		// Load jobs on mount
		const loadJobs = async () => {
			// Fetching jobs from server
			await dispatch(fetchJobs());

			// Load jobs into table
			if (allowLoadIntoTable) {
				dispatch(loadJobsIntoTable());
			}
		};
		loadJobs();

		// Fetch jobs every minute
		const fetchJobInterval = setInterval(() => loadJobs(), 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchJobInterval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				links={systemsLinks}
			/>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					{/* Include filters component */}
					<TableFilters
						loadResource={fetchJobs}
						loadResourceIntoTable={loadJobsIntoTable}
						resource={"jobs"}
					/>
					<h1>{t("SYSTEMS.JOBS.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: jobs })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={jobsTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Jobs;
