import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import {
	Role,
	checkAcls,
	fetchAclActions,
	fetchAclTemplates,
	fetchRolesWithTarget,
} from "../../../../slices/aclSlice";
import { FormikProps } from "formik";
import { filterRoles, policiesFiltered, rolesFilteredbyPolicies } from "../../../../utils/aclUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchSeriesDetailsAcls } from "../../../../slices/seriesDetailsSlice";
import { getSeriesDetailsAcl } from "../../../../selectors/seriesDetailsSelectors";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { AccessPolicyTable, TemplateSelector } from "../../../shared/modals/ResourceDetailsAccessPolicyTab";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the access page for new events and series in the wizards.
 */
interface RequiredFormProps {
	"dublincore/episode_isPartOf": string,
	policies: TransformedAcl[],
	aclTemplate: string,
	// theme: string,
}

const NewAccessPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
	editAccessRole,
	viewUsersAccessRole,
	viewNonUsersAccessRole,
	initEventAclWithSeriesAcl,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
	editAccessRole: string,
	viewUsersAccessRole: string,
	viewNonUsersAccessRole: string,
	initEventAclWithSeriesAcl: boolean
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// States containing response from server concerning acl templates, actions and roles
	const [aclTemplates, setAclTemplates] = useState<{ id: string, value: string}[]>([]);
	const [aclActions, setAclActions] = useState<{ id: string, value: string}[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(false);

	const seriesAcl = useAppSelector(state => getSeriesDetailsAcl(state));
	const user = useAppSelector(state => getUserInformation(state));

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

	// If we have to use series ACL, fetch it
	useEffect(() => {
		if (initEventAclWithSeriesAcl && formik.values["dublincore/episode_isPartOf"]) {
			dispatch(fetchSeriesDetailsAcls(formik.values["dublincore/episode_isPartOf"]));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values["dublincore/episode_isPartOf"], initEventAclWithSeriesAcl, dispatch]);

	// If we have to use series ACL, overwrite existing rules
	useEffect(() => {
		if (initEventAclWithSeriesAcl && formik.values["dublincore/episode_isPartOf"] && seriesAcl) {
			formik.setFieldValue("policies", seriesAcl);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initEventAclWithSeriesAcl, seriesAcl]);

	return (
		<>
			<ModalContentTable>
				{/* Notifications */}
				<Notifications context="not_corner" />
				{!loading && (
					<ul>
						<li>
							<div className="obj list-obj">
								<header>
									{t("EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.TITLE")}
								</header>

								{/* Template selection*/}
								<TemplateSelector
									formik={formik}
									editAccessRole={editAccessRole}
									titleText={"EVENTS.SERIES.NEW.ACCESS.TEMPLATES.TITLE"}
									descriptionText={"EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.DESCRIPTION"}
									buttonText={"EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.LABEL"}
									emptyText={"EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.EMPTY"}
									transactions={{ readOnly: false }}
									aclTemplates={aclTemplates}
									defaultUser={user}
								/>

								{roles.length > 0 && !roles[0].isSanitize &&
									<>
										{hasAccess(viewUsersAccessRole, user) &&
											<AccessPolicyTable
												isUserTable={true}
												policiesFiltered={policiesFiltered(formik.values.policies, true)}
												rolesFilteredbyPolicies={rolesFilteredbyPolicies(roles, formik.values.policies, true)}
												header={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.USERS"}
												firstColumnHeader={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.USER"}
												createLabel={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW_USER"}
												formik={formik}
												hasActions={aclActions.length > 0}
												transactions={{ readOnly: false }}
												aclActions={aclActions}
												roles={roles}
												editAccessRole={editAccessRole}
											/>
										}

										{hasAccess(viewNonUsersAccessRole, user) &&
											<AccessPolicyTable
												isUserTable={false}
												policiesFiltered={policiesFiltered(formik.values.policies, false)}
												rolesFilteredbyPolicies={rolesFilteredbyPolicies(roles, formik.values.policies, false)}
												header={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NON_USER_ROLES"}
												firstColumnHeader={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ROLE"}
												createLabel={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW"}
												formik={formik}
												hasActions={aclActions.length > 0}
												transactions={{ readOnly: false }}
												aclActions={aclActions}
												roles={roles}
												editAccessRole={editAccessRole}
											/>
										}
									</>
								}

								{roles.length > 0 && roles[0].isSanitize &&
									<>
										<AccessPolicyTable
											isUserTable={false}
											policiesFiltered={formik.values.policies}
											rolesFilteredbyPolicies={filterRoles(roles, formik.values.policies)}
											firstColumnHeader={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ROLE"}
											createLabel={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW"}
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
			<WizardNavigationButtons
				formik={formik}
				nextPage={() => {
					if (dispatch(checkAcls(formik.values.policies))) {
						nextPage(formik.values);
					}
				}}
				previousPage={previousPage}
			/>
		</>
	);
};

export default NewAccessPage;
