import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getWorkflowDef } from "../../../../selectors/workflowSelectors";
import RenderWorkflowConfig from "../wizards/RenderWorkflowConfig";
import { setDefaultValues } from "../../../../utils/workflowPanelUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchWorkflowDef } from "../../../../slices/workflowSlice";
import { FormikProps } from "formik";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import RenderWorkflowSelect from "../wizards/RenderWorkflowSelect";

/**
 * This component renders the processing page for new events in the new event wizard.
 */
interface RequiredFormProps {
	sourceMode: string,
	workflowId: string,
	configuration?: { [key: string]: unknown } // For RenderWorkflowConfig
}

const NewProcessingPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const workflowDefinitions = useAppSelector(state => getWorkflowDef(state));

	useEffect(() => {
		// Load workflow definitions for selecting
		if (formik.values.sourceMode !== "UPLOAD") {
			dispatch(fetchWorkflowDef("new-event-schedule"));
		} else {
			dispatch(fetchWorkflowDef("new-event-upload"));
		}
	}, [dispatch, formik.values.sourceMode]);

	// Preselect the first item
	useEffect(() => {
		if (workflowDefinitions.length === 1) {
			setDefaultValues(formik, workflowDefinitions, workflowDefinitions[0].id);
		}
	// We only care to set default values if workflowDef changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowDefinitions]);

	const previous = () => {
		// if not UPLOAD is chosen as source mode, then back to source page
		if (formik.values.sourceMode !== "UPLOAD") {
			previousPage(formik.values, true);
		} else {
			previousPage(formik.values, false);
		}
	};

	return (
		<>
			<ModalContentTable>
				{/* Workflow definition Selection*/}
				<div className="obj quick-actions">
					<header>
						{t("EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW")}
					</header>
					<div className="obj-container padded">
						<RenderWorkflowSelect
							formik={formik}
							workflowDefinitions={workflowDefinitions}
						/>

						{/* Configuration panel of selected workflow */}
						<div className="collapsible-box">
							<div
								id="new-event-workflow-configuration"
								className="checkbox-container obj-container"
							>
								{formik.values.workflowId ? (
									<RenderWorkflowConfig
										displayDescription
										workflowId={formik.values.workflowId}
										formik={formik}
									/>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</ModalContentTable>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={nextPage}
				previousPage={() => previous()}
			/>
		</>
	);
};

export default NewProcessingPage;
