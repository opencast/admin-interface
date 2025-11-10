import { useEffect, useState } from "react";
import { Formik } from "formik";
import { initialFormValuesEditScheduledEvents } from "../../../../configs/modalConfig";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import EditScheduledEventsGeneralPage from "../ModalTabsAndPages/EditScheduledEventsGeneralPage";
import EditScheduledEventsEditPage from "../ModalTabsAndPages/EditScheduledEventsEditPage";
import EditScheduledEventsSummaryPage from "../ModalTabsAndPages/EditScheduledEventsSummaryPage";
import { usePageFunctions } from "../../../../hooks/wizardHooks";
import { getRecordings } from "../../../../selectors/recordingSelectors";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { filterDevicesForAccess } from "../../../../utils/resourceUtils";
import {
	checkSchedulingConflicts,
	checkValidityUpdateScheduleEventSelection,
} from "../../../../utils/bulkActionUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	EditedEvents,
	updateScheduledEventsBulk,
	Conflict,
} from "../../../../slices/eventSlice";
import { fetchRecordings } from "../../../../slices/recordingSlice";
import { Event } from "../../../../slices/eventSlice";

/**
 * This component manages the pages of the edit scheduled bulk action
 */
const EditScheduledEventsModal = ({
	close,
}: {
	close: () => void
}) => {
	const dispatch = useAppDispatch();

	const inputDevices = useAppSelector(state => getRecordings(state));

	const initialValues = initialFormValuesEditScheduledEvents;

	const {
		page,
		nextPage,
		previousPage,
		setPage,
		pageCompleted,
		setPageCompleted,
	} = usePageFunctions(0);

	// for edit page: conflicts with other events
	const [conflicts, setConflicts] = useState<Conflict[]>([]);

	const user = useAppSelector(state => getUserInformation(state));

	useEffect(() => {
		// Load recordings that can be used for input
		dispatch(fetchRecordings("inputs"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	type StepName = "general" | "edit" | "summary";
	type Step = WizardStep & {
		name: StepName,
	}

	const steps: Step[] = [
		{
			translation: "BULK_ACTIONS.EDIT_EVENTS.GENERAL.CAPTION",
			name: "general",
		},
		{
			translation: "BULK_ACTIONS.EDIT_EVENTS.EDIT.CAPTION",
			name: "edit",
		},
		{
			translation: "BULK_ACTIONS.EDIT_EVENTS.SUMMARY.CAPTION",
			name: "summary",
		},
	];

	const validateFormik = (values: {
		events: Event[],
		editedEvents: EditedEvents[],
	}) => {
		const errors: {
			events?: string,
			editedEvents?: string,
		} = {};
		if (!checkValidityUpdateScheduleEventSelection(values, user)) {
			errors.events = "Not all events editable!";
		}
		if (steps[page].name !== "general") {
			const isConflict = checkSchedulingConflicts(
				values,
				setConflicts,
				dispatch,
			);
			if (!isConflict) {
				errors.editedEvents = "Scheduling conflicts exist!";
			}
			return errors;
		} else {
			return errors;
		}
	};

	const handleSubmit = (values: {
		events: Event[];
		editedEvents: EditedEvents[];
		changedEvents: string[];
	}) => {
		// Only update events if there are changes
		if (values.changedEvents.length > 0) {
			const response = dispatch(updateScheduledEventsBulk(values));
			console.info(response);
		}
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
									<EditScheduledEventsGeneralPage
										formik={formik}
										nextPage={nextPage}
									/>
								)}
								{steps[page].name === "edit" && (
									<EditScheduledEventsEditPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
										conflictState={{ conflicts, setConflicts }}
										inputDevices={filterDevicesForAccess(user, inputDevices)}
										setPageCompleted={setPageCompleted}
									/>
								)}
								{steps[page].name === "summary" && (
									<EditScheduledEventsSummaryPage
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

export default EditScheduledEventsModal;
