import { useState } from "react";
import { Formik } from "formik";
import AclAccessPage from "../wizard/AclAccessPage";
import AclMetadataPage from "../wizard/AclMetadataPage";
import { getAclDetails } from "../../../../selectors/aclDetailsSelectors";
import { NewAclSchema } from "../../../../utils/validate";
import ModalNavigation from "../../../shared/modals/ModalNavigation";
import { checkAcls } from "../../../../slices/aclSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { TransformedAcl, updateAclDetails } from "../../../../slices/aclDetailsSlice";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { ParseKeys } from "i18next";

/**
 * This component manages the pages of the acl details modal
 */
const AclDetails = ({
	close,
} : {
	close: () => void,
}) => {
	const dispatch = useAppDispatch();

	const [page, setPage] = useState(0);

	const aclDetails = useAppSelector(state => getAclDetails(state));

	// set initial values
	const initialValues = {
		name: aclDetails.name,
		aclTemplate: "",
		policies: aclDetails.acl,
	};

	// information about tabs
	const tabs: {
		tabTranslation: ParseKeys,
		accessRole: string,
		name: string,
	}[] = [
		{
			tabTranslation: "USERS.ACLS.DETAILS.TABS.METADATA",
			accessRole: "ROLE_UI_ACLS_EDIT",
			name: "metadata",
		},
		{
			tabTranslation: "USERS.ACLS.DETAILS.TABS.ACCESS",
			accessRole: "ROLE_UI_ACLS_EDIT",
			name: "access",
		},
	];

	const openTab = (tabNr: number) => {
		setPage(tabNr);
	};

	const handleSubmit = (
		values: {
			name: string,
			policies: TransformedAcl[],
		},
	) => {
		dispatch(updateAclDetails({ values: values, aclId: aclDetails.id }));
		close();
	};

	return (
		<>
			{/* Navigation */}
			<ModalNavigation tabInformation={tabs} openTab={openTab} page={page} />

			{/* formik form used in entire modal */}
			<Formik
				initialValues={initialValues}
				validationSchema={NewAclSchema["metadata"]}
				onSubmit={values => handleSubmit(values)}
			>
				{formik => (
					<>
						{page === 0 && <AclMetadataPage formik={formik} isEdit />}
						{page === 1 && (
							<AclAccessPage
								formik={formik}
								isEdit
							/>
						)}

						{/* Navigation buttons and validation */}
						<WizardNavigationButtons
							formik={formik}
							previousPage={close}
							submitPage={
								async () => {
									if (await dispatch(checkAcls(formik.values.policies))) {
										formik.handleSubmit();
									}
								}
							}
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

export default AclDetails;
