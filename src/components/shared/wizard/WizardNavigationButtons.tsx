import { FormikProps } from "formik";
import NavigationButtons from "../NavigationButtons";
import { ParseKeys } from "i18next";

const WizardNavigationButtons = <T, >({
	isFirst,
	isLast,
	noValidation, // Do not validate
	customValidation, // Custom validation. If your component does its own validation instead of using Yup
	formik,
	nextPage,
	previousPage,
	submitPage,
	createTranslationString,
	cancelTranslationString,
}: {
  isFirst?: boolean,
	isLast?: boolean,
	noValidation?: boolean,
	customValidation?: boolean,
	formik: FormikProps<T>,
	nextPage?: (values: T) => void,
	previousPage?: (values: T) => void,
	submitPage?: () => void,
	createTranslationString?: ParseKeys,
	cancelTranslationString?: ParseKeys,
}) => {

	const disabled = noValidation
		? false
		: customValidation !== undefined
		? customValidation
		: !(formik.dirty && formik.isValid);

	return (
		<NavigationButtons
			isFirst={isFirst}
			isLast={isLast}
			isSubmitDisabled={disabled}
			nextPage={
				isLast
				? () => {
					if (submitPage) {
						submitPage();
					 } else {
						formik.handleSubmit();
					 }
				}
				: () => {
					if (nextPage) {
						nextPage(formik.values);
					}
				}
			}
			previousPage={
				() => {
					if (previousPage) {
						previousPage(formik.values);
					}
				}
			}
			nextTranslationString={
				isLast
				? createTranslationString ?? "WIZARD.CREATE"
				: "WIZARD.NEXT_STEP"
			}
			previousTranslationString={cancelTranslationString ?? "WIZARD.BACK"}
		/>
	);
};

export default WizardNavigationButtons;
