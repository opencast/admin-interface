import Notifications from "../../../shared/Notifications";
import { useTranslation } from "react-i18next";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { FormikProps } from "formik";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

interface RequiredFormProps {
	name: string,
	policies: TransformedAcl[],
}

const NewAclSummaryPage = <T extends RequiredFormProps>({
	formik,
	previousPage,
}: {
	formik: FormikProps<T>,
	previousPage: (values: T) => void,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<ModalContentTable>
				<Notifications context={"other"}/>
				<div className="obj tbl-list">
					<header className="no-expand">{""}</header>
					<div className="obj-container">
						<table className="main-tbl">
							<tr>
								<td>{t("USERS.ACLS.NEW.METADATA.NAME.CAPTION")}</td>
								<td>{formik.values.name}</td>
							</tr>
						</table>
					</div>
				</div>

				<div className="obj tbl-list">
					<header className="no-expand">
						{t("USERS.ACLS.NEW.ACCESS.CAPTION")}
					</header>
					<table className="main-tbl">
						<thead>
							<tr>
								<th className="fit">
									{t("USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ROLE")}
								</th>
								<th className="fit">
									{t("USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.READ")}
								</th>
								<th className="fit">
									{t("USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.WRITE")}
								</th>
								<th className="fit">
									{t(
										"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ADDITIONAL_ACTIONS",
									)}
								</th>
							</tr>
							{formik.values.policies.length > 0 &&
								formik.values.policies.map((acl, key) => (
									<tr key={key}>
										<td>{acl.role}</td>
										<td className="fit">
											<input type="checkbox" disabled checked={acl.read} />
										</td>
										<td className="fit">
											<input type="checkbox" disabled checked={acl.write} />
										</td>
										<td>
											{acl.actions.map((action, key) => (
												<div key={key}>{action}</div>
											))}
										</td>
									</tr>
								))}
						</thead>
					</table>
				</div>
			</ModalContentTable>

			{/* Button for navigation to next page */}
			<WizardNavigationButtons
				isLast
				formik={formik}
				previousPage={previousPage}
			/>
		</>
	);
};

export default NewAclSummaryPage;
