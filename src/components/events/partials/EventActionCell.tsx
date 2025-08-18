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
import { Modal, ModalHandle } from "../../shared/modals/Modal";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";
import { LuFileSymlink, LuFileText, LuFolderOpen, LuLink, LuMessageCircle, LuScissors, LuTriangleAlert } from "react-icons/lu";

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
			<ButtonLikeAnchor
				onClick={onClickEventDetails}
				className={"action-cell-button"}
				editAccessRole={"ROLE_UI_EVENTS_DETAILS_VIEW"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.DETAILS"}
			>
				<LuFileText />
			</ButtonLikeAnchor>

			{/* If event belongs to a series then the corresponding series details can be opened */}
			{!!row.series && (
				<ButtonLikeAnchor
					onClick={onClickSeriesDetails}
					className={"action-cell-button more-series"}
					editAccessRole={"ROLE_UI_SERIES_DETAILS_VIEW"}
					tooltipText={"EVENTS.SERIES.TABLE.TOOLTIP.DETAILS"}
				>
					<LuFileSymlink />
				</ButtonLikeAnchor>
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
						className="action-cell-button cut"
						target="_blank" rel="noreferrer"
					>
						<LuScissors />
						{row.needs_cutting && <span id="badge" className="badge" />}
					</a>
				</Tooltip>
			)}

			{/* If the event has comments and no open comments then the comment tab of event details can be opened directly */}
			{row.has_comments && !row.has_open_comments && (
				<ButtonLikeAnchor
					onClick={() => onClickComments()}
					tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.COMMENTS"}
					className={"action-cell-button"}
				>
					<LuMessageCircle style={{
						color: "#1d5888",
					}}/>
				</ButtonLikeAnchor>
			)}

			{/* If the event has comments and open comments then the comment tab of event details can be opened directly */}
			{row.has_comments && row.has_open_comments && (
				<ButtonLikeAnchor
					onClick={() => onClickComments()}
					tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.COMMENTS"}
					className={"action-cell-button"}
				>
					<LuMessageCircle style={{
						color: "#1d5888",
					}}/>
				</ButtonLikeAnchor>
			)}

			{/* If the event is in in a paused workflow state then a warning icon is shown and workflow tab of event
				details can be opened directly */}
			{row.workflow_state === "PAUSED" &&
				<ButtonLikeAnchor
					onClick={() => onClickWorkflow()}
					editAccessRole={"ROLE_UI_EVENTS_DETAILS_WORKFLOWS_EDIT"}
					tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.PAUSED_WORKFLOW"}
					className={"action-cell-button"}
				>
					<LuTriangleAlert style={{
						color: "#444",
					}}/>
				</ButtonLikeAnchor>
			}

			{/* Open assets tab of event details directly*/}
			<ButtonLikeAnchor
				onClick={() => onClickAssets()}
				editAccessRole={"ROLE_UI_EVENTS_DETAILS_ASSETS_VIEW"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.ASSETS"}
				className={"action-cell-button"}
				>
					<LuFolderOpen style={{
						color: "#444",
					}}/>
				</ButtonLikeAnchor>

			{/* Open dialog for embedded code*/}
			<ButtonLikeAnchor
				onClick={() => showEmbeddingCodeModal()}
				editAccessRole={"ROLE_UI_EVENTS_EMBEDDING_CODE_VIEW"}
				tooltipText={"EVENTS.EVENTS.TABLE.TOOLTIP.EMBEDDING_CODE"}
				className={"action-cell-button"}
				>
					<LuLink style={{
						color: "#444",
					}}/>
				</ButtonLikeAnchor>

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
