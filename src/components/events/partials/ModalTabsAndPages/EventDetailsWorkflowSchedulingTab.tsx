import React, { useEffect } from "react";
import { Formik, FormikProps } from "formik";
import {
	getBaseWorkflow,
	getWorkflow,
	getWorkflowConfiguration,
	getWorkflowDefinitions,
	isFetchingWorkflows,
} from "../../../../selectors/eventDetailsSelectors";
import Notifications from "../../../shared/Notifications";
import RenderWorkflowConfig from "../wizards/RenderWorkflowConfig";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess, parseBooleanInObject } from "../../../../utils/utils";
import DropDown from "../../../shared/DropDown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	fetchWorkflows,
	saveWorkflowConfig,
} from "../../../../slices/eventDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useTranslation } from "react-i18next";
import { formatWorkflowsForDropdown } from "../../../../utils/dropDownUtils";
import ModalContent from "../../../shared/modals/ModalContent";

type InitialValues = {
	workflowDefinition: string;
	configuration: {
			[key: string]: any;
	} | undefined;
}

/**
 * This component manages the workflows tab of the event details modal
 */
const EventDetailsWorkflowSchedulingTab = ({
	eventId,
	formikRef,
}: {
	eventId: string,
	formikRef?: React.RefObject<FormikProps<InitialValues> | null>
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));
	const baseWorkflow = useAppSelector(state => getBaseWorkflow(state));
	const workflow = useAppSelector(state => getWorkflow(state));
	const workflowConfiguration = useAppSelector(state => getWorkflowConfiguration(state));
	const workflowDefinitions = useAppSelector(state => getWorkflowDefinitions(state));
	const isLoading = useAppSelector(state => isFetchingWorkflows(state));

	const isRoleWorkflowEdit = hasAccess(
		"ROLE_UI_EVENTS_DETAILS_WORKFLOWS_EDIT",
		user,
	);

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		dispatch(fetchWorkflows(eventId)).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
		<ModalContent>
			{/* Notifications */}
			<Notifications context="not_corner" />

			{(isLoading || (
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
									<footer>
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
									</footer>
								)}
						</div>
					)}
				</Formik>
			))}
		</ModalContent>
	);
};

export default EventDetailsWorkflowSchedulingTab;
