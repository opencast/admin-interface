import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import { serversTemplateMap } from "../../configs/tableConfigs/serversTableMap";
import { getTotalServers } from "../../selectors/serverSelectors";
import { fetchFilters } from "../../slices/tableFilterSlice";
import {
	loadServersIntoTable,
} from "../../thunks/tableThunks";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchServers } from "../../slices/serverSlice";
import { systemsLinks } from "./partials/SystemsNavigation";
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of servers
 */
const Servers = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [displayNavigation, setNavigation] = useState(false);

	const servers = useAppSelector(state => getTotalServers(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("servers"));

		// Load servers on mount
		const loadServers = async () => {
			// Fetching servers from server
			await dispatch(fetchServers());

			// Load servers into table
			if (allowLoadIntoTable) {
				dispatch(loadServersIntoTable());
			}
		};
		loadServers();

		// Fetch servers every minute
		const fetchServersInterval = setInterval(() => loadServers(), 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchServersInterval);
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
						loadResource={fetchServers}
						loadResourceIntoTable={loadServersIntoTable}
						resource={"servers"}
					/>
					<h1>{t("SYSTEMS.SERVERS.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: servers })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={serversTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Servers;
