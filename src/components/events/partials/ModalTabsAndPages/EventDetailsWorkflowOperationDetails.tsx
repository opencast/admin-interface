import Notifications from "../../../shared/Notifications";
import {
	getWorkflowOperationDetails,
	isFetchingWorkflowOperationDetails,
} from "../../../../selectors/eventDetailsSelectors";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { renderValidDate } from "../../../../utils/dateUtils";
import { useTranslation } from "react-i18next";
import { setModalWorkflowTabHierarchy } from "../../../../slices/eventDetailsSlice";
import { WorkflowTabHierarchy } from "../modals/EventDetails";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the workflow operation details for the workflows tab of the event details modal
 */
const EventDetailsWorkflowOperationDetails = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const operationDetails = useAppSelector(state => getWorkflowOperationDetails(state));
	const isFetching = useAppSelector(state => isFetchingWorkflowOperationDetails(state));

	const openSubTab = (tabType: WorkflowTabHierarchy) => {
		dispatch(removeNotificationWizardForm());
		dispatch(setModalWorkflowTabHierarchy(tabType));
	};

	return (
		<ModalContentTable
			modalContentChildren={
				/* Hierarchy navigation */
			<EventDetailsTabHierarchyNavigation
				openSubTab={openSubTab}
				hierarchyDepth={3}
				translationKey0={"EVENTS.EVENTS.DETAILS.WORKFLOW_INSTANCES.TITLE"}
				subTabArgument0={"workflows"}
				translationKey1={"EVENTS.EVENTS.DETAILS.WORKFLOW_DETAILS.TITLE"}
				subTabArgument1={"workflow-details"}
				translationKey2={"EVENTS.EVENTS.DETAILS.WORKFLOW_OPERATIONS.TITLE"}
				subTabArgument2={"workflow-operations"}
				translationKey3={"EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TITLE"}
				subTabArgument3={"workflow-operation-details"}
			/>
			}
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* 'Operation Details' table */}
			<div className="obj tbl-details">
				<header>
					{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TITLE") /* Operation Details */}
				</header>
				<div className="obj-container">
					<table className="main-tbl">
						{isFetching || (
							<tbody>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.TITLE") /* Title */}
									</td>
									<td>{operationDetails.name}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.DESCRIPTION") /* Description */}
									</td>
									<td>{operationDetails.description}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.STATE") /* State */}
									</td>
									<td>{t(operationDetails.state as ParseKeys)}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.EXECUTION_HOST") /* Execution Host */}
									</td>
									<td>{operationDetails.executionHost}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.JOB") /* Job */}
									</td>
									<td>{operationDetails.job}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.TIME_IN_QUEUE") /* Time in Queue */}
									</td>
									<td>{operationDetails.timeInQueue}ms</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.STARTED") /* Started */}
									</td>
									<td>
										{t("dateFormats.dateTime.medium", {
											dateTime: renderValidDate(operationDetails.started),
										})}
									</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.FINISHED") /* Finished */}
									</td>
									<td>
										{t("dateFormats.dateTime.medium", {
											dateTime: renderValidDate(operationDetails.completed),
										})}
									</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.RETRY_STRATEGY") /* Retry Strategy */}
									</td>
									<td>{operationDetails.retryStrategy}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.FAILED_ATTEMPTS") /* Failed Attempts */}
									</td>
									<td>{operationDetails.failedAttempts}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.MAX_ATTEMPTS") /* Max */}
									</td>
									<td>{operationDetails.maxAttempts}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.EXCEPTION_HANDLER_WORKFLOW") /* Exception Handler Workflow */}
									</td>
									<td>{operationDetails.exceptionHandlerWorkflow}</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.DETAILS.OPERATION_DETAILS.TABLE_HEADERS.FAIL_ON_ERROR") /* Fail on Error */}
									</td>
									<td>{operationDetails.failOnError}</td>
								</tr>
							</tbody>
						)}
					</table>
				</div>
			</div>
		</ModalContentTable>
	);
};

export default EventDetailsWorkflowOperationDetails;
