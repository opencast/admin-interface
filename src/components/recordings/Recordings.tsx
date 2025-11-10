import { recordingsTemplateMap } from "../../configs/tableConfigs/recordingsTableMap";
import { getTotalRecordings } from "../../selectors/recordingSelectors";
import { loadRecordingsIntoTable } from "../../thunks/tableThunks";
import { fetchRecordings } from "../../slices/recordingSlice";
import { AsyncThunk } from "@reduxjs/toolkit";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of recordings
 */
const Recordings = () => {
	return (
		<TablePage
			resource={"recordings"}
			fetchResource={fetchRecordings as AsyncThunk<any, void, any>}
			loadResourceIntoTable={loadRecordingsIntoTable}
			getTotalResources={getTotalRecordings}
			navBarLinks={[
				{
					path: "/recordings/recordings",
					accessRole: "ROLE_UI_LOCATIONS_VIEW",
					text: "RECORDINGS.NAVIGATION.LOCATIONS",
				},
			]}
			caption={"RECORDINGS.RECORDINGS.TABLE.CAPTION"}
			templateMap={recordingsTemplateMap}
		/>
	);
};

export default Recordings;
