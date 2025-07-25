import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getWorkflowDef } from "../../../../selectors/workflowSelectors";
import RenderWorkflowConfig from "../wizards/RenderWorkflowConfig";
import { setDefaultConfig } from "../../../../utils/workflowPanelUtils";
import DropDown from "../../../shared/DropDown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchWorkflowDef } from "../../../../slices/workflowSlice";
import { FormikProps } from "formik";
import { formatWorkflowsForDropdown } from "../../../../utils/dropDownUtils";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the processing page for new events in the new event wizard.
 */
interface RequiredFormProps {
	sourceMode: string,
	processingWorkflow: string,
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

	const workflowDef = useAppSelector(state => getWorkflowDef(state));

	useEffect(() => {
		// Load workflow definitions for selecting
		dispatch(fetchWorkflowDef("default"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Preselect the first item
	useEffect(() => {
		if (workflowDef.length === 1) {
			setDefaultValues(workflowDef[0].id);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workflowDef]);

	const previous = () => {
		// if not UPLOAD is chosen as source mode, then back to source page
		if (formik.values.sourceMode !== "UPLOAD") {
			previousPage(formik.values, true);
		} else {
			previousPage(formik.values, false);
		}
	};

	const setDefaultValues = (value: string) => {
		const workflowId = value;
		// fill values with default configuration of chosen workflow
		const defaultConfiguration = setDefaultConfig(workflowDef, workflowId);

		// set default configuration in formik
		formik.setFieldValue("configuration", defaultConfiguration);
		// set chosen workflow in formik
		formik.setFieldValue("processingWorkflow", workflowId);
	};

	return (
		<>
			<ModalContentTable>
				{/* Workflow definition Selection*/}
				<div className="obj quick-actions">
					<header className="no-expand">
						{t("EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW")}
					</header>
					<div className="obj-container padded">
						{workflowDef.length > 0 ? (
							<div className="editable">
								<DropDown
									value={formik.values.processingWorkflow}
									text={
										workflowDef.find(
											workflow =>
												formik.values.processingWorkflow === workflow.id,
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
										"EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW",
									)}
									customCSS={{ width: "100%" }}
								/>
							</div>
						) : (
							<span>
								{t("EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW_EMPTY")}
							</span>
						)}

						{/* Configuration panel of selected workflow */}
						<div className="collapsible-box">
							<div
								id="new-event-workflow-configuration"
								className="checkbox-container obj-container"
							>
								{formik.values.processingWorkflow ? (
									<RenderWorkflowConfig
										displayDescription
										workflowId={formik.values.processingWorkflow}
										// @ts-expect-error TS(7006):
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
