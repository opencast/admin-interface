import React, { useState, useEffect } from "react";
import RenderMultiField from "../wizard/RenderMultiField";
import {
	Acl,
	Role,
	fetchAclActions,
	fetchAclDefaults,
	fetchAclTemplates,
	fetchRolesWithTarget,
} from "../../../slices/aclSlice";
import Notifications from "../Notifications";
import { Formik, FieldArray, FormikErrors, FormikProps } from "formik";
import { Field } from "../Field";
import { NOTIFICATION_CONTEXT } from "../../../configs/modalConfig";
import {
	prepareAccessPolicyRulesForPost,
} from "../../../utils/resourceUtils";
import { getUserInformation } from "../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../utils/utils";
import DropDown from "../DropDown";
import { filterRoles, getAclTemplateText, handleTemplateChange, policiesFiltered, rolesFilteredbyPolicies } from "../../../utils/aclUtils";
import { useAppDispatch, useAppSelector } from "../../../store";
import { removeNotificationWizardForm, addNotification } from "../../../slices/notificationSlice";
import { useTranslation } from "react-i18next";
import { TransformedAcl } from "../../../slices/aclDetailsSlice";
import { AsyncThunk, unwrapResult } from "@reduxjs/toolkit";
import { SaveEditFooter } from "../SaveEditFooter";
import { UserInfoState } from "../../../slices/userInfoSlice";
import { ParseKeys } from "i18next";
import ButtonLikeAnchor from "../ButtonLikeAnchor";
import { formatAclTemplatesForDropdown } from "../../../utils/dropDownUtils";
import ModalContentTable from "./ModalContentTable";
import { LuCircleX } from "react-icons/lu";


/**
 * This component manages the access policy tab of resource details modals
 */
type AclTemplate = {
	id: string,
	value: string
}

const ResourceDetailsAccessPolicyTab = ({
	resourceId,
	header,
	policies,
	policyTemplateId,
	fetchHasActiveTransactions,
	fetchAccessPolicies,
	saveNewAccessPolicies,
	descriptionText,
	buttonText,
	policyTableHeaderText,
	policyTableRoleText,
	policyTableNewText,
	userPolicyTableHeaderText,
	userPolicyTableRoleText,
	userPolicyTableNewText,
	editAccessRole,
	viewUsersAccessRole,
	viewNonUsersAccessRole,
	policyChanged,
	setPolicyChanged,
	withOverrideButton,
}: {
	resourceId: string,
	header: ParseKeys,
	policies: TransformedAcl[],
	policyTemplateId: number,
	fetchHasActiveTransactions?: AsyncThunk<{ active: boolean }, string, any>
	fetchAccessPolicies: AsyncThunk<any, string, any>,
	saveNewAccessPolicies: AsyncThunk<boolean, { id: string, policies: { acl: Acl }, override?: boolean }, any>
	descriptionText: ParseKeys,
	buttonText: ParseKeys,
	policyTableHeaderText: ParseKeys,
	policyTableRoleText: ParseKeys,
	policyTableNewText: ParseKeys,
	userPolicyTableHeaderText: ParseKeys,
	userPolicyTableRoleText: ParseKeys,
	userPolicyTableNewText: ParseKeys,
	editAccessRole: string,
	viewUsersAccessRole: string,
	viewNonUsersAccessRole: string,
	policyChanged: boolean,
	setPolicyChanged: (value: boolean) => void,
	withOverrideButton?: boolean
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// list of policy templates
	const [aclTemplates, setAclTemplates] = useState<AclTemplate[]>([]);

	// list of possible additional actions
	const [aclActions, setAclActions] = useState<{ id: string, value: string }[]>([]);


	// shows, whether a resource has additional actions on top of normal read and write rights
	const [hasActions, setHasActions] = useState(false);

	// list of possible roles
	const [roles, setRoles] = useState<Role[]>([]);

	// this state is used, because the policies should be read-only, if a transaction is currently being performed on a resource
	const [transactions, setTransactions] = useState({ readOnly: false });

	// this state tracks, whether data is currently being fetched
	const [loading, setLoading] = useState(false);

	const user = useAppSelector(state => getUserInformation(state));

	/* fetch initial values from backend */
	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		async function fetchData() {
			setLoading(true);
			const [responseTemplates, responseActions] = await Promise.all([
				fetchAclTemplates(), fetchAclActions(), dispatch(fetchAccessPolicies(resourceId))]);
			setAclTemplates(responseTemplates);
			setAclActions(responseActions);
			setHasActions(responseActions.length > 0);
			fetchRolesWithTarget("ACL").then(roles => setRoles(roles));
			if (fetchHasActiveTransactions) {
				const fetchTransactionResult = await dispatch(fetchHasActiveTransactions(resourceId)).then(unwrapResult);
				if (fetchTransactionResult.active !== undefined) {
					setTransactions({ readOnly: fetchTransactionResult.active });
				} else {
					setTransactions({ readOnly: true });
				}
				if (
					fetchTransactionResult.active === undefined ||
					fetchTransactionResult.active
				) {
					dispatch(addNotification({
						type: "warning",
						key: "ACTIVE_TRANSACTION",
						duration: -1,
						context: NOTIFICATION_CONTEXT,
						noDuplicates: true,
					}));
				}
			}
			setLoading(false);
		}

		fetchData().then(() => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/* resets the formik form and hides the save and cancel buttons */
	const resetPolicies = (resetFormik: () => void) => {
		setPolicyChanged(false);
		resetFormik();
	};

	/* transforms rules into proper format for saving and checks validity
	 * if the policies are valid, the new policies are saved in the backend */
	const saveAccess = (values: { policies: TransformedAcl[] }, override: boolean) => {
		dispatch(removeNotificationWizardForm());
		const { roleWithFullRightsExists, allRulesValid } = validatePolicies(
			values,
		);
		const access = prepareAccessPolicyRulesForPost(values.policies);

		if (!allRulesValid) {
			dispatch(addNotification({
				type: "warning",
				key: "INVALID_ACL_RULES",
				duration: -1,
				context: NOTIFICATION_CONTEXT,
			}));
		}

		if (!roleWithFullRightsExists) {
			dispatch(addNotification({
				type: "warning",
				key: "MISSING_ACL_RULES",
				duration: -1,
				context: NOTIFICATION_CONTEXT,
			}));
		}

		if (allRulesValid && roleWithFullRightsExists) {
			dispatch(saveNewAccessPolicies({ id: resourceId, policies: access, override: override })).then(success => {
				// fetch new policies from the backend, if save successful
				if (success) {
					setPolicyChanged(false);
					dispatch(fetchAccessPolicies(resourceId));
				}
			});
		}
	};

	/* validates the policies in the formik form */
	const validateFormik = (values: { policies: TransformedAcl[] }) => {
		const errors: FormikErrors<{ emptyRole: string }> = {};
		setPolicyChanged(isPolicyChanged(values.policies));

		// each policy needs a role
		if (values.policies.find(policy => !policy.role || policy.role === "")) {
			errors.emptyRole = "Empty role!";
		}

		return errors;
	};

	/* checks validity of the policies
	 * each policy needs a role and at least one of: read-rights, write-rights, additional action
	 * if not admin, there needs to be at least one role, which has both read and write rights */
	const validatePolicies = (values: { policies: TransformedAcl[] }) => {
		let roleWithFullRightsExists = false;
		let allRulesValid = true;

		values.policies.forEach(policy => {
			if ((policy.read && policy.write) || user.isAdmin) {
				roleWithFullRightsExists = true;
			}

			if (
				(!policy.read && !policy.write && policy.actions.length === 0) ||
				!policy.role ||
				policy.role === ""
			) {
				allRulesValid = false;
			}
		});

		return { roleWithFullRightsExists, allRulesValid };
	};

	/* checks whether the current state of the policies from the formik is different form the
	 * initial policies or equal to them */
	const isPolicyChanged = (newPolicies: TransformedAcl[]) => {
		if (newPolicies.length !== policies.length) {
			return true;
		}
		const sortSchema = (pol1: TransformedAcl, pol2: TransformedAcl) => {
			return pol1.role > pol2.role ? 1 : -1;
		};
		const sortedNewPolicies = [...newPolicies].sort(sortSchema);
		const sortedInitialPolicies = [...policies].sort(sortSchema);
		for (let i = 0; i < sortedNewPolicies.length; i++) {
			if (
				sortedNewPolicies[i].role !== sortedInitialPolicies[i].role ||
				sortedNewPolicies[i].read !== sortedInitialPolicies[i].read ||
				sortedNewPolicies[i].write !== sortedInitialPolicies[i].write ||
				sortedNewPolicies[i].actions.length !==
					sortedInitialPolicies[i].actions.length
			) {
				return true;
			}
			if (
				sortedNewPolicies[i].actions.length > 0 &&
				sortedNewPolicies[i].actions.length ===
					sortedInitialPolicies[i].actions.length
			) {
				for (let j = 0; j < sortedNewPolicies[i].actions.length; j++) {
					if (
						sortedNewPolicies[i].actions[j] !==
						sortedInitialPolicies[i].actions[j]
					) {
						return true;
					}
				}
			}
		}
		return false;
	};

	return (
		<ModalContentTable>
			{/* Notifications */}
			<Notifications context="not_corner" />

			{!loading && !!policies && (
				<ul>
					<li>
						<Formik
							initialValues={{
								policies: policies.length > 0 ? [...policies] : [],
								aclTemplate: policyTemplateId ? policyTemplateId.toString() : "",
							}}
							enableReinitialize
							validate={values => validateFormik(values)}
							onSubmit={values =>
								saveAccess(values, false)
							}
						>
							{formik => (
								<div className="obj list-obj">
									<header>{t(header) /* Access Policy */}</header>

									{/* policy templates */}
									<TemplateSelector
										formik={formik}
										editAccessRole={editAccessRole}
										titleText={"EVENTS.EVENTS.DETAILS.ACCESS.TEMPLATES.TITLE"}
										descriptionText={descriptionText}
										buttonText={buttonText}
										emptyText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.EMPTY"}
										transactions={transactions}
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
													header={userPolicyTableHeaderText}
													firstColumnHeader={userPolicyTableRoleText}
													createLabel={userPolicyTableNewText}
													formik={formik}
													hasActions={hasActions}
													transactions={transactions}
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
												header={policyTableHeaderText}
												firstColumnHeader={policyTableRoleText}
												createLabel={policyTableNewText}
												formik={formik}
												hasActions={hasActions}
												transactions={transactions}
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
												header={policyTableHeaderText}
												firstColumnHeader={policyTableRoleText}
												createLabel={policyTableNewText}
												formik={formik}
												hasActions={hasActions}
												transactions={transactions}
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

									{/* Save and cancel buttons */}
									{!transactions.readOnly && <SaveEditFooter
										active={policyChanged && formik.dirty}
										reset={() => resetPolicies(formik.resetForm)}
										submit={() => saveAccess(formik.values, false)}
										isValid={formik.isValid}
										additionalButton={withOverrideButton ? {
											label: "EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.REPLACE_EVENT_ACLS",
											hint: "EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.REPLACE_EVENT_ACLS_HINT",
											onClick: () => saveAccess(formik.values, true),
										} : undefined}
									/>}
								</div>
							)}
						</Formik>
					</li>
				</ul>
			)}
		</ModalContentTable>
	);
};

export default ResourceDetailsAccessPolicyTab;

type AccessPolicyTabFormikProps = {
	policies: TransformedAcl[]
}

export const AccessPolicyTable = <T extends AccessPolicyTabFormikProps>({
	isUserTable,
	policiesFiltered,
	rolesFilteredbyPolicies,
	header,
	firstColumnHeader,
	createLabel,
	formik,
	hasActions,
	transactions,
	aclActions,
	roles,
	editAccessRole,
}: {
	isUserTable: boolean
	policiesFiltered: TransformedAcl[]
	rolesFilteredbyPolicies: Role[]
	header?: ParseKeys
	firstColumnHeader: ParseKeys
	createLabel: ParseKeys,
	formik: FormikProps<T>,
	hasActions: boolean
	transactions: { readOnly: boolean }
	aclActions: { id: string, value: string }[]
	roles: Role[]
	editAccessRole: string
}) => {
	const { t } = useTranslation();

	const user = useAppSelector(state => getUserInformation(state));

	const [aclDefaults, setAclDefaults] = useState<{ [key: string]: string }>();

	useEffect(() => {
		async function fetchData() {
			const responseDefaults = await fetchAclDefaults();
			setAclDefaults(responseDefaults);
		}

		fetchData();
	}, []);

	const createPolicy = (role: string, withUser: boolean): TransformedAcl => {
		const user = withUser ? { username: "", name: "", email: "" } : undefined;

		const newRole: TransformedAcl = {
			role: role,
			read: true,
			write: false,
			actions: [],
			user: user,
		};

		// If config exists, set defaults according to config
		if (aclDefaults) {
			if (aclDefaults["read_enabled"] && aclDefaults["read_enabled"] === "true") {
				newRole.read = true;
			} else if (aclDefaults["read_enabled"] && aclDefaults["read_enabled"] === "false") {
				newRole.read = false;
			}
			if (aclDefaults["write_enabled"] && aclDefaults["write_enabled"] === "true") {
				newRole.write = true;
			} else if (aclDefaults["write_enabled"] && aclDefaults["write_enabled"] === "false") {
				newRole.write = false;
			}
			if (aclDefaults["default_actions"]) {
				newRole.actions = newRole.actions.concat(aclDefaults["default_actions"].split(","));
			}
		}

		return newRole;
	};

	return (
		<>
			{/* list of policy details and interface for changing them */}
			<div className="obj-container">
				<div className="obj tbl-list">
					<header>
						{header ? t(header) : undefined}
					</header>

					<div className="obj-container">
						<table className="main-tbl">
							{/* column headers */}
							<thead>
								<tr>
									<th>
										{
											t(
												firstColumnHeader,
											) /* <!-- Role --> */
										}
									</th>
									<th className="fit">
										{
											t(
												"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.WRITE",
											) /* <!-- Write --> */
										}
									</th>
									<th className="fit">
										{
											t(
												"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.READ",
											) /* <!-- Read --> */
										}
									</th>
									{hasActions && (
										<th className="fit">
											{
												t(
													"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.ADDITIONAL_ACTIONS",
												) /* <!-- Additional Actions --> */
											}
										</th>
									)}
									{hasAccess(editAccessRole, user) && (
										<th className="fit">
											{
												t(
													"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ACTION",
												) /* <!-- Action --> */
											}
										</th>
									)}
								</tr>
							</thead>

							<tbody>
								{/* list of policies */}
								<FieldArray
									name={"policies"}
									render={arrayHelpers => (
										<>
											{formik.values.policies.length > 0 &&
												policiesFiltered.map(
													(policy, index) => (
														<tr key={index}>
															{/* dropdown for policy.role */}
															<td className="editable">
																{!transactions.readOnly ? (
																	<DropDown
																		value={policy.role}
																		text={createPolicyLabel(policy)}
																		options={
																			roles.length > 0
																				? formatAclRolesForDropdown(rolesFilteredbyPolicies)
																				: []
																		}
																		required={true}
																		creatable={true}
																		handleChange={element => {
																			if (element) {
																				const matchingRole = roles.find(role => role.name === element.value);
																				arrayHelpers.replace(formik.values.policies.findIndex(p => p === policy), {
																					...policy,
																					role: element.value,
																					user: matchingRole ? matchingRole.user : undefined,
																				});
																			}
																		}}
																		placeholder={
																			t("EVENTS.EVENTS.DETAILS.ACCESS.ROLES.LABEL")
																		}
																		disabled={
																			!hasAccess(
																				editAccessRole,
																				user,
																			)
																		}
																		skipTranslate
																		optionHeight={35}
																		customCSS={{ width: "100%", optionPaddingTop: 5 }}
																	/>
																) : (
																	<p>{policy.role}</p>
																)}
															</td>

															{/* Checkboxes for policy.read and policy.write */}
															<td className="fit text-center">
																<Field
																	type="checkbox"
																	name={`policies.${formik.values.policies.findIndex(p => p === policy)}.read`}
																	disabled={
																		transactions.readOnly ||
																		!hasAccess(
																			editAccessRole,
																			user,
																		) ||
																		(aclDefaults && aclDefaults["read_readonly"] !== "false")
																	}
																	className={`${
																		transactions.readOnly
																			? "disabled"
																			: "false"
																	}`}
																	onChange={(read: React.ChangeEvent<HTMLInputElement>) =>
																		arrayHelpers.replace(formik.values.policies.findIndex(p => p === policy), {
																			...policy,
																			read: read.target.checked,
																		})
																	}
																/>
															</td>
															<td className="fit text-center">
																<Field
																	type="checkbox"
																	name={`policies.${formik.values.policies.findIndex(p => p === policy)}.write`}
																	disabled={
																		transactions.readOnly ||
																		!hasAccess(
																			editAccessRole,
																			user,
																		) ||
																		(aclDefaults
																			&& aclDefaults["write_readonly"]
																			&& aclDefaults["write_readonly"] === "true")
																	}
																	className={`${
																		transactions.readOnly
																			? "disabled"
																			: "false"
																	}`}
																	onChange={(write: React.ChangeEvent<HTMLInputElement>) =>
																		arrayHelpers.replace(formik.values.policies.findIndex(p => p === policy), {
																			...policy,
																			write:
																				write.target.checked,
																		})
																	}
																/>
															</td>

															{/* Multi value field for policy.actions (additional actions) */}
															{hasActions && (
																<td className="fit editable">
																	{!transactions.readOnly &&
																		hasAccess(
																			editAccessRole,
																			user,
																		) && (
																			<div>
																				<Field
																					fieldInfo={{
																						id: `policies.${formik.values.policies.findIndex(p => p === policy)}.actions`,
																						type: "mixed_text",
																						collection: aclActions,
																					}}
																					onlyCollectionValues
																					name={`policies.${formik.values.policies.findIndex(p => p === policy)}.actions`}
																					component={
																						RenderMultiField
																					}
																				/>
																			</div>
																		)}
																	{(transactions.readOnly ||
																		!hasAccess(
																			editAccessRole,
																			user,
																		)) &&
																		policy.actions.map(
																			(
																				customAction,
																				actionKey,
																			) => (
																				<div key={actionKey}>
																					{customAction}
																				</div>
																			),
																		)}
																</td>
															)}

															{/* Remove policy */}
															{hasAccess(
																editAccessRole,
																user,
															) && (
																<td>
																	{!transactions.readOnly && (
																		<ButtonLikeAnchor
																			onClick={() =>
																				arrayHelpers.remove(formik.values.policies.findIndex(p => p === policy))
																			}
																			className="action-cell-button remove"
																		>
																			<LuCircleX />
																		</ButtonLikeAnchor>
																	)}
																</td>
															)}
														</tr>
													),
												)}

											{/* create additional policy */}
											{!transactions.readOnly &&
												hasAccess(editAccessRole, user) && (
													<tr>
														<td colSpan={5}>
															<ButtonLikeAnchor
																onClick={() =>
																	arrayHelpers.push(createPolicy("", isUserTable))
																}
															>
																+{" "}
																{t(createLabel)}
															</ButtonLikeAnchor>
														</td>
													</tr>
												)}
										</>
									)}
								/>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
};

type TemplateSelectorProps = {
	aclTemplate: string
	policies: TransformedAcl[]
}

export const TemplateSelector = <T extends TemplateSelectorProps>({
	formik,
	editAccessRole,
	titleText,
	descriptionText,
	buttonText,
	emptyText,
	transactions,
	aclTemplates,
	defaultUser,
}: {
	formik: FormikProps<T>
	editAccessRole: string
	titleText: ParseKeys
	descriptionText: ParseKeys
	buttonText: ParseKeys
	emptyText: ParseKeys
	transactions: { readOnly: boolean }
	aclTemplates: AclTemplate[]
	defaultUser?: UserInfoState
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));

	const [aclDefaults, setAclDefaults] = useState<{ [key: string]: string }>();

	useEffect(() => {
		async function fetchData() {
			const responseDefaults = await fetchAclDefaults();
			setAclDefaults(responseDefaults);
		}

		fetchData();
	}, []);

	if (!hasAccess(editAccessRole, user)) {
		return <></>;
	}

	return (
		<div className="obj-container">
			<p>
				{t(descriptionText) /* Description text for policies*/}
			</p>
			<div className="obj tbl-list">
				<table className="main-tbl">
					<thead>
						<tr>
							<th>
								{t(titleText)}
							</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td className="editable">
								{!transactions.readOnly && aclTemplates.length > 0 && (
									/* dropdown for selecting a policy template */
									<DropDown
										value={formik.values.aclTemplate}
										text={getAclTemplateText(
											aclTemplates,
											formik.values.aclTemplate,
										)}
										options={aclTemplates ? formatAclTemplatesForDropdown(aclTemplates) : []}
										required={true}
										handleChange={element => {
											if (element) {
												handleTemplateChange(
													element.value,
													formik,
													dispatch,
													aclDefaults,
													defaultUser,
												);
											}
										}}
										placeholder={t(buttonText)}
									/>
								)}
								{!(aclTemplates.length > 0) &&
									// Show if no option is available
									<td>
										<div className="obj-container padded">
											{t(emptyText)}
										</div>
									</td>
								}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

export const formatAclRolesForDropdown = (roles: Role[]) => {
	return roles.map(role => ({ label: createPolicyLabel(role) ?? role.name, value: role.name }));
};

export const createPolicyLabel = (policy: Role | TransformedAcl) => {
	if (policy.user) {
		if (policy.user.email !== undefined && policy.user.email !== "" && policy.user.email !== null) {
			return policy.user.name + " <" + policy.user.email + ">";
		}
		if (policy.user.name) {
			return policy.user.name;
		}
		if (policy.user.username) {
			return policy.user.username;
		}
	}

	if ("name" in policy) {
		return policy.name;
	} else {
		return policy.role;
	}
};
