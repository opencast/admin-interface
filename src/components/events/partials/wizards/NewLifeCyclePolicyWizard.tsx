import { useEffect, useState } from "react";
import { Formik } from "formik";
import NewAccessPage from "../ModalTabsAndPages/NewAccessPage";
import WizardStepper from "../../../shared/wizard/WizardStepper";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { UserInfoState } from "../../../../slices/userInfoSlice";
import { postNewLifeCyclePolicy } from "../../../../slices/lifeCycleSlice";
import NewLifeCyclePolicyGeneralPage from "../ModalTabsAndPages/NewLifeCyclePolicyGeneralPage";
import NewLifeCyclePolicySummary from "./NewLifeCyclePolicySummary";
import { LifeCyclePolicySchema } from "../../../../utils/validate";
import { initialFormValuesNewLifeCyclePolicy } from "../../../../configs/modalConfig";
import { parseTargetFiltersForSubmit } from "../../../../utils/lifeCycleUtils";
import { ParseKeys } from "i18next";

/**
 * This component manages the pages of the new event wizard and the submission of values
 */
const NewLifeCyclePolicyWizard = ({
	close,
}: {
	close: () => void
}) => {
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));

	const initialValues = getInitialValues(user);

	const [page, setPage] = useState(0);
	const [snapshot, setSnapshot] = useState(initialValues);
	const [pageCompleted, setPageCompleted] = useState<{ [key: number]: boolean }>({});

	// Caption of steps used by Stepper
	const steps: {
		translation: ParseKeys,
		name: string,
		hidden: boolean,
	}[] = [
		{
			translation: "LIFECYCLE.POLICIES.NEW.GENERAL.CAPTION",
			name: "general",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.NEW.ACCESS.CAPTION",
			name: "access",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.NEW.SUMMARY.CAPTION",
			name: "summary",
			hidden: false,
		},
	];

	const nextPage = (values: typeof initialValues) => {
		setSnapshot(values);

		// set page as completely filled out
		const updatedPageCompleted = pageCompleted;
		updatedPageCompleted[page] = true;
		setPageCompleted(updatedPageCompleted);

		let newPage = page;
		do {
			newPage = newPage + 1;
		} while (steps[newPage] && steps[newPage].hidden);
		if (steps[newPage]) {
			setPage(newPage);
		}
	};

	const previousPage = (values: typeof initialValues) => {
		setSnapshot(values);

		let newPage = page;
		do {
			newPage = newPage - 1;
		} while (steps[newPage] && steps[newPage].hidden);
		if (steps[newPage]) {
			setPage(newPage);
		}
	};

	const handleSubmit = (values: typeof initialValues) => {
		const fixedValues = {
			...values,
			targetFilters: parseTargetFiltersForSubmit(values.targetFiltersTransformed),
			accessControlEntries: values.policies,
		};

		const response = dispatch(postNewLifeCyclePolicy(fixedValues));
		console.info(response);
		close();
	};

	return (
		<>
			<Formik
				initialValues={snapshot}
				validationSchema={LifeCyclePolicySchema[page]}
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
								acls={formik.values.policies}
							/>
							<div>
								{page === 0 && (
									<NewLifeCyclePolicyGeneralPage
										// @ts-expect-error TS(7006):
										nextPage={nextPage}
										// @ts-expect-error TS(7006):
										formik={formik}
										header={steps[page].translation}
									/>
								)}
								{page === 1 && (
									<NewAccessPage
									// @ts-expect-error TS(7006):
										previousPage={previousPage}
										// @ts-expect-error TS(7006):
										nextPage={nextPage}
										// @ts-expect-error TS(7006):
										formik={formik}
										editAccessRole="ROLE_UI_LIFECYCLEPOLICY_DETAILS_ACL_EDIT"
										initEventAclWithSeriesAcl={false}
									/>
								)}
								{page === 2 && (
									<NewLifeCyclePolicySummary
										previousPage={previousPage}
										formik={formik}
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

// Transform all initial values needed from information provided by backend
const getInitialValues = (
	user: UserInfoState,
) => {
	const initialValues = initialFormValuesNewLifeCyclePolicy;

	initialValues["policies"] = [
		{
			role: user.userRole,
			read: true,
			write: true,
			actions: [],
			user: user.user,
		},
	];

	return initialValues;
};

export default NewLifeCyclePolicyWizard;
