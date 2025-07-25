import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the metadata page in the new ACL wizard and in the ACL details modal
 */
const AclMetadataPage = <T, >({
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
			<ModalContentTable>
				<ul>
					<li>
						<div className="obj tbl-details">
							<header>{t("USERS.ACLS.NEW.METADATA.TITLE")}</header>
							<div className="obj-container">
								<table className="main-tbl">
									<tbody>
										<tr>
											<td>
												{t("USERS.ACLS.NEW.METADATA.NAME.CAPTION")}
												<i className="required">*</i>
											</td>
											<td>
												<Field
													className="hidden-input"
													name="name"
													tabIndex={1}
													autoFocus={!isEdit}
													placeholder={t(
														"USERS.ACLS.NEW.METADATA.NAME.PLACEHOLDER",
													)}
												/>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</li>
				</ul>
			</ModalContentTable>

			{/* Button for navigation to next page */}
			{!isEdit && (
				<WizardNavigationButtons isFirst formik={formik} nextPage={nextPage} />
			)}
		</>
	);
};

export default AclMetadataPage;
