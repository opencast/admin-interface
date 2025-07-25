import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import DeleteSeriesModal from "./partials/modals/DeleteSeriesModal";
import { seriesTemplateMap } from "../../configs/tableConfigs/seriesTableMap";
import {
	loadSeriesIntoTable,
} from "../../thunks/tableThunks";
import { fetchFilters } from "../../slices/tableFilterSlice";
import { getTotalSeries, isShowActions } from "../../selectors/seriesSeletctor";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
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
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of series
 */
const Series = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [displayNavigation, setNavigation] = useState(false);
	const newSeriesModalRef = useRef<ModalHandle>(null);
	const deleteModalRef = useRef<ModalHandle>(null);

	const location = useLocation();

	const series = useAppSelector(state => getTotalSeries(state));
	const showActions = useAppSelector(state => isShowActions(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("series"));

		// disable actions button
		dispatch(showActionsSeries(false));

		// Load events on mount
		const loadSeries = async () => {
			// fetching series from server
			await dispatch(fetchSeries());

			// load series into table
			if (allowLoadIntoTable) {
				dispatch(loadSeriesIntoTable());
			}
		};
		loadSeries();

		// Fetch series every minute
		const fetchSeriesInterval = setInterval(() => loadSeries(), 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchSeriesInterval);
		};
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

	const hideDeleteModal = () => {
		deleteModalRef.current?.close?.();
	};

	return (
		<>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				navAriaLabel={"EVENTS.EVENTS.NAVIGATION.LABEL"}
				links={
					eventsLinks
				}
				create={{
					accessRole: "ROLE_UI_SERIES_CREATE",
					onShowModal: onNewSeriesModal,
					text: "EVENTS.EVENTS.ADD_SERIES",
					resource: "series",
					hotkeySequence: availableHotkeys.general.NEW_SERIES.sequence,
					hotkeyDescription: availableHotkeys.general.NEW_SERIES.description,
				}}
			>
				<Modal
					header={t("BULK_ACTIONS.DELETE.SERIES.CAPTION")}
					classId="delete-series-status-modal"
					ref={deleteModalRef}
				>
					<DeleteSeriesModal close={hideDeleteModal} />
				</Modal>
			</NavBar>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					<div className="filters-container">
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
						{/* Include filters component */}
						<TableFilters
							loadResource={fetchSeries}
							loadResourceIntoTable={loadSeriesIntoTable}
							resource={"series"}
						/>
					</div>
					<h1>{t("EVENTS.SERIES.TABLE.CAPTION")}</h1>
					{/* Include table view */}
					<h4>{t("TABLE_SUMMARY", { numberOfRows: series })}</h4>
				</div>
				<Table templateMap={seriesTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Series;
