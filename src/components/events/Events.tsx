import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import Stats from "../shared/Stats";
import DeleteEventsModal from "./partials/modals/DeleteEventsModal";
import StartTaskModal from "./partials/modals/StartTaskModal";
import EditScheduledEventsModal from "./partials/modals/EditScheduledEventsModal";
import EditMetadataEventsModal from "./partials/modals/EditMetadataEventsModal";
import { eventsTemplateMap } from "../../configs/tableConfigs/eventsTableMap";
import {
	loadEventsIntoTable,
} from "../../thunks/tableThunks";
import {
	getTotalEvents,
	isFetchingAssetUploadOptions as getIsFetchingAssetUploadOptions,
	isShowActions,
} from "../../selectors/eventSelectors";
import { getUserInformation } from "../../selectors/userInfoSelectors";
import { hasAccess } from "../../utils/utils";
import { availableHotkeys } from "../../configs/hotkeysConfig";
import { fetchAssetUploadOptions } from "../../thunks/assetsThunks";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchEventMetadata,
	fetchEvents,
	setShowActions,
} from "../../slices/eventSlice";
import EventDetailsModal from "./partials/modals/EventDetailsModal";
import { eventsLinks } from "./partials/EventsNavigation";
import { Modal, ModalHandle } from "../shared/modals/Modal";
import TableActionDropdown from "../shared/TableActionDropdown";
import TablePage from "../shared/TablePage";
import SeriesDetailsModal from "./partials/modals/SeriesDetailsModal";

/**
 * This component renders the table view of events
 */
const Events = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const newEventModalRef = useRef<ModalHandle>(null);
	const startTaskModalRef = useRef<ModalHandle>(null);
	const deleteModalRef = useRef<ModalHandle>(null);
	const editScheduledEventsModalRef = useRef<ModalHandle>(null);
	const editMetadataEventsModalRef = useRef<ModalHandle>(null);

	const user = useAppSelector(state => getUserInformation(state));
	const showActions = useAppSelector(state => isShowActions(state));
	const isFetchingAssetUploadOptions = useAppSelector(state => getIsFetchingAssetUploadOptions(state));

	const location = useLocation();

	useEffect(() => {
		// disable actions button
		dispatch(setShowActions(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.hash]);

	const onNewEventModal = async () => {
		await Promise.all([
			dispatch(fetchEventMetadata()),
			dispatch(fetchAssetUploadOptions()),
		]);

		newEventModalRef.current?.open();
	};

	return (
		<>
			<TablePage
				resource={"events"}
				fetchResource={fetchEvents}
				loadResourceIntoTable={loadEventsIntoTable}
				getTotalResources={getTotalEvents}
				navBarLinks={eventsLinks}
				navBarCreate={{
					accessRole: "ROLE_UI_EVENTS_CREATE",
					onShowModal: onNewEventModal,
					text: "EVENTS.EVENTS.ADD_EVENT",
					isDisplay: !isFetchingAssetUploadOptions,
					resource: "events",
					hotkeySequence: availableHotkeys.general.NEW_EVENT.sequence,
					hotkeyDescription: availableHotkeys.general.NEW_EVENT.description,
				}}
				navBarChildren={
					hasAccess("ROLE_UI_EVENTS_COUNTERS_VIEW", user) && (
						<div className="stats-container">
							<Stats />
						</div>
					)
				}
				caption={"EVENTS.EVENTS.TABLE.CAPTION"}
				templateMap={eventsTemplateMap}
			>
				<TableActionDropdown
					actions={[
						{
							accessRole: ["ROLE_UI_EVENTS_DELETE"],
							handleOnClick: () => deleteModalRef.current?.open(),
							text: "BULK_ACTIONS.DELETE.EVENTS.CAPTION",
						},
						{
							accessRole: ["ROLE_UI_TASKS_CREATE"],
							handleOnClick: () => startTaskModalRef.current?.open(),
							text: "BULK_ACTIONS.SCHEDULE_TASK.CAPTION",
						},
						{
							accessRole: ["ROLE_UI_EVENTS_DETAILS_SCHEDULING_EDIT", "ROLE_UI_EVENTS_DETAILS_METADATA_EDIT"],
							handleOnClick: () => editScheduledEventsModalRef.current?.open(),
							text: "BULK_ACTIONS.EDIT_EVENTS.CAPTION",
						},
						{
							accessRole: ["ROLE_UI_EVENTS_DETAILS_METADATA_EDIT"],
							handleOnClick: () => editMetadataEventsModalRef.current?.open(),
							text: "BULK_ACTIONS.EDIT_EVENTS_METADATA.CAPTION",
						},
					]}
					disabled={!showActions}
				/>
			</TablePage>

			{/* NavBar Modals */}
			<Modal
				header={t("BULK_ACTIONS.DELETE.EVENTS.CAPTION")}
				classId="delete-events-status-modal"
				ref={deleteModalRef}
			>
				<DeleteEventsModal close={() => deleteModalRef.current?.close?.()} />
			</Modal>

			<Modal
				header={t("BULK_ACTIONS.SCHEDULE_TASK.CAPTION")}
				classId=""
				ref={startTaskModalRef}
			>
				<StartTaskModal close={() => startTaskModalRef.current?.close?.()} />
			</Modal>

			<Modal
				header={t("BULK_ACTIONS.EDIT_EVENTS.CAPTION")}
				classId=""
				ref={editScheduledEventsModalRef}
			>
				<EditScheduledEventsModal close={() => editScheduledEventsModalRef.current?.close?.()} />
			</Modal>

			<Modal
				header={t("BULK_ACTIONS.EDIT_EVENTS_METADATA.CAPTION")}
				classId=""
				ref={editMetadataEventsModalRef}
			>
				<EditMetadataEventsModal close={() => editMetadataEventsModalRef.current?.close?.()} />
			</Modal>

			{/* Include table modal */}
			<EventDetailsModal />
			<SeriesDetailsModal />
		</>
	);
};

export default Events;
