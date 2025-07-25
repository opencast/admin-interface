import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import { FormikProps } from "formik";
import { initialFormValuesNewGroup } from "../../../../configs/modalConfig";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the summary page for new groups in the new group wizard.
 */
const NewGroupSummaryPage = <T extends typeof initialFormValuesNewGroup>({
	formik,
	previousPage,
}: {
	formik: FormikProps<T>,
	previousPage?: (values: T) => void,
}) => {
	const { t } = useTranslation();

	// get values of objects in field that should be shown
	const getValues = (fields: { name: string }[]) => {
		const names = [];
		for (const field of fields) {
			names.push(field.name);
		}
		return names;
	};

	return (
		<>
			<ModalContentTable>
				<Notifications context={"other"}/>

				<div className="obj">
					<header>{t("USERS.GROUPS.DETAILS.FORM.SUMMARY")}</header>
					<div className="obj-container">
						<table className="main-tbl">
							<tbody>
								<tr>
									<td>{t("USERS.GROUPS.DETAILS.FORM.NAME")}</td>
									<td>{formik.values.name}</td>
								</tr>
								<tr>
									<td>{t("USERS.GROUPS.DETAILS.FORM.DESCRIPTION")}</td>
									<td>{formik.values.description}</td>
								</tr>
								<tr>
									<td>{t("USERS.GROUPS.DETAILS.FORM.ROLES")}</td>
									<td>{getValues(formik.values.roles).join(", ")}</td>
								</tr>
								<tr>
									<td>{t("USERS.GROUPS.DETAILS.FORM.USERS")}</td>
									<td>{getValues(formik.values.users).join(", ")}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</ModalContentTable>
			{/* Button for navigation to next page */}
			<WizardNavigationButtons
				isLast
				previousPage={previousPage}
				formik={formik}
			/>
		</>
	);
};

export default NewGroupSummaryPage;
