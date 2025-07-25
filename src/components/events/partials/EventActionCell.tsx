import { useRef } from "react";
import { useTranslation } from "react-i18next";
import EmbeddingCodeModal from "./modals/EmbeddingCodeModal";
import { getUserInformation } from "../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../utils/utils";
import SeriesDetailsModal from "./modals/SeriesDetailsModal";
import { EventDetailsPage } from "./modals/EventDetails";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
	fetchSeriesDetailsAcls,
	fetchSeriesDetailsMetadata,
	fetchSeriesDetailsTheme,
	fetchSeriesDetailsThemeNames,
} from "../../../slices/seriesDetailsSlice";
import { Event, deleteEvent } from "../../../slices/eventSlice";
import { Tooltip } from "../../shared/Tooltip";
import { openModal } from "../../../slices/eventDetailsSlice";
import { ActionCellDelete } from "../../shared/ActionCellDelete";
import { IconButton } from "../../shared/IconButton";
import { Modal, ModalHandle } from "../../shared/modals/Modal";

/**
 * This component renders the action cells of events in the table view
 */
const EventActionCell = ({
	row,
}: {
	row: Event
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const seriesDetailsModalRef = useRef<ModalHandle>(null);
	const embeddingCodeModalRef = useRef<ModalHandle>(null);

	const user = useAppSelector(state => getUserInformation(state));

	const deletingEvent = (id: string) => {
		dispatch(deleteEvent(id));
	};

	const showEmbeddingCodeModal = () => {
		embeddingCodeModalRef.current?.open();
	};

	const showSeriesDetailsModal = () => {
		seriesDetailsModalRef.current?.open();
	};

	const onClickSeriesDetails = async () => {
		if (row.series) {
			await Promise.all([
				dispatch(fetchSeriesDetailsMetadata(row.series.id)),
				dispatch(fetchSeriesDetailsAcls(row.series.id)),
				dispatch(fetchSeriesDetailsTheme(row.series.id)),
				dispatch(fetchSeriesDetailsThemeNames()),
			]);

			showSeriesDetailsModal();
		}
	};

	const onClickEventDetails = () => {
		dispatch(openModal(EventDetailsPage.Metadata, row));
	};

	const onClickComments = () => {
		dispatch(openModal(EventDetailsPage.Comments, row));
	};

	const onClickWorkflow = () => {
		dispatch(openModal(EventDetailsPage.Workflow, row));
	};

	const onClickAssets = () => {
		dispatch(openModal(EventDetailsPage.Assets, row));
	};

	return (
		<>
			{!!row.series && (
				<SeriesDetailsModal
					seriesId={row.series.id}
					seriesTitle={row.series.title}
					modalRef={seriesDetailsModalRef}
				/>
			)}

			{/* Open event details */}
			<IconButton
				callback={onClickEventDetails}
				iconClassname={"more"}
				editAccessRole={"ROLE_UI_EVENTS_DETAILS_VIEW"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.DETAILS"}
			/>

			{/* If event belongs to a series then the corresponding series details can be opened */}
			{!!row.series && (
				<IconButton
					callback={onClickSeriesDetails}
					iconClassname={"more-series"}
					editAccessRole={"ROLE_UI_SERIES_DETAILS_VIEW"}
					tooltipText={"EVENTS.SERIES.TABLE.TOOLTIP.DETAILS"}
				/>
			)}

			{/* Delete an event */}
			<ActionCellDelete
				editAccessRole={"ROLE_UI_EVENTS_DELETE"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.DELETE"}
				resourceId={row.id}
				resourceName={row.title}
				resourceType={"EVENT"}
				deleteMethod={deletingEvent}
			/>

			{/* If the event has an preview then the editor can be opened and status if it needs to be cut is shown */}
			{!!row.has_preview && hasAccess("ROLE_UI_EVENTS_EDITOR_VIEW", user) && (
				<Tooltip
					title={
						row.needs_cutting
							? t("EVENTS.EVENTS.TABLE.TOOLTIP.EDITOR_NEEDS_CUTTING")
							: t("EVENTS.EVENTS.TABLE.TOOLTIP.EDITOR")
					}
				>
					<a
						href={`/editor-ui/index.html?id=${row.id}`}
						className="cut"
						target="_blank" rel="noreferrer"
					>
						{row.needs_cutting && <span id="badge" className="badge" />}
					</a>
				</Tooltip>
			)}

			{/* If the event has comments and no open comments then the comment tab of event details can be opened directly */}
			{row.has_comments && !row.has_open_comments && (
				<IconButton
					callback={() => onClickComments()}
					iconClassname={"comments"}
					tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.COMMENTS"}
				/>
			)}

			{/* If the event has comments and open comments then the comment tab of event details can be opened directly */}
			{row.has_comments && row.has_open_comments && (
				<IconButton
					callback={() => onClickComments()}
					iconClassname={"comments-open"}
					tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.COMMENTS"}
				/>
			)}

			{/* If the event is in in a paused workflow state then a warning icon is shown and workflow tab of event
				details can be opened directly */}
			{row.workflow_state === "PAUSED" &&
				<IconButton
					callback={() => onClickWorkflow()}
					iconClassname={"fa fa-warning"}
					editAccessRole={"ROLE_UI_EVENTS_DETAILS_WORKFLOWS_EDIT"}
					tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.PAUSED_WORKFLOW"}
				/>
			}

			{/* Open assets tab of event details directly*/}
			<IconButton
				callback={() => onClickAssets()}
				iconClassname={"fa fa-folder-open"}
				editAccessRole={"ROLE_UI_EVENTS_DETAILS_ASSETS_VIEW"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.ASSETS"}
			/>

			{/* Open dialog for embedded code*/}
			<IconButton
				callback={() => showEmbeddingCodeModal()}
				iconClassname={"fa fa-link"}
				editAccessRole={"ROLE_UI_EVENTS_EMBEDDING_CODE_VIEW"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.EMBEDDING_CODE"}
			/>

			{/* Embedding Code Modal */}
			<Modal
				header={t("CONFIRMATIONS.ACTIONS.SHOW.EMBEDDING_CODE")}
				classId="embedding-code"
				ref={embeddingCodeModalRef}
			>
				{/* component that manages tabs of theme details modal*/}
				<EmbeddingCodeModal eventId={row.id} />
			</Modal>
		</>
	);
};

export default EventActionCell;
