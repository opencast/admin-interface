import { useEffect } from "react";
import Notifications from "../../../shared/Notifications";
import { getModalWorkflowId, getWorkflowOperations } from "../../../../selectors/eventDetailsSelectors";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import {
	fetchWorkflowOperationDetails,
	fetchWorkflowOperations,
	setModalWorkflowTabHierarchy,
	WorkflowOperation,
} from "../../../../slices/eventDetailsSlice";
import { useTranslation } from "react-i18next";
import { WorkflowTabHierarchy } from "../modals/EventDetails";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import { LuCheck, LuEllipsis, LuLoader, LuPause, LuRotateCcw, LuX } from "react-icons/lu";
import { GoDash } from "react-icons/go";

/**
 * This component manages the workflow operations for the workflows tab of the event details modal
 */
const EventDetailsWorkflowOperations = ({
	eventId,
}: {
	eventId: string,
}) => {
	const dispatch = useAppDispatch();

	const workflowId = useAppSelector(state => getModalWorkflowId(state));
	const operations = useAppSelector(state => getWorkflowOperations(state));

  const loadWorkflowOperations = async () => {
		// Fetching workflow operations from server
		dispatch(fetchWorkflowOperations({ eventId, workflowId }));
	};

  useEffect(() => {
		// Fetch workflow operations initially
		loadWorkflowOperations().then();

		// Fetch workflow operations every 5 seconds
		const fetchWorkflowOperationsInterval = setInterval(loadWorkflowOperations, 5000);

		// Unmount interval
		return () => clearInterval(fetchWorkflowOperationsInterval);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openSubTab = (tabType: WorkflowTabHierarchy, operationId: number | undefined = undefined) => {
		dispatch(removeNotificationWizardForm());
		dispatch(setModalWorkflowTabHierarchy(tabType));
		if (tabType === "workflow-operation-details") {
			dispatch(fetchWorkflowOperationDetails({ eventId, workflowId, operationId })).then();
		}
	};

	return (
		<ModalContentTable
			modalContentChildren={
				/* Hierarchy navigation */
				<EventDetailsTabHierarchyNavigation
					openSubTab={openSubTab}
					hierarchyDepth={2}
					translationKey0={"EVENTS.EVENTS.DETAILS.WORKFLOW_INSTANCES.TITLE"}
					subTabArgument0={"workflows"}
					translationKey1={"EVENTS.EVENTS.DETAILS.WORKFLOW_DETAILS.TITLE"}
					subTabArgument1={"workflow-details"}
					translationKey2={"EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TITLE"}
					subTabArgument2={"workflow-operations"}
				/>
			}
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* 'Workflow Operations' table */}
			<WorkflowOperationsTable
				operations={operations.entries.map((entry, index) => (
					{ operation: entry, operationId: index }
				))}
				openSubTab={openSubTab}
				title={"EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TITLE"}
			/>
		</ModalContentTable>
	);
};

export const WorkflowOperationsTable = ({
	operations,
	openSubTab,
	title,
}: {
	operations: {
		operation: WorkflowOperation
		operationId: number
	}[]
	openSubTab: (tab: WorkflowTabHierarchy, operationId: number | undefined) => void
	title?: ParseKeys
}) => {
	const { t } = useTranslation();

	return (
		<div className="obj tbl-container">
			<header>
				{t(title ?? "EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TITLE")}
			</header>
			<div className="obj-container">
				<WorfklowOperationsTableBody
					operations={operations}
					openSubTab={openSubTab}
				/>
			</div>
		</div>
	);
};

export const WorfklowOperationsTableBody = ({
	operations,
	openSubTab,
}: {
	operations: {
		operation: WorkflowOperation
		operationId: number
	}[]
	openSubTab: (tab: WorkflowTabHierarchy, operationId: number | undefined) => void
}) => {
	const { t } = useTranslation();

	return (
		<table className="main-tbl">
			<thead>
				<tr>
					<th>
						{t("EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TABLE_HEADERS.STATUS") /* Status */}
					</th>
					<th>
						{t("EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TABLE_HEADERS.TITLE") /* Title */}
					</th>
					<th>
						{t("EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TABLE_HEADERS.DESCRIPTION") /* Description */}
					</th>
					<th className="medium" />
				</tr>
			</thead>
			<tbody>
				{/* workflow operation details */}
				{operations.map((item, key) => (
					<Operation
						key={key}
						operationId={item.operationId}
						item={item.operation}
						openSubTab={openSubTab}
					/>
				))}
			</tbody>
		</table>
	);
};

export const Operation = ({
	operationId,
	item,
	openSubTab,
}: {
	operationId: number,
	item: WorkflowOperation,
	openSubTab: (tab: WorkflowTabHierarchy, operationId: number | undefined) => void,
}) => {
	const { t } = useTranslation();

	return (
		<tr>
			<td style={{ display: "flex", alignItems: "center" }}>
				<OperationStatusIcon status={item.status} />
				{t(item.status as ParseKeys)}
			</td>
			<td>{item.title}</td>
			<td>{item.description}</td>

			{/* link to 'Operation Details'  sub-Tab */}
			<td>
				<ButtonLikeAnchor
					extraClassName="details-link"
					onClick={() =>
						openSubTab("workflow-operation-details", operationId)
					}
				>
					{t("EVENTS.EVENTS.DETAILS.MEDIA.DETAILS") /* Details */}
				</ButtonLikeAnchor>
			</td>
		</tr>
	);
};

const OperationStatusIcon = ({
	status,
}: {
	status: string
}) => {
	// Parse translation key to state
	const state = status.split(".").pop();

	const iconStyle = { marginRight: "5px" };

	switch (state) {
		case "INSTANTIATED":
			return <LuEllipsis style={{ ...iconStyle, color: "#666" }}/>;
		case "RUNNING":
			return <LuLoader className="fa-spin" style={{ ...iconStyle, color: "#666" }}/>;
		case "PAUSED":
			return <LuPause style={{ ...iconStyle, color: "#666" }}/>;
		case "SUCCEEDED":
			return <LuCheck style={{ ...iconStyle, color: "#37c180" }}/>;
		case "FAILED":
			return <LuX style={{ ...iconStyle, color: "#fa1919" }}/>;
		case "SKIPPED":
			return <GoDash style={{ ...iconStyle, color: "#378dd4" }}/>;
		case "RETRY":
			return <LuRotateCcw className="fa-spin" style={{ ...iconStyle, color: "#666" }}/>;
		default:
			return <></>;
	}
};

export default EventDetailsWorkflowOperations;
