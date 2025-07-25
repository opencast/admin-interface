import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import { recordingsTemplateMap } from "../../configs/tableConfigs/recordingsTableMap";
import { getTotalRecordings } from "../../selectors/recordingSelectors";
import { loadRecordingsIntoTable } from "../../thunks/tableThunks";
import { fetchFilters } from "../../slices/tableFilterSlice";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchRecordings } from "../../slices/recordingSlice";
import { AsyncThunk } from "@reduxjs/toolkit";
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of recordings
 */
const Recordings = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [displayNavigation, setNavigation] = useState(false);

	const recordings = useAppSelector(state => getTotalRecordings(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("recordings"));

		// Load recordings on mount
		const loadRecordings = async () => {
			// Fetching recordings from server
			await dispatch(fetchRecordings(undefined));

			// Load recordings into table
			if (allowLoadIntoTable) {
				dispatch(loadRecordingsIntoTable());
			}
		};
		loadRecordings();

		return () => {
			allowLoadIntoTable = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				links={[
					{
						path: "/recordings/recordings",
						accessRole: "ROLE_UI_LOCATIONS_VIEW",
						text: "RECORDINGS.NAVIGATION.LOCATIONS",
					},
				]}
			/>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					{/* Include filters component */}
					<TableFilters
						loadResource={fetchRecordings as AsyncThunk<any, void, any>}
						loadResourceIntoTable={loadRecordingsIntoTable}
						resource={"recordings"}
					/>

					<h1>{t("RECORDINGS.RECORDINGS.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: recordings })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={recordingsTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Recordings;
