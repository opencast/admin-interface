import { useEffect } from "react";
import {
	deletingWorkflow as getDeletingWorkflow,
	isFetchingWorkflows,
	performingWorkflowAction as getPerformingWorkflowAction,
	getWorkflowsSortedByDate,
} from "../../../../selectors/eventDetailsSelectors";
import Notifications from "../../../shared/Notifications";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	deleteWorkflow as deleteWf,
	fetchWorkflows,
	performWorkflowAction,
	setModalWorkflowId,
	setModalWorkflowTabHierarchy,
} from "../../../../slices/eventDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { renderValidDate } from "../../../../utils/dateUtils";
import { WorkflowTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { ParseKeys } from "i18next";
import ModalContent from "../../../shared/modals/ModalContent";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import { LuChevronRight, LuCircleStop, LuCircleX, LuHand, LuRefreshCw } from "react-icons/lu";
import { Tooltip } from "../../../shared/Tooltip";

/**
 * This component manages the workflows tab of the event details modal
 */
const EventDetailsWorkflowTab = ({
	eventId,
}: {
	eventId: string,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));
	const deletingWorkflow = useAppSelector(state => getDeletingWorkflow(state));
	const workflows = useAppSelector(state => getWorkflowsSortedByDate(state));
	const isLoading = useAppSelector(state => isFetchingWorkflows(state));
	const performingWorkflowAction = useAppSelector(state => getPerformingWorkflowAction(state));

	const isRoleWorkflowEdit = hasAccess(
		"ROLE_UI_EVENTS_DETAILS_WORKFLOWS_EDIT",
		user,
	);
	const isRoleWorkflowDelete = hasAccess(
		"ROLE_UI_EVENTS_DETAILS_WORKFLOWS_DELETE",
		user,
	);

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		dispatch(fetchWorkflows(eventId)).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isCurrentWorkflow = (workflowId: string) => {
		const currentWorkflow = workflows.entries[workflows.entries.length - 1];
		return currentWorkflow.id === workflowId;
	};

	const workflowAction = (workflowId: string, action: string) => {
		if (!performingWorkflowAction) {
			dispatch(performWorkflowAction({ eventId, workflowId, action }));
		}
	};

	const deleteWorkflow = (workflowId: string) => {
		if (!deletingWorkflow) {
			dispatch(deleteWf({ eventId, workflowId }));
		}
	};

	const openThisTab = (subTabName: WorkflowTabHierarchy) => {
		dispatch(setModalWorkflowTabHierarchy(subTabName));
	};

	const openSubTab = (tabType: WorkflowTabHierarchy, workflowId: string) => {
		dispatch(setModalWorkflowId(workflowId));
		dispatch(setModalWorkflowTabHierarchy(tabType));
		dispatch(removeNotificationWizardForm());
	};

	return (
		<ModalContent
			modalContentChildren={
				/* Hierarchy navigation */
				<EventDetailsTabHierarchyNavigation
					openSubTab={openThisTab}
					hierarchyDepth={0}
					translationKey0={"EVENTS.EVENTS.DETAILS.WORKFLOW_INSTANCES.TITLE"}
					subTabArgument0={"workflows"}
				/>
			}
		>
			{/* Notifications */}
			<Notifications context="not_corner" />

			<ul>
				<li>
					{workflows.scheduling || (
						<div className="obj tbl-container">
							<header>
								{
									t(
										"EVENTS.EVENTS.DETAILS.WORKFLOW_INSTANCES.TITLE",
									) /* Workflow instances */
								}
							</header>
							<div className="obj-container">
								<table className="main-tbl">
									<thead>
										<tr>
											<th>
												{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.ID") /* ID */}
											</th>
											<th>
												{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.TITLE") /* Title */}
											</th>
											<th>
												{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.SUBMITTER") /* Submitter */}
											</th>
											<th>
												{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.SUBMITTED") /* Submitted */}
											</th>
											<th>
												{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.STATUS") /* Status */}
											</th>
											{isRoleWorkflowEdit && (
												<th>
													{
														t(
															"EVENTS.EVENTS.DETAILS.WORKFLOWS.ACTIONS",
														) /* Actions */
													}
												</th>
											)}
											<th className="medium" />
										</tr>
									</thead>
									<tbody>
										{isLoading ||
											workflows.entries.map((
												item,
												key, /* orderBy:'submitted':true track by $index" */
											) => (
												<tr key={key}>
													<td>{item.id}</td>
													<td>{item.title}</td>
													<td>
														<Tooltip title={item.submitterName}>
															<span>{item.submitter}</span>
														</Tooltip>
													</td>
													<td>
														{t("dateFormats.dateTime.medium", {
															dateTime: renderValidDate(item.submitted),
														})}
													</td>
													<td>{t(item.status as ParseKeys)}</td>
													{isRoleWorkflowEdit && (
														<td>
															{item.status ===
																"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.RUNNING" && (
																<ButtonLikeAnchor
																	onClick={() =>
																		workflowAction(item.id, "STOP")
																	}
																	tooltipText="EVENTS.EVENTS.DETAILS.WORKFLOWS.TOOLTIP.STOP"
																>
																	{/* STOP */}
																	<LuCircleStop className="workflow-control-icon grey"/>
																</ButtonLikeAnchor>
															)}
															{item.status ===
																"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.PAUSED" && (
																<ButtonLikeAnchor
																	onClick={() =>
																		workflowAction(item.id, "NONE")
																	}
																	tooltipText="EVENTS.EVENTS.DETAILS.WORKFLOWS.TOOLTIP.ABORT"
																>
																	{/* Abort */}
																	<LuHand className="workflow-control-icon red"/>
																</ButtonLikeAnchor>
															)}
															{item.status ===
																"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.PAUSED" && (
																<ButtonLikeAnchor
																	onClick={() =>
																		workflowAction(item.id, "RETRY")
																	}
																	tooltipText="EVENTS.EVENTS.DETAILS.WORKFLOWS.TOOLTIP.RETRY"
																>
																	{/* Retry */}
																	<LuRefreshCw className="workflow-control-icon darkgray"/>
																</ButtonLikeAnchor>
															)}
															{(item.status ===
																"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.SUCCEEDED" ||
																item.status ===
																	"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.FAILED" ||
																item.status ===
																	"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.STOPPED") &&
																!isCurrentWorkflow(item.id) &&
																isRoleWorkflowDelete && (
																	<ButtonLikeAnchor
																		onClick={() => deleteWorkflow(item.id)}
																		className="action-cell-button remove"
																		tooltipText="EVENTS.EVENTS.DETAILS.WORKFLOWS.TOOLTIP.DELETE"
																	>
																		{/* DELETE */}
																		<LuCircleX />
																	</ButtonLikeAnchor>
																)}
														</td>
													)}
													<td>
														<ButtonLikeAnchor
															className="details-link"
															onClick={() =>
																openSubTab("workflow-details", item.id)
															}
														>
															{
																t(
																	"EVENTS.EVENTS.DETAILS.MEDIA.DETAILS",
																) /* Details */
															}
															<LuChevronRight className="details-link-icon"/>
														</ButtonLikeAnchor>
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</li>
			</ul>
		</ModalContent>
	);
};

export default EventDetailsWorkflowTab;
