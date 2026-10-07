import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import {
	checkAcls,
	fetchAclActions,
	fetchAclTemplates,
	fetchRolesWithTarget,
} from "../../../../slices/aclSlice";
import { FormikProps } from "formik";
import { policiesFiltered } from "../../../../utils/aclUtils";
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
  metadata: {
    "dublincore/episode_isPartOf": string,
  },
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
	const [isSanitize, setIsSanitize] = useState<boolean | undefined>(undefined);
	const [loading, setLoading] = useState(false);

	const seriesAcl = useAppSelector(state => getSeriesDetailsAcl(state));
	const user = useAppSelector(state => getUserInformation(state));

	useEffect(() => {
		// fetch data about acl templates and actions from backend
		async function fetchData() {
			setLoading(true);
			const [responseTemplates, responseActions, responseRoles] = await Promise.all([
				fetchAclTemplates(), fetchAclActions(), fetchRolesWithTarget("ACL", { limit: 1 })]);
			setAclTemplates(responseTemplates);
			setAclActions(responseActions);
			if (responseRoles.length > 0) {
				setIsSanitize(responseRoles[0].isSanitize);
			}
			setLoading(false);
		}

		fetchData();
	}, []);

	// If we have to use series ACL, fetch it
	useEffect(() => {
		if (initEventAclWithSeriesAcl && formik.values.metadata["dublincore/episode_isPartOf"]) {
			dispatch(fetchSeriesDetailsAcls(formik.values.metadata["dublincore/episode_isPartOf"]));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.metadata["dublincore/episode_isPartOf"], initEventAclWithSeriesAcl, dispatch]);

	// If we have to use series ACL, overwrite existing rules
	useEffect(() => {
		if (initEventAclWithSeriesAcl && formik.values.metadata["dublincore/episode_isPartOf"] && seriesAcl) {
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

								{isSanitize === false &&
									<>
										{hasAccess(viewUsersAccessRole, user) &&
											<AccessPolicyTable
												isUserTable={true}
												policiesFiltered={policiesFiltered(formik.values.policies, true)}
												hasUser={true}
												header={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.USERS"}
												firstColumnHeader={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.USER"}
												createLabel={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW_USER"}
												formik={formik}
												hasActions={aclActions.length > 0}
												transactions={{ readOnly: false }}
												aclActions={aclActions}
												editAccessRole={editAccessRole}
											/>
										}

										{hasAccess(viewNonUsersAccessRole, user) &&
											<AccessPolicyTable
												isUserTable={false}
												policiesFiltered={policiesFiltered(formik.values.policies, false)}
												hasUser={false}
												header={"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NON_USER_ROLES"}
												firstColumnHeader={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ROLE"}
												createLabel={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW"}
												formik={formik}
												hasActions={aclActions.length > 0}
												transactions={{ readOnly: false }}
												aclActions={aclActions}
												editAccessRole={editAccessRole}
											/>
										}
									</>
								}

								{isSanitize === true &&
									<>
										<AccessPolicyTable
											isUserTable={false}
											policiesFiltered={formik.values.policies}
											hasUser={undefined}
											firstColumnHeader={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ROLE"}
											createLabel={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW"}
											formik={formik}
											hasActions={aclActions.length > 0}
											transactions={{ readOnly: false }}
											aclActions={aclActions}
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
