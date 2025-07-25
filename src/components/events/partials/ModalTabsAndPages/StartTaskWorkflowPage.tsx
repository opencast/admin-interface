import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import RenderWorkflowConfig from "../wizards/RenderWorkflowConfig";
import { getWorkflowDef } from "../../../../selectors/workflowSelectors";
import { setDefaultConfig } from "../../../../utils/workflowPanelUtils";
import DropDown from "../../../shared/DropDown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchWorkflowDef } from "../../../../slices/workflowSlice";
import { FormikProps } from "formik";
import { formatWorkflowsForDropdown } from "../../../../utils/dropDownUtils";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the workflow selection for start task bulk action
 */
interface RequiredFormProps {
	workflow: string,
}

const StartTaskWorkflowPage = <T extends RequiredFormProps>({
	formik,
	previousPage,
	nextPage,
	setPageCompleted,
} : {
	formik: FormikProps<T>,
	previousPage: (values: T) => void,
	nextPage: (values: T) => void,
	setPageCompleted: (rec: Record<number, boolean>) => void,
}) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();
	const workflowDef = useAppSelector(state => getWorkflowDef(state));

	useEffect(() => {
		// Load workflow definitions for selecting
		dispatch(fetchWorkflowDef("tasks"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Preselect the first item
	useEffect(() => {
		if (workflowDef.length === 1) {
			setDefaultValues(workflowDef[0].id);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowDef]);

	const setDefaultValues = (value: string) => {
		const workflowId = value;
		// fill values with default configuration of chosen workflow
		const defaultConfiguration = setDefaultConfig(workflowDef, workflowId);

		// set default configuration in formik
		formik.setFieldValue("configuration", defaultConfiguration);
		// set chosen workflow in formik
		formik.setFieldValue("workflow", workflowId);
	};

	return (
		<>
			<ModalContentTable>
				{/* Workflow definition Selection*/}
				<div className="obj list-obj">
					<header>{t("BULK_ACTIONS.SCHEDULE_TASK.TASKS.SELECT")}</header>
					<div className="obj-container">
						{workflowDef.length > 0 && (
							<div className="editable">
								<DropDown
									value={formik.values.workflow}
									text={
										workflowDef.find(
											workflowDef =>
												workflowDef.id === formik.values.workflow,
										)?.title ?? ""
									}
									options={formatWorkflowsForDropdown(workflowDef)}
									required={true}
									handleChange={element => {
										if (element) {
											setDefaultValues(element.value);
										}
									}}
									placeholder={t(
										"EVENTS.EVENTS.DETAILS.PUBLICATIONS.SELECT_WORKFLOW",
									)}
									tabIndex={99}
									customCSS={{ width: "100%" }}
								/>
							</div>
						)}
						{formik.values.workflow && (
							<>
								{/* Configuration panel of selected workflow */}
								<div
									id="new-event-workflow-configuration"
									className="checkbox-container obj-container"
								>
									<RenderWorkflowConfig
										displayDescription
										workflowId={formik.values.workflow}
										// @ts-expect-error TS(7006):
										formik={formik}
									/>
								</div>
							</>
						)}
					</div>
				</div>
			</ModalContentTable>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={nextPage}
				previousPage={() => {
					previousPage(formik.values);
					if (!formik.isValid) {
						// set page as not filled out
						setPageCompleted([]);
					}
				}}
				customValidation={!(formik.values.workflow && formik.isValid)}
			/>
		</>
	);
};

export default StartTaskWorkflowPage;
