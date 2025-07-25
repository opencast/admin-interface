/* This File contains functions that are needed in several access right views*/

import { FormikProps } from "formik";
import { TransformedAcl } from "../slices/aclDetailsSlice";
import { checkAcls, fetchAclTemplateById, Role } from "../slices/aclSlice";
import { UserInfoState } from "../slices/userInfoSlice";
import { fetchUsersForTemplate } from "../slices/userSlice";
import { AppDispatch } from "../store";

export const getAclTemplateText = (
	aclTemplates: {
		id: string
		value: string
	}[],
	formikTemplate: string,
) => {
	if (!!aclTemplates && aclTemplates.length > 0) {
		const template = aclTemplates.find(
			template => formikTemplate === template.id,
		);
		return template ? template.value : "";
	} else {
		return "";
	}
};

export const filterRoles = (roles: Role[], policies: TransformedAcl[]) => {
	return roles.filter(
		role => !policies.find(policy => policy.role === role.name),
	);
};

// Get all policies that have user information, or all policies that do not have user information
export const policiesFiltered = (
	policies: TransformedAcl[],
	byUser: boolean,
) => {
	if (byUser) {
		return policies.filter(policy => policy.user !== undefined);
	} else {
		return policies.filter(policy => policy.user === undefined);
	}
};

// Get all roles that have user information, or all policies that do not have user information
export const rolesFilteredbyPolicies = (
roles: Role[],
policies: TransformedAcl[],
byUser: boolean,
) => {
	roles = filterRoles(roles, policies);
	if (byUser) {
		return roles.filter(role => role.user !== undefined);
	} else {
		return roles.filter(role => role.user === undefined);
	}
};

/* fetches the policies for the chosen template and sets the policies in the formik form to those policies */
export const handleTemplateChange = async <T extends { policies: TransformedAcl[], aclTemplate: string }>(
	templateId: string,
	formik: FormikProps<T>,
	dispatch: AppDispatch,
	aclDefaults: { [key: string]: string } | undefined,
	defaultUser?: UserInfoState,
) => {
	// fetch information about chosen template from backend
	let template = await fetchAclTemplateById(templateId);
	// fetch user info
	const users = await fetchUsersForTemplate(template.map(role => role.role));

	// Add user info to applicable roles
	template = template.map(acl => {
		if (users && users[acl.role]) {
			acl.user = {
				username: users[acl.role].username,
				name: users[acl.role].name,
				email: users[acl.role].email,
			};
		}

		return acl;
	});

	// always add current user to acl since template could lock the user out
	if (defaultUser) {
		template = template.concat({
			role: defaultUser.userRole,
			read: true,
			write: true,
			actions: [],
			user: {
				username: defaultUser.user.username,
				name: defaultUser.user.name,
				email: defaultUser.user.email,
			},
		});
	}

	// If configured, keep roles that match the configured prefix
	if (aclDefaults && aclDefaults["keep_on_template_switch_role_prefixes"]) {
		const prefixString = aclDefaults["keep_on_template_switch_role_prefixes"];
		const prefixes = prefixString.split(",");
		for (const policy of formik.values.policies) {
			if (prefixes.some(prefix => policy.role.startsWith(prefix)) && !template.find(acl => acl.role === policy.role)) {
				template.push(policy);
			}
		}
	}

	formik.setFieldValue("policies", template);
	formik.setFieldValue("aclTemplate", templateId);
	// Is this necessary?
	await dispatch(checkAcls(formik.values.policies));
};
