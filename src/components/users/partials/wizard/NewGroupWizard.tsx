import React, { useEffect } from "react";
import { Formik } from "formik";
import { initialFormValuesNewGroup } from "../../../../configs/modalConfig";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import GroupMetadataPage from "./GroupMetadataPage";
import GroupRolesPage from "./GroupRolesPage";
import GroupUsersPage from "./GroupUsersPage";
import NewGroupSummaryPage from "./NewGroupSummaryPage";
import { usePageFunctions } from "../../../../hooks/wizardHooks";
import { NewGroupSchema } from "../../../../utils/validate";
import { useAppDispatch } from "../../../../store";
import { postNewGroup } from "../../../../slices/groupSlice";

/**
 * This component renders the new group wizard
 */
const NewGroupWizard: React.FC<{
	close: () => void
}> = ({
	close,
}) => {
	const dispatch = useAppDispatch();

	const initialValues = initialFormValuesNewGroup;

	const {
		page,
		nextPage,
		previousPage,
		setPage,
		pageCompleted,
		setPageCompleted,
	} = usePageFunctions(0);

	type StepName = "metadata" | "roles" | "users" | "summary";
	type Step = WizardStep & {
		name: StepName,
	}

	// Caption of steps used by Stepper
	const steps: Step[] = [
		{
			translation: "USERS.GROUPS.DETAILS.TABS.METADATA",
			name: "metadata",
		},
		{
			translation: "USERS.GROUPS.DETAILS.TABS.ROLES",
			name: "roles",
		},
		{
			translation: "USERS.GROUPS.DETAILS.TABS.USERS",
			name: "users",
		},
		{
			translation: "USERS.GROUPS.DETAILS.TABS.SUMMARY",
			name: "summary",
		},
	];

	// Validation schema of current page
	const currentValidationSchema = NewGroupSchema[steps[page].name];

	const handleSubmit = (values: typeof initialFormValuesNewGroup) => {
		dispatch(postNewGroup(values));
		close();
	};

	return (
		<>
			{/* Initialize overall form */}
			<Formik
				initialValues={initialValues}
				validationSchema={currentValidationSchema}
				onSubmit={values => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{formik => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm();
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
								{steps[page].name === "metadata" && (
									<GroupMetadataPage
										formik={formik}
										nextPage={nextPage}
									/>
								)}
								{steps[page].name === "roles" && (
									<GroupRolesPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{steps[page].name === "users" && (
									<GroupUsersPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{steps[page].name === "summary" && (
									<NewGroupSummaryPage
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

export default NewGroupWizard;
