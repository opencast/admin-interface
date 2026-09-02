import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import RenderWorkflowConfig from "../wizards/RenderWorkflowConfig";
import { getWorkflowDef } from "../../../../selectors/workflowSelectors";
import { setDefaultValues } from "../../../../utils/workflowPanelUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchWorkflowDef } from "../../../../slices/workflowSlice";
import { FormikProps } from "formik";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import RenderWorkflowSelect from "../wizards/RenderWorkflowSelect";

/**
 * This component renders the workflow selection for start task bulk action
 */
interface RequiredFormProps {
	workflowId: string,
	configuration?: { [key: string]: unknown } // For RenderWorkflowConfig
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
	const workflowDefinitions = useAppSelector(state => getWorkflowDef(state));

	useEffect(() => {
		// Load workflow definitions for selecting
		dispatch(fetchWorkflowDef("tasks"));
	}, [dispatch]);

	// Preselect the first item
	useEffect(() => {
		if (workflowDefinitions.length === 1) {
			setDefaultValues(formik, workflowDefinitions, workflowDefinitions[0].id);
		}
	// We only care to set default values if workflowDef changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowDefinitions]);

	return (
		<>
			<ModalContentTable>
				{/* Workflow definition Selection*/}
				<div className="obj list-obj">
					<header>{t("BULK_ACTIONS.SCHEDULE_TASK.TASKS.SELECT")}</header>
					<div className="obj-container">
						<RenderWorkflowSelect
							formik={formik}
							workflowDefinitions={workflowDefinitions}
						/>

						{formik.values.workflowId && (
							<>
								{/* Configuration panel of selected workflow */}
								<div
									id="new-event-workflow-configuration"
									className="checkbox-container obj-container"
								>
									<RenderWorkflowConfig
										displayDescription
										workflowId={formik.values.workflowId}
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
				customValidation={!(formik.values.workflowId && formik.isValid)}
			/>
		</>
	);
};

export default StartTaskWorkflowPage;
