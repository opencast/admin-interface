import React, { useState } from "react";
import { Formik } from "formik";
import GroupMetadataPage from "../wizard/GroupMetadataPage";
import GroupRolesPage from "../wizard/GroupRolesPage";
import GroupUsersPage from "../wizard/GroupUsersPage";
import { EditGroupSchema } from "../../../../utils/validate";
import { getGroupDetails } from "../../../../selectors/groupDetailsSelectors";
import ModalNavigation from "../../../shared/modals/ModalNavigation";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { UpdateGroupDetailsState, updateGroupDetails } from "../../../../slices/groupDetailsSlice";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { ParseKeys } from "i18next";

/**
 * This component manages the pages of the group details
 */
const GroupDetails: React.FC<{
	close: () => void
}> = ({
	close,
}) => {
	const dispatch = useAppDispatch();

	const groupDetails = useAppSelector(state => getGroupDetails(state));

	const [page, setPage] = useState(0);

	// Since we are using the initialValues to be consumed by SelectContainer via Formik later on,
	// we should not use useState because the asynchronous nature! which has no use here,
	// and in fact prevents the "roles" to get the data properly!
	const initialValues = {
	...groupDetails,
	roles: groupDetails.roles
		.filter(role => !role.startsWith("ROLE_GROUP"))
		.map(role => ({ name: role })),
	};

	// information about tabs
	const tabs: {
		tabTranslation: ParseKeys
		accessRole: string
		name: string
	}[] = [
		{
			tabTranslation: "USERS.GROUPS.DETAILS.TABS.GROUP",
			accessRole: "ROLE_UI_GROUPS_EDIT",
			name: "group",
		},
		{
			tabTranslation: "USERS.GROUPS.DETAILS.TABS.ROLES",
			accessRole: "ROLE_UI_GROUPS_EDIT",
			name: "roles",
		},
		{
			tabTranslation: "USERS.GROUPS.DETAILS.TABS.USERS",
			accessRole: "ROLE_UI_GROUPS_EDIT",
			name: "users",
		},
	];

	const openTab = (tabNr: number) => {
		setPage(tabNr);
	};

	const handleSubmit = (values: UpdateGroupDetailsState) => {
		dispatch(updateGroupDetails({ values: values, groupId: groupDetails.id }));
		close();
	};

	return (
		<>
			{/* Navigation */}
			<ModalNavigation tabInformation={tabs} page={page} openTab={openTab} />

			{/* formik form used in entire modal */}
			<Formik
				initialValues={initialValues}
				validationSchema={EditGroupSchema}
				onSubmit={values => handleSubmit(values)}
			>
				{formik => (
					<>
						{page === 0 && <GroupMetadataPage formik={formik} isEdit />}
						{page === 1 && <GroupRolesPage formik={formik} isEdit />}
						{page === 2 && <GroupUsersPage formik={formik} isEdit />}

						{/* Navigation buttons and validation */}
						<WizardNavigationButtons
							formik={formik}
							previousPage={close}
							createTranslationString="SUBMIT"
							cancelTranslationString="CANCEL"
							isLast
						/>
					</>
				)}
			</Formik>
		</>
	);
};

export default GroupDetails;
