import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import Notifications from "../../../shared/Notifications";
import {
	Role,
	checkAcls,
	fetchAclActions,
	fetchAclTemplates,
	fetchRolesWithTarget,
} from "../../../../slices/aclSlice";
import { filterRoles, policiesFiltered, rolesFilteredbyPolicies } from "../../../../utils/aclUtils";
import { useAppDispatch } from "../../../../store";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { AccessPolicyTable, TemplateSelector } from "../../../shared/modals/ResourceDetailsAccessPolicyTab";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the access policy page in the new ACL wizard and in the ACL details modal
 */
interface RequiredFormProps {
	policies: TransformedAcl[],
	aclTemplate: string,
}

const AclAccessPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
	isEdit,
} : {
	formik: FormikProps<T>,
	nextPage?: (values: T) => void,
	previousPage?: (values: T) => void,
	isEdit?: boolean,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [aclTemplates, setAclTemplates] = useState<{ id: string, value: string }[]>([]);
	const [aclActions, setAclActions] = useState<{ id: string, value: string }[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(false);

	const editAccessRole = "ROLE_UI_SERIES_DETAILS_ACL_EDIT";

	useEffect(() => {
		// fetch data about roles, acl templates and actions from backend
		async function fetchData() {
			setLoading(true);
			const [responseTemplates, responseActions, responseRoles] = await Promise.all([
				fetchAclTemplates(), fetchAclActions(), fetchRolesWithTarget("ACL")]);
			setAclTemplates(responseTemplates);
			setAclActions(responseActions);
			setRoles(responseRoles);
			setLoading(false);
		}

		fetchData();
	}, []);

	return (
		<>
			<ModalContentTable>
				<Notifications context="not_corner" />
				{!loading && (
					<ul>
						<li>
							<div className="obj list-obj">
								<header className="no-expand">
									{t("USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.TITLE")}
								</header>

								<TemplateSelector
									formik={formik}
									editAccessRole={editAccessRole}
									titleText={"USERS.ACLS.NEW.ACCESS.TEMPLATES.TITLE"}
									descriptionText={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.DESCRIPTION"}
									buttonText={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.LABEL"}
									emptyText={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.EMPTY"}
									transactions={{ readOnly: false }}
									aclTemplates={aclTemplates}
								/>

								{roles.length > 0 && !roles[0].isSanitize &&
									<>
										<AccessPolicyTable
											isUserTable={true}
											policiesFiltered={policiesFiltered(formik.values.policies, true)}
											rolesFilteredbyPolicies={rolesFilteredbyPolicies(roles, formik.values.policies, true)}
											header={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.USERS"}
											firstColumnHeader={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.USER"}
											createLabel={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NEW_USER"}
											formik={formik}
											hasActions={aclActions.length > 0}
											transactions={{ readOnly: false }}
											aclActions={aclActions}
											roles={roles}
											editAccessRole={editAccessRole}
										/>

										<AccessPolicyTable
											isUserTable={false}
											policiesFiltered={policiesFiltered(formik.values.policies, false)}
											rolesFilteredbyPolicies={rolesFilteredbyPolicies(roles, formik.values.policies, false)}
											header={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NON_USER_ROLES"}
											firstColumnHeader={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ROLE"}
											createLabel={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NEW"}
											formik={formik}
											hasActions={aclActions.length > 0}
											transactions={{ readOnly: false }}
											aclActions={aclActions}
											roles={roles}
											editAccessRole={editAccessRole}
										/>
									</>
								}

								{roles.length > 0 && roles[0].isSanitize &&
									<>
										<AccessPolicyTable
											isUserTable={false}
											policiesFiltered={formik.values.policies}
											rolesFilteredbyPolicies={filterRoles(roles, formik.values.policies)}
											firstColumnHeader={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ROLE"}
											createLabel={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NEW"}
											formik={formik}
											hasActions={aclActions.length > 0}
											transactions={{ readOnly: false }}
											aclActions={aclActions}
											roles={roles}
											editAccessRole={editAccessRole}
										/>
										<div className="obj-container">
											<span>
												{t("EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.SANITIZATION_NOTE")}
											</span>
										</div>
									</>
								}

							</div>
						</li>
					</ul>
				)}
			</ModalContentTable>
			{/* Button for navigation to next page and previous page */}
			{(!isEdit && !!nextPage && !!previousPage) && (
				<>
					<WizardNavigationButtons
						formik={formik}
						nextPage={
							async () => {
								if (await dispatch(checkAcls(formik.values.policies))) {
									nextPage(formik.values);
								}
							}
						}
						previousPage={previousPage}
					/>
				</>
			)}
		</>
	);
};

export default AclAccessPage;
