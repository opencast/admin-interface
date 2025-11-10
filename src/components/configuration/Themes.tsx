import { themesTemplateMap } from "../../configs/tableConfigs/themesTableMap";
import { getTotalThemes } from "../../selectors/themeSelectors";
import { loadThemesIntoTable } from "../../thunks/tableThunks";
import { fetchThemes } from "../../slices/themeSlice";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of events
 */
const Themes = () => {
	return (
		<TablePage
			resource={"themes"}
			fetchResource={fetchThemes}
			loadResourceIntoTable={loadThemesIntoTable}
			getTotalResources={getTotalThemes}
			navBarLinks={[
				{
					path: "/configuration/themes",
					accessRole: "ROLE_UI_THEMES_VIEW",
					text: "CONFIGURATION.NAVIGATION.THEMES",
				},
			]}
			navBarCreate={{
				accessRole: "ROLE_UI_THEMES_CREATE",
				text: "CONFIGURATION.ACTIONS.ADD_THEME",
				resource: "themes",
			}}
			caption={"CONFIGURATION.THEMES.TABLE.CAPTION"}
			templateMap={themesTemplateMap}
		/>
	);
};

export default Themes;
