import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import { fetchFilters } from "../../slices/tableFilterSlice";
import { themesTemplateMap } from "../../configs/tableConfigs/themesTableMap";
import { getTotalThemes } from "../../selectors/themeSelectors";
import { loadThemesIntoTable } from "../../thunks/tableThunks";
import Notifications from "../shared/Notifications";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchThemes } from "../../slices/themeSlice";
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of events
 */
const Themes = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [displayNavigation, setNavigation] = useState(false);

	const themes = useAppSelector(state => getTotalThemes(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("themes"));

		// Load themes on mount
		const loadThemes = async () => {
			// Fetching themes from server
			await dispatch(fetchThemes());

			// Load users into table
			if (allowLoadIntoTable) {
				dispatch(loadThemesIntoTable());
			}
		};
		loadThemes();

		// Fetch themes every minute
		const fetchThemesInterval = setInterval(loadThemes, 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchThemesInterval);
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
						path: "/configuration/themes",
						accessRole: "ROLE_UI_THEMES_VIEW",
						text: "CONFIGURATION.NAVIGATION.THEMES",
					},
				]}
				create={{
					accessRole: "ROLE_UI_THEMES_CREATE",
					text: "CONFIGURATION.ACTIONS.ADD_THEME",
					resource: "themes",
				}}
			/>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					{/* Include filters component */}
					<TableFilters
						loadResource={fetchThemes}
						loadResourceIntoTable={loadThemesIntoTable}
						resource={"themes"}
					/>
					<h1>{t("CONFIGURATION.THEMES.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: themes })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={themesTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Themes;
