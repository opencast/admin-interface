import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { confirmUnsaved, hasAccess } from "../../../../utils/utils";
import EventDetailsCommentsTab from "../ModalTabsAndPages/EventDetailsCommentsTab";
import EventDetailsAccessPolicyTab from "../ModalTabsAndPages/EventDetailsAccessPolicyTab";
import EventDetailsWorkflowTab from "../ModalTabsAndPages/EventDetailsWorkflowTab";
import EventDetailsWorkflowDetails from "../ModalTabsAndPages/EventDetailsWorkflowDetails";
import EventDetailsPublicationTab from "../ModalTabsAndPages/EventDetailsPublicationTab";
import EventDetailsWorkflowOperations from "../ModalTabsAndPages/EventDetailsWorkflowOperations";
import EventDetailsWorkflowOperationDetails from "../ModalTabsAndPages/EventDetailsWorkflowOperationDetails";
import EventDetailsWorkflowErrorDetails from "../ModalTabsAndPages/EventDetailsWorkflowErrorDetails";
import EventDetailsAssetsTab from "../ModalTabsAndPages/EventDetailsAssetsTab";
import EventDetailsSchedulingTab from "../ModalTabsAndPages/EventDetailsSchedulingTab";
import DetailsMetadataTab from "../ModalTabsAndPages/DetailsMetadataTab";
import {
	getMetadata,
	getExtendedMetadata,
	isFetchingMetadata,
	getSchedulingProperties,
	isFetchingScheduling,
	hasStatistics as getHasStatistics,
	isFetchingStatistics,
	getModalWorkflowTabHierarchy,
	getModalPage,
	getEventDetailsTobiraDataError,
	getEventDetailsTobiraStatus,
} from "../../../../selectors/eventDetailsSelectors";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import EventDetailsStatisticsTab from "../ModalTabsAndPages/EventDetailsStatisticsTab";
import { fetchAssetUploadOptions } from "../../../../thunks/assetsThunks";
import { hasAnyDeviceAccess } from "../../../../utils/resourceUtils";
import { getRecordings } from "../../../../selectors/recordingSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	fetchMetadata,
	updateMetadata,
	updateExtendedMetadata,
	fetchSchedulingInfo,
	fetchEventStatistics,
	openModalTab,
	fetchEventDetailsTobira,
	fetchHasActiveTransactions,
} from "../../../../slices/eventDetailsSlice";
import { addNotification, removeNotificationByKey, removeNotificationWizardForm, removeNotificationWizardTobira } from "../../../../slices/notificationSlice";
import DetailsTobiraTab from "../ModalTabsAndPages/DetailsTobiraTab";
import { FormikProps } from "formik";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { NOTIFICATION_CONTEXT } from "../../../../configs/modalConfig";
import { unwrapResult } from "@reduxjs/toolkit";
import { ParseKeys } from "i18next";
import EventDetailsWorkflowSchedulingTab from "../ModalTabsAndPages/EventDetailsWorkflowSchedulingTab";
import { useHotkeys } from "react-hotkeys-hook";
import { availableHotkeys } from "../../../../configs/hotkeysConfig";

export enum EventDetailsPage {
	Metadata,
	ExtendedMetadata,
	Publication,
	Assets,
	Scheduling,
	Workflow,
	AccessPolicy,
	Comments,
	Tobira,
	Statistics,
}

export type WorkflowTabHierarchy = "workflows" | "workflow-details" | "workflow-operations" | "workflow-operation-details" | "errors-and-warnings" | "workflow-error-details"
export type AssetTabHierarchy = "entry" | "add-asset" | "asset-attachments" | "attachment-details" | "asset-catalogs" | "catalog-details" | "asset-media" | "media-details" | "asset-publications" | "publication-details";

/**
 * This component manages the pages of the event details
 */
const EventDetails = ({
	eventId,
	policyChanged,
	setPolicyChanged,
	formikRef,
}: {
	eventId: string,
	policyChanged: boolean,
	setPolicyChanged: (value: boolean) => void,
	formikRef: React.RefObject<FormikProps<any> | null>
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		dispatch(removeNotificationWizardTobira());
		dispatch(fetchMetadata(eventId));
		dispatch(fetchSchedulingInfo(eventId));
		dispatch(fetchEventStatistics(eventId));
		dispatch(fetchAssetUploadOptions());

		dispatch(fetchHasActiveTransactions(eventId)).then(fetchTransactionResult => {
			const result = unwrapResult(fetchTransactionResult);
			if (result.active !== undefined && result.active) {
				dispatch(
					addNotification({
						type: "warning",
						key: "ACTIVE_TRANSACTION",
						duration: -1,
						context: NOTIFICATION_CONTEXT,
						noDuplicates: true,
					}),
				);
			}
			if (result.active !== undefined && !result.active) {
				dispatch(
					removeNotificationByKey({
						key: "ACTIVE_TRANSACTION",
						context: NOTIFICATION_CONTEXT,
					}),
				);
			}
		});


		dispatch(fetchEventDetailsTobira(eventId));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const page = useAppSelector(state => getModalPage(state));
	const workflowTabHierarchy = useAppSelector(state => getModalWorkflowTabHierarchy(state));
	const user = useAppSelector(state => getUserInformation(state));
	const metadata = useAppSelector(state => getMetadata(state));
	const extendedMetadata = useAppSelector(state => getExtendedMetadata(state));
	const isLoadingMetadata = useAppSelector(state => isFetchingMetadata(state));
	const hasSchedulingProperties = useAppSelector(state => getSchedulingProperties(state));
	const isLoadingScheduling = useAppSelector(state => isFetchingScheduling(state));
	const hasStatistics = useAppSelector(state => getHasStatistics(state));
	const isLoadingStatistics = useAppSelector(state => isFetchingStatistics(state));
	const captureAgents = useAppSelector(state => getRecordings(state));
	const tobiraStatus = useAppSelector(state => getEventDetailsTobiraStatus(state));
	const tobiraError = useAppSelector(state => getEventDetailsTobiraDataError(state));

	const tabs: {
		tabNameTranslation: ParseKeys,
		bodyHeaderTranslation?: ParseKeys,
		accessRole: string,
		name: string,
		page: EventDetailsPage,
		hidden?: boolean,
	}[] = [
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.METADATA",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.METADATA.CAPTION",
			accessRole: "ROLE_UI_EVENTS_DETAILS_METADATA_VIEW",
			name: "metadata",
			page: EventDetailsPage.Metadata,
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.EXTENDED-METADATA",
			accessRole: "ROLE_UI_EVENTS_DETAILS_METADATA_VIEW",
			name: "metadata-extended",
			page: EventDetailsPage.ExtendedMetadata,
			hidden: !extendedMetadata || !(extendedMetadata.length > 0),
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.PUBLICATIONS",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.PUBLICATIONS.CAPTION",
			accessRole: "ROLE_UI_EVENTS_DETAILS_PUBLICATIONS_VIEW",
			name: "publications",
			page: EventDetailsPage.Publication,
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.ASSETS",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.ASSETS.CAPTION",
			accessRole: "ROLE_UI_EVENTS_DETAILS_ASSETS_VIEW",
			name: "assets",
			page: EventDetailsPage.Assets,
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.SCHEDULING",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.SCHEDULING.CAPTION",
			accessRole: "ROLE_UI_EVENTS_DETAILS_SCHEDULING_VIEW",
			name: "scheduling",
			page: EventDetailsPage.Scheduling,
			hidden:
				!hasSchedulingProperties || !hasAnyDeviceAccess(user, captureAgents),
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.WORKFLOWS",
			accessRole: "ROLE_UI_EVENTS_DETAILS_WORKFLOWS_VIEW",
			name: "workflows",
			page: EventDetailsPage.Workflow,
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.ACCESS",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.TABS.ACCESS",
			accessRole: "ROLE_UI_EVENTS_DETAILS_ACL_VIEW",
			name: "access",
			page: EventDetailsPage.AccessPolicy,
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.COMMENTS",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.COMMENTS.CAPTION",
			accessRole: "ROLE_UI_EVENTS_DETAILS_COMMENTS_VIEW",
			name: "comments",
			page: EventDetailsPage.Comments,
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.TOBIRA",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.TABS.TOBIRA",
			accessRole: "ROLE_UI_EVENTS_DETAILS_COMMENTS_VIEW",
			name: "tobira",
			page: EventDetailsPage.Tobira,
			hidden: tobiraStatus === "failed" && tobiraError?.message?.includes("503"),
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.TABS.STATISTICS",
			bodyHeaderTranslation: "EVENTS.EVENTS.DETAILS.STATISTICS.CAPTION",
			accessRole: "ROLE_UI_EVENTS_DETAILS_STATISTICS_VIEW",
			name: "statistics",
			page: EventDetailsPage.Statistics,
			hidden: !hasStatistics,
		},
	];

	const openTab = (tabNr: EventDetailsPage) => {
		let isUnsavedChanges = false;
		isUnsavedChanges = policyChanged;
		if (formikRef.current && formikRef.current.dirty !== undefined && formikRef.current.dirty) {
			isUnsavedChanges = true;
		}

		if (!isUnsavedChanges || confirmUnsaved(t)) {
			dispatch(removeNotificationWizardForm());
		        dispatch(openModalTab(tabNr, "workflow-details", "entry"));
		}
	};
	const wizardTabs = tabs.filter(tab =>
	  !tab.hidden,
	);

	const goNextStep = () => {
	  const currentIndex = wizardTabs.findIndex(tab => tab.page === page);
	  if (currentIndex === -1) { return; } // not in wizard, do nothing
	  const nextIndex = currentIndex + 1;
	  if (nextIndex >= wizardTabs.length) { return; } // already at last step (Comments)
	  openTab(wizardTabs[nextIndex].page);
	};

	const goPrevStep = () => {
	  const currentIndex = wizardTabs.findIndex(tab => tab.page === page);
	  if (currentIndex <= 0) { return; }
	  openTab(wizardTabs[currentIndex - 1].page);
	};
	// NEXT STEP
	useHotkeys(
		availableHotkeys.general.NEXT_PANEL.sequence,
		() => {
				goNextStep();
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"] },
		[goNextStep],
	);

	// PREVIOUS STEP
	useHotkeys(
		availableHotkeys.general.PREVIOUS_PANEL.sequence,
		() => {
				goPrevStep();
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"] },
		[goPrevStep],
	);

	return (
		<>
			<nav className="modal-nav" id="modal-nav">
				{tabs.map((tab, index) => !tab.hidden && hasAccess(tab.accessRole, user) && (
					<ButtonLikeAnchor
						key={tab.name}
						className={cn({ active: page === tab.page })}
						onClick={() => openTab(index)}
					>
						{t(tab.tabNameTranslation)}
					</ButtonLikeAnchor>
				))}
			</nav>
			{/* Initialize overall modal */}
			<div>
				{page === EventDetailsPage.Metadata && !isLoadingMetadata && (
					<DetailsMetadataTab
						resourceId={eventId}
						metadata={[metadata]}
						updateResource={updateMetadata}
						editAccessRole="ROLE_UI_EVENTS_DETAILS_METADATA_EDIT"
						formikRef={formikRef}
						header={tabs[page].bodyHeaderTranslation}
					/>
				)}
				{page === EventDetailsPage.ExtendedMetadata && !isLoadingMetadata && (
					<DetailsMetadataTab
						resourceId={eventId}
						metadata={extendedMetadata}
						updateResource={updateExtendedMetadata}
						editAccessRole="ROLE_UI_EVENTS_DETAILS_METADATA_EDIT"
						formikRef={formikRef}
					/>
				)}
				{page === EventDetailsPage.Publication && <EventDetailsPublicationTab eventId={eventId} />}
				{page === EventDetailsPage.Assets && (
					<EventDetailsAssetsTab
						eventId={eventId}
					/>
				)}
				{page === EventDetailsPage.Scheduling && !isLoadingScheduling && (
					<EventDetailsSchedulingTab
						eventId={eventId}
						formikRef={formikRef}
					/>
				)}
				{page === EventDetailsPage.Workflow && !hasSchedulingProperties &&
					((workflowTabHierarchy === "workflows" && (
						<EventDetailsWorkflowTab
							eventId={eventId}
						/>
					)) ||
						(workflowTabHierarchy === "workflow-details" && (
							<EventDetailsWorkflowDetails
								eventId={eventId}
							/>
						)) ||
						(workflowTabHierarchy === "workflow-operations" && (
							<EventDetailsWorkflowOperations
								eventId={eventId}
							/>
						)) ||
						(workflowTabHierarchy === "workflow-operation-details" && (
							<EventDetailsWorkflowOperationDetails />
						)) ||
						(workflowTabHierarchy === "workflow-error-details" && (
							<EventDetailsWorkflowErrorDetails
								eventId={eventId}
							/>
						)))}
				{page === EventDetailsPage.Workflow && hasSchedulingProperties &&
					<EventDetailsWorkflowSchedulingTab
						eventId={eventId}
						formikRef={formikRef}
					/>
				}
				{page === EventDetailsPage.AccessPolicy && (
					<EventDetailsAccessPolicyTab
						eventId={eventId}
						header={tabs[page].bodyHeaderTranslation ?? "EVENTS.EVENTS.DETAILS.TABS.ACCESS"}
						policyChanged={policyChanged}
						setPolicyChanged={setPolicyChanged}
					/>
				)}
				{page === EventDetailsPage.Comments && (
					<EventDetailsCommentsTab
						eventId={eventId}
						header={tabs[page].bodyHeaderTranslation ?? "EVENTS.EVENTS.DETAILS.COMMENTS.CAPTION"}
					/>
				)}
				{page === EventDetailsPage.Tobira && (
					<DetailsTobiraTab
						kind="event"
						id={eventId}
					/>
				)}
				{page === EventDetailsPage.Statistics && !isLoadingStatistics && (
					<EventDetailsStatisticsTab
						eventId={eventId}
						header={tabs[page].bodyHeaderTranslation ?? "EVENTS.EVENTS.DETAILS.STATISTICS.CAPTION"}
					/>
				)}
			</div>
		</>
	);
};

export default EventDetails;
