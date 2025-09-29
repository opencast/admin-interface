import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import DeleteSeriesModal from "./partials/modals/DeleteSeriesModal";
import { seriesTemplateMap } from "../../configs/tableConfigs/seriesTableMap";
import {
	loadSeriesIntoTable,
} from "../../thunks/tableThunks";
import { getTotalSeries, isShowActions } from "../../selectors/seriesSeletctor";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchSeries,
	fetchSeriesMetadata,
	fetchSeriesThemes,
	showActionsSeries,
} from "../../slices/seriesSlice";
import { fetchSeriesDetailsTobiraNew } from "../../slices/seriesSlice";
import { eventsLinks } from "./partials/EventsNavigation";
import { Modal, ModalHandle } from "../shared/modals/Modal";
import { availableHotkeys } from "../../configs/hotkeysConfig";
import TableActionDropdown from "../shared/TableActionDropdown";
import TablePage from "../shared/TablePage";

/**
 * This component renders the table view of series
 */
const Series = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const newSeriesModalRef = useRef<ModalHandle>(null);
	const deleteModalRef = useRef<ModalHandle>(null);

	const location = useLocation();

	// const series = useAppSelector(state => getTotalSeries(state));
	const showActions = useAppSelector(state => isShowActions(state));

	useEffect(() => {
		// disable actions button
		dispatch(showActionsSeries(false));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.hash]);

	const onNewSeriesModal = async () => {
		await Promise.all([
			dispatch(fetchSeriesMetadata()),
			dispatch(fetchSeriesThemes()),
			dispatch(fetchSeriesDetailsTobiraNew("/")),
		]);

		newSeriesModalRef.current?.open();
	};

	return (
		<>
			<TablePage
				resource={"series"}
				fetchResource={fetchSeries}
				loadResourceIntoTable={loadSeriesIntoTable}
				getTotalResources={getTotalSeries}
				navBarLinks={eventsLinks}
				navBarCreate={{
						accessRole: "ROLE_UI_SERIES_CREATE",
						onShowModal: onNewSeriesModal,
						text: "EVENTS.EVENTS.ADD_SERIES",
						resource: "series",
						hotkeySequence: availableHotkeys.general.NEW_SERIES.sequence,
						hotkeyDescription: availableHotkeys.general.NEW_SERIES.description,
					}}
				caption={"EVENTS.SERIES.TABLE.CAPTION"}
				templateMap={seriesTemplateMap}
			>
				<TableActionDropdown
					actions={[
						{
							accessRole: ["ROLE_UI_SERIES_DELETE"],
							handleOnClick: () => deleteModalRef.current?.open(),
							text: "BULK_ACTIONS.DELETE.SERIES.CAPTION",
						},
					]}
					disabled={!showActions}
				/>
			</TablePage>

			{/* NavBar Modals */}
			<Modal
				header={t("BULK_ACTIONS.DELETE.SERIES.CAPTION")}
				classId="delete-series-status-modal"
				ref={deleteModalRef}
			>
				<DeleteSeriesModal close={() => deleteModalRef.current?.close?.()} />
			</Modal>
		</>
	);
};

export default Series;
