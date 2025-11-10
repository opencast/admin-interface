import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import { FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the general page for new themes in the new themes wizard
 * and for themes in the themes details modal.
 * Here, additional information, like name, for themes can be provided.
 */
const GeneralPage = <T, >({
	formik,
	nextPage,
	isEdit,
}: {
	formik: FormikProps<T>,
	nextPage?: (values: T) => void,
	isEdit?: boolean,
}) => {
	const { t } = useTranslation();

	return (
		<>
			{/* Fields for name and description */}
			<ModalContentTable>
				<div className="form-container">
					<div className="row">
						<Notifications context={"other"}/>
						<label className="required">
							{t("CONFIGURATION.THEMES.DETAILS.GENERAL.NAME")}
						</label>
						<Field
							name="name"
							type="text"
							autoFocus={!isEdit}
							placeholder={
								t("CONFIGURATION.THEMES.DETAILS.GENERAL.NAME") + "..."
							}
						/>
					</div>
					<div className="row">
						<label>
							{t("CONFIGURATION.THEMES.DETAILS.GENERAL.DESCRIPTION")}
						</label>
						<Field
							name="description"
							as="textarea"
							placeholder={
								t("CONFIGURATION.THEMES.DETAILS.GENERAL.DESCRIPTION") +
								"..."
							}
						/>
					</div>
				</div>
			</ModalContentTable>

			{/* Show navigation buttons only if page is used for a new theme*/}
			{!isEdit && (
				// Button for navigation to next page
				<WizardNavigationButtons isFirst formik={formik} nextPage={nextPage} />
			)}
		</>
	);
};

export default GeneralPage;
