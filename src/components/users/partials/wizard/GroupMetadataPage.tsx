import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import ModalContent from "../../../shared/modals/ModalContent";

/**
 * This component renders the metadata page for groups in the new groups wizard and group details modal
 */
const GroupMetadataPage = <T, >({
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
			<ModalContent>
				<div className="form-container">
					<div className="row">
						<label>
							{t("USERS.GROUPS.DETAILS.FORM.NAME")}
							<i className="required">*</i>
						</label>
						<Field
							tabIndex={1}
							type="text"
							autoFocus={!isEdit}
							placeholder={t("USERS.GROUPS.DETAILS.FORM.NAME")}
							name="name"
						/>
					</div>
					<div className="row">
						<label>{t("USERS.GROUPS.DETAILS.FORM.DESCRIPTION")}</label>
						<Field
							as="textarea"
							tabIndex={2}
							placeholder={t("USERS.GROUPS.DETAILS.FORM.DESCRIPTION")}
							name="description"
						/>
					</div>
				</div>
			</ModalContent>

			{!isEdit && (
				// {/* Button for navigation to next page */}
				<WizardNavigationButtons isFirst formik={formik} nextPage={nextPage} />
			)}
		</>
	);
};

export default GroupMetadataPage;
