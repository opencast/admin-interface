import { useState } from "react";
import { Formik } from "formik";
import GeneralPage from "./GeneralPage";
import BumperPage from "./BumperPage";
import TitleSlidePage from "./TitleSlidePage";
import WatermarkPage from "./WatermarkPage";
import {
	getThemeDetails,
	getThemeUsage,
} from "../../../../selectors/themeDetailsSelectors";
import UsagePage from "./UsagePage";
import ModalNavigation from "../../../shared/modals/ModalNavigation";
import { NewThemeSchema } from "../../../../utils/validate";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateThemeDetails } from "../../../../slices/themeDetailsSlice";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { ThemeDetailsInitialValues } from "../../../../slices/themeSlice";
import { ParseKeys } from "i18next";

/**
 * This component manages the pages of the theme details
 */
const ThemeDetails = ({
	close,
}: {
	close: () => void,
}) => {
	const dispatch = useAppDispatch();

	const [page, setPage] = useState(0);

	const themeDetails = useAppSelector(state => getThemeDetails(state));
	const themeUsage = useAppSelector(state => getThemeUsage(state));

	// set initial values for formik form
	const initialValues = {
		...themeDetails,
		titleSlideMode:
			themeDetails.titleSlideActive && !!themeDetails.titleSlideBackground
				? "upload"
				: "extract",
	};

	// information about tabs
	const tabs: {
		name: "generalForm" | "bumperForm" | "trailerForm" | "titleSlideForm" | "watermarkForm" | "usage"
		tabTranslation: ParseKeys
		translation: ParseKeys
		accessRole: string
	}[] = [
		{
			name: "generalForm",
			tabTranslation: "CONFIGURATION.THEMES.DETAILS.GENERAL.CAPTION",
			translation: "CONFIGURATION.THEMES.DETAILS.GENERAL.CAPTION",
			accessRole: "ROLE_UI_THEMES_EDIT",
		},
		{
			name: "bumperForm",
			tabTranslation: "CONFIGURATION.THEMES.DETAILS.BUMPER.CAPTION",
			translation: "CONFIGURATION.THEMES.DETAILS.BUMPER.CAPTION",
			accessRole: "ROLE_UI_THEMES_EDIT",
		},
		{
			name: "trailerForm",
			tabTranslation: "CONFIGURATION.THEMES.DETAILS.TRAILER.CAPTION",
			translation: "CONFIGURATION.THEMES.DETAILS.TRAILER.CAPTION",
			accessRole: "ROLE_UI_THEMES_EDIT",
		},
		{
			name: "titleSlideForm",
			tabTranslation: "CONFIGURATION.THEMES.DETAILS.TITLE.CAPTION",
			translation: "CONFIGURATION.THEMES.DETAILS.TITLE.CAPTION",
			accessRole: "ROLE_UI_THEMES_EDIT",
		},
		{
			name: "watermarkForm",
			tabTranslation: "CONFIGURATION.THEMES.DETAILS.WATERMARK.CAPTION",
			translation: "CONFIGURATION.THEMES.DETAILS.WATERMARK.CAPTION",
			accessRole: "ROLE_UI_THEMES_EDIT",
		},
		{
			name: "usage",
			tabTranslation: "CONFIGURATION.THEMES.DETAILS.USAGE.CAPTION",
			translation: "CONFIGURATION.THEMES.DETAILS.USAGE.CAPTION",
			accessRole: "ROLE_UI_THEMES_EDIT",
		},
	];

	// Validation schema of current page
	const currentValidationSchema = NewThemeSchema[tabs[page].name];

	// update theme
	const handleSubmit = (values: ThemeDetailsInitialValues) => {
		dispatch(updateThemeDetails({ id: themeDetails.id, values: values }));
		close();
	};

	const openTab = (tabNr: number) => {
		setPage(tabNr);
	};

	return (
		<>
			{/* navigation */}
			<ModalNavigation tabInformation={tabs} openTab={openTab} page={page} />

			{/* initialize overall form */}
			<Formik
				initialValues={initialValues}
				validationSchema={currentValidationSchema}
				onSubmit={values => handleSubmit(values)}
			>
				{/* render modal pages depending on current value of page variable */}
				{formik => (
					<div>
						{page === 0 && <GeneralPage formik={formik} isEdit />}
						{page === 1 && <BumperPage formik={formik} isEdit />}
						{page === 2 && <BumperPage formik={formik} isTrailer isEdit />}
						{page === 3 && <TitleSlidePage formik={formik} isEdit />}
						{page === 4 && <WatermarkPage formik={formik} isEdit />}
						{page === 5 && <UsagePage themeUsage={themeUsage} />}
						{/* submit and cancel button */}
						<WizardNavigationButtons
							isLast
							formik={formik}
							previousPage={() => close()}
							createTranslationString={"SUBMIT"}
							cancelTranslationString={"CANCEL"}
						/>
					</div>
				)}
			</Formik>
		</>
	);
};

export default ThemeDetails;
