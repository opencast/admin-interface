import React, { useEffect } from "react";
import { Formik, FormikProps } from "formik";
import {
	deletingWorkflow as getDeletingWorkflow,
	getBaseWorkflow,
	getWorkflow,
	getWorkflowConfiguration,
	getWorkflowDefinitions,
	isFetchingWorkflows,
	performingWorkflowAction as getPerformingWorkflowAction,
	getWorkflowsSortedByDate,
} from "../../../../selectors/eventDetailsSelectors";
import Notifications from "../../../shared/Notifications";
import RenderWorkflowConfig from "../wizards/RenderWorkflowConfig";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess, parseBooleanInObject } from "../../../../utils/utils";
import DropDown from "../../../shared/DropDown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	deleteWorkflow as deleteWf,
	fetchWorkflows,
	performWorkflowAction,
	saveWorkflowConfig,
	setModalWorkflowId,
	setModalWorkflowTabHierarchy,
} from "../../../../slices/eventDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { renderValidDate } from "../../../../utils/dateUtils";
import { WorkflowTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { formatWorkflowsForDropdown } from "../../../../utils/dropDownUtils";
import { ParseKeys } from "i18next";
import ModalContent from "../../../shared/modals/ModalContent";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import { LuChevronRight, LuCircleStop, LuCircleX, LuHand, LuRefreshCw } from "react-icons/lu";

type InitialValues = {
	workflowDefinition: string;
	configuration: {
			[key: string]: any;
	} | undefined;
}

/**
 * This component manages the workflows tab of the event details modal
 */
const EventDetailsWorkflowTab = ({
	eventId,
	formikRef,
}: {
	eventId: string,
	formikRef?: React.RefObject<FormikProps<InitialValues> | null>
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));
	const deletingWorkflow = useAppSelector(state => getDeletingWorkflow(state));
	const baseWorkflow = useAppSelector(state => getBaseWorkflow(state));
	const workflow = useAppSelector(state => getWorkflow(state));
	const workflowConfiguration = useAppSelector(state => getWorkflowConfiguration(state));
	const workflowDefinitions = useAppSelector(state => getWorkflowDefinitions(state));
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

	const hasCurrentAgentAccess = () => {
		// todo
		return true;
	};

	const setInitialValues = () => {
		let initialConfig = undefined;

		if (baseWorkflow.configuration) {
			initialConfig = parseBooleanInObject(baseWorkflow.configuration);
		}

		return {
			workflowDefinition: "workflowId" in workflow && !!workflow.workflowId
				? workflow.workflowId
				: baseWorkflow.workflowId,
			configuration: initialConfig,
		};
	};

	const handleSubmit = (values: {
		workflowDefinition: string,
		configuration: { [key: string]: unknown } | undefined
	}) => {
		dispatch(saveWorkflowConfig({ values, eventId }));
	};

	return (
		<ModalContent
			data-modal-tab-content="workflows"
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
												<th className="fit">
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
													<td>{item.submitter}</td>
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
																	className="stop"
																	tooltipText="EVENTS.EVENTS.DETAILS.WORKFLOWS.TOOLTIP.STOP"
																>
																	{/* STOP */}
																	<LuCircleStop style={{ fontSize: "17px", verticalAlign: "middle" }}/>
																</ButtonLikeAnchor>
															)}
															{item.status ===
																"EVENTS.EVENTS.DETAILS.WORKFLOWS.OPERATION_STATUS.PAUSED" && (
																<ButtonLikeAnchor
																	onClick={() =>
																		workflowAction(item.id, "NONE")
																	}
																	style={{ color: "red" }}
																	tooltipText="EVENTS.EVENTS.DETAILS.WORKFLOWS.TOOLTIP.ABORT"
																>
																	{/* Abort */}
																	<LuHand style={{ fontSize: "17px", verticalAlign: "middle" }}/>
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
																	<LuRefreshCw style={{ fontSize: "17px", verticalAlign: "middle", color: "#444" }}/>
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

					{workflows.scheduling &&
						(isLoading || (
							<Formik<InitialValues>
								initialValues={setInitialValues()}
								enableReinitialize
								onSubmit={values => handleSubmit(values)}
								innerRef={formikRef}
							>
								{formik => (
									<div className="obj list-obj">
										<header>
											{t("EVENTS.EVENTS.DETAILS.WORKFLOW_DETAILS.CONFIGURATION") /* Workflow configuration */}
										</header>
										<div className="obj-container">
											<div className="obj list-obj quick-actions">
												<table className="main-tbl">
													<thead>
														<tr>
															<th>
																{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.WORKFLOW") /* Select Workflow */}
															</th>
														</tr>
													</thead>

													<tbody>
														<tr>
															<td>
																<div className="obj-container padded">
																	<div className="editable">
																		<DropDown
																			value={
																				formik.values.workflowDefinition
																			}
																			text={
																				workflowDefinitions.find(
																					workflowDef =>
																						workflowDef.id ===
																						formik.values.workflowDefinition,
																				)?.title ?? ""
																			}
																			options={
																				!!workflowDefinitions &&
																				workflowDefinitions.length > 0
																					? formatWorkflowsForDropdown(workflowDefinitions)
																					: []
																			}
																			required={true}
																			handleChange={element => {
																				if (element) {
																					formik.setFieldValue("workflowDefinition", element.value);
																				}
																			}}
																			placeholder={
																				!!workflowDefinitions &&
																				workflowDefinitions.length > 0
																					? t(
																							"EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW",
																						)
																					: t(
																							"EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW_EMPTY",
																						)
																			}
																			disabled={
																				!hasCurrentAgentAccess() ||
																				!isRoleWorkflowEdit
																			}
																			customCSS={{ width: "100%" }}
																		/>
																		{/* pre-select-from="workflowDefinitionIds" */}
																	</div>
																	<div className="obj-container padded">
																		{workflow.description}
																	</div>
																</div>
															</td>
														</tr>
													</tbody>
												</table>
											</div>

											<div className="obj list-obj quick-actions">
												<table className="main-tbl">
													<thead>
														<tr>
															<th>
																{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.CONFIGURATION") /* Configuration */}
															</th>
														</tr>
													</thead>

													<tbody>
														<tr>
															<td>
																<div className="obj-container padded">
																	{hasCurrentAgentAccess() &&
																		isRoleWorkflowEdit &&
																		!!workflowConfiguration &&
																		!!workflowConfiguration.workflowId && (
																			<div
																				id="event-workflow-configuration"
																				className="checkbox-container obj-container"
																			>
																				<RenderWorkflowConfig
																					workflowId={
																						workflowConfiguration.workflowId
																					}
																					formik={formik}
																				/>
																			</div>
																		)}
																	{(!!workflowConfiguration &&
																		!!workflowConfiguration.workflowId) || (
																		<div>
																			{t("EVENTS.EVENTS.DETAILS.WORKFLOWS.NO_CONFIGURATION") /* No config */}
																		</div>
																	)}
																</div>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>

										{/* Save and cancel buttons */}
										{hasCurrentAgentAccess() &&
											isRoleWorkflowEdit &&
											!!workflowConfiguration &&
											!!workflowConfiguration.workflowId &&
											formik.dirty && (
												<footer style={{ padding: "0 15px" }}>
													<div className="pull-left">
														<button
															type="reset"
															onClick={() => {
																formik.resetForm();
															}}
															disabled={!formik.isValid}
															className={`cancel  ${
																!formik.isValid ? "disabled" : ""
															}`}
														>
															{t("CANCEL") /* Cancel */}
														</button>
													</div>
													<div>
														<button
															onClick={() => formik.handleSubmit()}
															disabled={!(formik.dirty && formik.isValid)}
															aria-disabled={!(formik.dirty && formik.isValid)}
															className={`save green  ${
																!(formik.dirty && formik.isValid)
																	? "disabled"
																	: ""
															}`}
														>
															{t("SAVE") /* Save */}
														</button>
													</div>
												</footer>
											)}
									</div>
								)}
							</Formik>
						))}
				</li>
			</ul>
		</ModalContent>
	);
};

export default EventDetailsWorkflowTab;
