import { useEffect } from "react";
import { Formik } from "formik";
import GeneralPage from "./GeneralPage";
import BumperPage from "./BumperPage";
import TitleSlidePage from "./TitleSlidePage";
import WatermarkPage from "./WatermarkPage";
import ThemeSummaryPage from "./ThemeSummaryPage";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import { initialFormValuesNewThemes } from "../../../../configs/modalConfig";
import { usePageFunctions } from "../../../../hooks/wizardHooks";
import { NewThemeSchema } from "../../../../utils/validate";
import { useAppDispatch } from "../../../../store";
import { postNewTheme, ThemeDetailsInitialValues } from "../../../../slices/themeSlice";

/**
 * This component manages the pages of the new theme wizard and the submission of values
 */
const NewThemeWizard = ({
	close,
}: {
	close: () => void
}) => {
	const dispatch = useAppDispatch();
	const initialValues = initialFormValuesNewThemes;

	const {
		snapshot,
		page,
		nextPage,
		previousPage,
		setPage,
		pageCompleted,
		setPageCompleted,
	 } = usePageFunctions(0, initialValues);

	type StepName = "generalForm" | "bumperForm" | "trailerForm" | "titleSlideForm" | "watermarkForm" | "summary";
	type Step = WizardStep & {
		name: StepName,
	}

	// Caption of steps used by Stepper
	const steps: Step[] = [
		{
			name: "generalForm",
			translation: "CONFIGURATION.THEMES.DETAILS.GENERAL.CAPTION",
		},
		{
			name: "bumperForm",
			translation: "CONFIGURATION.THEMES.DETAILS.BUMPER.CAPTION",
		},
		{
			name: "trailerForm",
			translation: "CONFIGURATION.THEMES.DETAILS.TRAILER.CAPTION",
		},
		{
			name: "titleSlideForm",
			translation: "CONFIGURATION.THEMES.DETAILS.TITLE.CAPTION",
		},
		{
			name: "watermarkForm",
			translation: "CONFIGURATION.THEMES.DETAILS.WATERMARK.CAPTION",
		},
		{
			name: "summary",
			translation: "CONFIGURATION.THEMES.DETAILS.SUMMARY.CAPTION",
		},
	];

	// Validation schema of current page
	const currentValidationSchema = NewThemeSchema[steps[page].name];

	const handleSubmit = (values: ThemeDetailsInitialValues) => {
		dispatch(postNewTheme(values));
		close();
	};

	return (
		<>
			{/* Initialize overall form */}
			<Formik
				initialValues={snapshot}
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
								{steps[page].name === "generalForm" && (
									<GeneralPage formik={formik} nextPage={nextPage} />
								)}
								{steps[page].name === "bumperForm" && (
									<BumperPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{steps[page].name === "trailerForm" && (
									<BumperPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
										isTrailer
									/>
								)}
								{steps[page].name === "titleSlideForm" && (
									<TitleSlidePage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{steps[page].name === "watermarkForm" && (
									<WatermarkPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{steps[page].name === "summary" && (
									<ThemeSummaryPage
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

export default NewThemeWizard;
