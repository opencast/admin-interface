import Notifications from "../../../shared/Notifications";
import {
	getModalWorkflowId,
	getWorkflowByJobId,
	getWorkflowErrorDetails,
	isFetchingWorkflowErrorDetails,
} from "../../../../selectors/eventDetailsSelectors";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { renderValidDate } from "../../../../utils/dateUtils";
import { WorkflowTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import { fetchWorkflowOperationDetails, setModalWorkflowTabHierarchy } from "../../../../slices/eventDetailsSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import { WorkflowOperationsTable } from "./EventDetailsWorkflowOperations";

/**
 * This component manages the workflow error details for the workflows tab of the event details modal
 */
const EventDetailsWorkflowErrorDetails = ({
	eventId,
}: {
	eventId: string
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const errorDetails = useAppSelector(state => getWorkflowErrorDetails(state));
	const isFetching = useAppSelector(state => isFetchingWorkflowErrorDetails(state));
	const operationsEntry = useAppSelector(state => getWorkflowByJobId(state, errorDetails.rootJobId ?? errorDetails.jobId, errorDetails.jobId));
	const workflowId = useAppSelector(state => getModalWorkflowId(state));

	const openSubTab = (tabType: WorkflowTabHierarchy) => {
		dispatch(removeNotificationWizardForm());
		dispatch(setModalWorkflowTabHierarchy(tabType));
	};

	const openOperationDetailsSubTab = (tabType: WorkflowTabHierarchy, operationId: number | undefined = undefined) => {
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
				translationKey2={"EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.HEADER"}
				subTabArgument2={"workflow-error-details"}
			/>
			}
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* Error operation table */}
			<WorkflowOperationsTable
				operations={operationsEntry
					? [{ operation: operationsEntry.operation, operationId: operationsEntry.index }]
					: []
				}
				openSubTab={openOperationDetailsSubTab}
				title={"EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.OPERATION"}
			/>

			{/* 'Error Details' table */}
			<div className="obj tbl-details">
				<header>
					{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.HEADER") /* Error Details */}
				</header>
				<div className="obj-container">
					<table className="main-tbl">
						{isFetching || (
							<tbody>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.SEVERITY") /* Severity */}
									</td>
									<td>{errorDetails.severity}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.TITLE") /* Title */}
									</td>
									<td>{errorDetails.title}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.DESCRIPTION") /* Description */}
									</td>
									<td>{errorDetails.description}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.JOB_ID") /* Job ID */}
									</td>
									<td>{errorDetails.jobId}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.DATE") /* Date */}
									</td>
									<td>
										{t("dateFormats.dateTime.medium", {
											dateTime: renderValidDate(errorDetails.timestamp),
										})}
									</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.HOST") /* Host */}
									</td>
									<td>{errorDetails.processingHost}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.TYPE") /* Type */}
									</td>
									<td>{errorDetails.serviceType}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.ERRORS_AND_WARNINGS.DETAILS.TECHNICAL_DETAILS") /* Technical Details */}
									</td>

									{/* list of technical error details */}
									<td>
										{errorDetails.details.map((item, key) => (
											<div key={key}>
												<h3>{item.name}</h3>
												<div className="workflow-error-details">
													<pre>{item.value}</pre>
												</div>
											</div>
										))}
									</td>
								</tr>
							</tbody>
						)}
					</table>
				</div>
			</div>
		</ModalContentTable>
	);
};

export default EventDetailsWorkflowErrorDetails;
