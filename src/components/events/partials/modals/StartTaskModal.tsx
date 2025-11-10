import { useEffect } from "react";
import { Formik } from "formik";
import { initialFormValuesStartTask } from "../../../../configs/modalConfig";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import StartTaskGeneralPage from "../ModalTabsAndPages/StartTaskGeneralPage";
import StartTaskWorkflowPage from "../ModalTabsAndPages/StartTaskWorkflowPage";
import StartTaskSummaryPage from "../ModalTabsAndPages/StartTaskSummaryPage";
import { postTasks } from "../../../../thunks/taskThunks";
import { changeAllSelected } from "../../../../thunks/tableThunks";
import { usePageFunctions } from "../../../../hooks/wizardHooks";
import { checkValidityStartTaskEventSelection } from "../../../../utils/bulkActionUtils";
import { useAppDispatch } from "../../../../store";
import { Event } from "../../../../slices/eventSlice";

/**
 * This component manages the pages of the task start bulk action
 */
const StartTaskModal = ({
	close,
}: {
	close: () => void,
}) => {
	const dispatch = useAppDispatch();

	const initialValues = initialFormValuesStartTask;

	const {
		page,
		nextPage,
		previousPage,
		setPage,
		pageCompleted,
		setPageCompleted,
	} = usePageFunctions(0);

	type StepName = "general" | "tasks" | "summary";
	type Step = WizardStep & {
		name: StepName,
	}

	const steps: Step[] = [
		{
			translation: "BULK_ACTIONS.SCHEDULE_TASK.GENERAL.CAPTION",
			name: "general",
		},
		{
			translation: "BULK_ACTIONS.SCHEDULE_TASK.TASKS.CAPTION",
			name: "tasks",
		},
		{
			translation: "BULK_ACTIONS.SCHEDULE_TASK.SUMMARY.CAPTION",
			name: "summary",
		},
	];

	const validateFormik = (values: {
		events: Event[],
		workflow: string,
	}) => {
		const errors: {
			events?: string,
			workflow?: string,
		} = {};
		if (!checkValidityStartTaskEventSelection(values)) {
			errors.events = "Not on all events task startable!";
		}
		if (
			steps[page].name !== "general" &&
			!(
				!!values.workflow &&
				values.workflow !== ""
			)
		) {
			errors.workflow = "Workflow not selected!";
		}
		return errors;
	};

	const handleSubmit = (values: typeof initialValues) => {
		dispatch(postTasks(values));
		dispatch(changeAllSelected(false));
		close();
	};

	return (
		<>
			{/* Initialize overall form */}
			<Formik
				initialValues={initialValues}
				validate={values => validateFormik(values)}
				onSubmit={values => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{formik => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm().then();
					// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [page]);

					return (
						<>
							{/* Stepper that shows each step of wizard as header */}
							<WizardStepper
								steps={steps}
								activePageIndex={page}
								setActivePage={setPage}
								completed={pageCompleted}
								setCompleted={setPageCompleted}
								isValid={formik.isValid}
							/>
							<div>
								{steps[page].name === "general" && (
									<StartTaskGeneralPage
										formik={formik}
										nextPage={nextPage}
									/>
								)}
								{steps[page].name === "tasks" && (
									<StartTaskWorkflowPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
										setPageCompleted={setPageCompleted}
									/>
								)}
								{steps[page].name === "summary" && (
									<StartTaskSummaryPage
										formik={formik}
										previousPage={previousPage}
									/>
								)}
							</div>
						</>
					);
				}}
			</Formik>
		</>
	);
};

export default StartTaskModal;
