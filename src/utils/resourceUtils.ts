import { getFilters, getTextFilter } from "../selectors/tableFilterSelectors";
import {
	getPageLimit,
	getPageOffset,
	getTableDirectionForResource,
	getTableSortingForResource,
} from "../selectors/tableSelectors";
import { TransformedAcl } from "../slices/aclDetailsSlice";
import { Acl } from "../slices/aclSlice";
import { NewUser } from "../slices/userSlice";
import { Recording } from "../slices/recordingSlice";
import { UserInfoState } from "../slices/userInfoSlice";
import { hasAccess, isJson } from "./utils";
import { RootState } from "../store";
import { MetadataCatalog, MetadataField } from "../slices/eventSlice";
import { initialFormValuesNewGroup } from "../configs/modalConfig";
import { UpdateUser } from "../slices/userDetailsSlice";
import { ParseKeys, TFunction } from "i18next";
import { TableState } from "../slices/tableSlice";

/**
 * This file contains methods that are needed in more than one resource thunk
 */

// prepare http headers for posting to resources
export const getHttpHeaders = () => {
	return {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	};
};

// prepare URL params for getting resources
export const getURLParams = (
	state: RootState,
	resource: TableState["resource"],
) => {
	// get filter map from state
	const filters = [];
	const filterMap = getFilters(state, resource);
	const textFilter = getTextFilter(state, resource);

	// check if textFilter has value and transform for use as URL param
	if (textFilter !== "") {
		filters.push(["textFilter", textFilter]);
	}
	// transform filters for use as URL param
	for (const [key, _] of filterMap.entries()) {
		if (filterMap[key].value) {
			filters.push([filterMap[key].name, filterMap[key].value.toString()]);
		}
	}

	let params: {
		limit: number,
		offset: number,
		filter?: string,
		sort?: string,
	} = {
		limit: getPageLimit(state),
		offset: getPageOffset(state) * getPageLimit(state),
	};

	if (filters.length) {
		params = {
			...params,
			filter: filters
				.map(([key, value]) => `${key}:${encodeURIComponent(value)}`)
				.join(","),
		};
	}

	if (getTableSortingForResource(state, resource)) {
		params = {
			...params,
			sort: getTableSortingForResource(state, resource)
				+ ":"
				+ getTableDirectionForResource(state, resource),
		};
	}

	return params;
};

// used for create URLSearchParams for API requests used to create/update user
export const buildUserBody = (values: NewUser | UpdateUser) => {
	const data = new URLSearchParams();
	// fill form data with user inputs
	data.append("username", values.username);
	if (values.name) {
		data.append("name", values.name);
	}
	if (values.email) {
		data.append("email", values.email);
	}
	if (values.password) {
		data.append("password", values.password);
	}
	if (values.roles) {
		data.append("roles", JSON.stringify(values.roles));
	}

	return data;
};

// used for create URLSearchParams for API requests used to create/update group
export const buildGroupBody = (
	values: typeof initialFormValuesNewGroup,
) => {
	const roles = [],
		users = [];

	// fill form data depending on user inputs
	const data = new URLSearchParams();
	data.append("name", values.name);
	data.append("description", values.description);

	for (let i = 0; i < values.roles.length; i++) {
		roles.push(values.roles[i].name);
	}
	for (let i = 0; i < values.users.length; i++) {
		users.push(values.users[i].id);
	}
	data.append("roles", roles.join(","));
	data.append("users", users.join(","));

	return data;
};

// get initial metadata field values for formik in create resources wizards
export const getInitialMetadataFieldValues = (
	metadataCatalog: MetadataCatalog,
) => {
	const initialValues: { [key: string]: string | string[] | boolean } = {};

	if (!!metadataCatalog.fields && metadataCatalog.fields.length > 0) {
		metadataCatalog.fields.forEach(field => {
			initialValues[metadataCatalog.flavor + "_" + field.id] = field.value;
		});
	}

	return initialValues;
};

// transform collection of metadata into object with name and value
export const transformMetadataCollection = (metadata: MetadataCatalog) => {
	transformMetadataFields(metadata.fields);
	return metadata;
};

export const transformMetadataFields = (metadata: MetadataField[]) => {
	for (const field of metadata) {
		if (field.collection) {
			field.collection = Object.entries(field.collection)
				.map(([key, value]) => {
					if (isJson(key)) {
						// TODO: Handle JSON parsing errors
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						const collectionParsed = JSON.parse(key);
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
							name: collectionParsed.label || key,
							value,
							...collectionParsed,
						};
					} else {
						return {
							name: key,
							value: value,
						};
					}
				});
		}
	}
	return metadata;
};

// transform metadata catalog for update via post request
export const transformMetadataForUpdate = (catalog: MetadataCatalog, values: { [key: string]: MetadataCatalog["fields"][0]["value"] }) => {
	const fields: MetadataCatalog["fields"] = [];
	const updatedFields: MetadataCatalog["fields"] = [];

	catalog.fields.forEach(field => {
		if (field.value !== values[field.id]) {
			const updatedField = {
				...field,
				value: values[field.id],
			};
			updatedFields.push(updatedField);
			fields.push(updatedField);
		} else {
			fields.push({ ...field });
		}
	});
	const data = new URLSearchParams();
	data.append(
		"metadata",
		JSON.stringify([
			{
				flavor: catalog.flavor,
				title: catalog.title,
				fields: updatedFields,
			},
		]),
	);
	const headers = getHttpHeaders();

	return { fields, data, headers };
};

// Prepare metadata for post of new events or series
export const prepareMetadataFieldsForPost = (
	metadataCatalogs: MetadataCatalog[],
	values: { [key: string]: unknown },
) => {
	const preparedMetadataCatalogs = [];

	for (const catalog of metadataCatalogs) {
		const catalogPrefix = catalog.flavor + "_";

		type FieldValue = {
			id: string,
			type: string,
			value: unknown,
			$$hashKey?: string,
			translatable?: boolean,
		}
		let metadataFields: FieldValue[] = [];

		// fill metadataField with field information send by server previously and values provided by user
		for (const [, info] of catalog.fields.entries()) {
			let fieldValue: FieldValue = {
				id: info.id,
				type: info.type,
				value: values[catalogPrefix + info.id],
				$$hashKey: "object:123",
			};
			if (info.translatable) {
				fieldValue = {
					...fieldValue,
					translatable: info.translatable,
				};
			}
			metadataFields = metadataFields.concat(fieldValue);
		}

		const metadataCatalog = {
			flavor: catalog.flavor,
			title: catalog.title,
			fields: metadataFields,
		};

		preparedMetadataCatalogs.push(metadataCatalog);
	}

	return preparedMetadataCatalogs;
};

// returns the name for a field value from the collection
export const getMetadataCollectionFieldName = (metadataField: { collection?: { [key: string]: unknown }[] }, field: { value: unknown }, t: TFunction): string => {
	try {
		if (metadataField.collection) {
			const collectionField = metadataField.collection.find(
				element => element.value === field.value,
			);

			if (collectionField && collectionField.name && isJson(collectionField.name as string)) {
				// TODO: Handle JSON parsing errors
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const name: { label?: ParseKeys } = JSON.parse(collectionField.name as string);
				return name.label ? t(name.label) : "";
			}

			return collectionField ? t(collectionField.name as ParseKeys) : "";
		}

		return "";
	} catch (_e) {
		return "";
	}
};

// Prepare rules of access policies for post of new events or series
export const prepareAccessPolicyRulesForPost = (policies: TransformedAcl[]) => {
	// access policies for post request
	const access : {
		acl : Acl
	} = {
		acl: {
			ace: [],
		},
	};

	// iterate through all policies provided by user and transform them into form required for request
	for (let i = 0; policies.length > i; i++) {
		if (policies[i].read) {
			access.acl.ace = access.acl.ace.concat({
				action: "read",
				allow: policies[i].read,
				role: policies[i].role,
			});
		}
		if (policies[i].write) {
			access.acl.ace = access.acl.ace.concat({
				action: "write",
				allow: policies[i].write,
				role: policies[i].role,
			});
		}
		if (policies[i].actions.length > 0) {
			for (let j = 0; policies[i].actions.length > j; j++) {
				access.acl.ace = access.acl.ace.concat({
					action: policies[i].actions[j],
					allow: true,
					role: policies[i].role,
				});
			}
		}
	}

	return access;
};

// transform response data in form that is used in wizards and modals for policies (for each role one entry)
export const transformAclTemplatesResponse = (acl: Acl) => {
	let template: TransformedAcl[] = [];

	for (let i = 0; acl.ace.length > i; i++) {
		if (template.find(rule => rule.role === acl.ace[i].role)) {
			for (let j = 0; template.length > j; j++) {
				// Only update entry for policy if already added with other action
				if (template[j].role === acl.ace[i].role) {
					if (acl.ace[i].action === "read") {
						template[j] = {
							...template[j],
							read: acl.ace[i].allow,
						};
						break;
					}
					if (acl.ace[i].action === "write") {
						template[j] = {
							...template[j],
							write: acl.ace[i].allow,
						};
						break;
					}
					if (
						acl.ace[i].action !== "read" &&
						acl.ace[i].action !== "write" &&
						acl.ace[i].allow === true
					) {
						template[j] = {
							...template[j],
							actions: template[j].actions.concat(acl.ace[i].action),
						};
						break;
					}
				}
			}
		} else {
			// add policy if role not seen before
			if (acl.ace[i].action === "read") {
				template = template.concat({
					role: acl.ace[i].role,
					read: acl.ace[i].allow,
					write: false,
					actions: [],
				});
			}
			if (acl.ace[i].action === "write") {
				template = template.concat({
					role: acl.ace[i].role,
					read: false,
					write: acl.ace[i].allow,
					actions: [],
				});
			}
			if (
				acl.ace[i].action !== "read" &&
				acl.ace[i].action !== "write" &&
				acl.ace[i].allow === true
			) {
				template = template.concat({
					role: acl.ace[i].role,
					read: false,
					write: false,
					actions: [acl.ace[i].action],
				});
			}
		}
	}

	return template;
};

// filter devices, so that only devices for which the user has access rights are left
export const filterDevicesForAccess = (user: UserInfoState, inputDevices: Recording[]) => {
	if (user.isOrgAdmin) {
		return inputDevices;
	} else {
		const devicesWithAccessRights = [];
		for (const device of inputDevices) {
			const inputDeviceAccessRole =
				"ROLE_CAPTURE_AGENT_" +
				device.id.replace(/[^a-zA-Z0-9_]/g, "").toUpperCase();
			if (hasAccess(inputDeviceAccessRole, user)) {
				devicesWithAccessRights.push(device);
			}
		}

		return devicesWithAccessRights;
	}
};

// returns, whether user has access rights for any inputDevices
export const hasAnyDeviceAccess = (user: UserInfoState, inputDevices: Recording[]) => {
	return filterDevicesForAccess(user, inputDevices).length > 0;
};

// returns, whether user has access rights for a specific inputDevice
export const hasDeviceAccess = (user: UserInfoState, deviceId: Recording["id"]) => {
	if (user.isOrgAdmin) {
		return true;
	} else {
		const inputDeviceAccessRole =
			"ROLE_CAPTURE_AGENT_" +
			deviceId.replace(/[^a-zA-Z0-9_]/g, "").toUpperCase();
		return hasAccess(inputDeviceAccessRole, user);
	}
};

// build body for post/put request in theme context
export const buildThemeBody = (values: {
	name: string,
	description: string,
	bumperActive: boolean,
	bumperFile: string,
	trailerActive: boolean,
	trailerFile: string,
	titleSlideActive: boolean,
	titleSlideMode: string,
	titleSlideBackground: string,
	licenseSlideActive: boolean,
	watermarkActive: boolean,
	watermarkFile: string,
	watermarkPosition: string,
}) => {
	// fill form data depending on user inputs
	const data = new URLSearchParams();
	data.append("name", values.name);
	data.append("description", values.description);
	data.append("bumperActive", values.bumperActive.toString());
	if (values.bumperActive) {
		data.append("bumperFile", values.bumperFile);
	}
	data.append("trailerActive", values.trailerActive.toString());
	if (values.trailerActive) {
		data.append("trailerFile", values.trailerFile);
	}
	data.append("titleSlideActive", values.titleSlideActive.toString());
	if (values.titleSlideActive && values.titleSlideMode === "upload") {
		data.append("titleSlideBackground", values.titleSlideBackground);
	}
	data.append("licenseSlideActive", values.licenseSlideActive.toString());
	data.append("watermarkActive", values.watermarkActive.toString());
	if (values.watermarkActive) {
		data.append("watermarkFile", values.watermarkFile);
		data.append("watermarkPosition", values.watermarkPosition);
	}

	return data;
};

// creates an empty policy with the role from the argument
export const createPolicy = (role: string): TransformedAcl => {
	return {
		role: role,
		read: false,
		write: false,
		actions: [],
	};
};
