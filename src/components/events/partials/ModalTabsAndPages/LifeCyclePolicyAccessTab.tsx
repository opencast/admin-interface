import { useEffect } from "react";
import ResourceDetailsAccessPolicyTab from "../../../shared/modals/ResourceDetailsAccessPolicyTab";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getLifeCyclePolicyDetailsAcl } from "../../../../selectors/lifeCycleDetailsSelectors";
import { fetchLifeCyclePolicyDetailsAcls, updateLifeCyclePolicyAccess } from "../../../../slices/lifeCycleDetailsSlice";
import { ParseKeys } from "i18next";

/**
 * This component manages the access policy tab of the series details modal
 */
const LifeCyclePolicyDetailsAccessTab = ({
	seriesId,
	header,
	policyChanged,
	setPolicyChanged,
}: {
	seriesId: string,
	header: ParseKeys,
	policyChanged: boolean,
	setPolicyChanged: (value: boolean) => void,
}) => {
	const dispatch = useAppDispatch();

	const acl = useAppSelector(state => getLifeCyclePolicyDetailsAcl(state));

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ResourceDetailsAccessPolicyTab
			resourceId={seriesId}
			header={header}
			buttonText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.LABEL"}
			policies={acl}
			policyTemplateId={0}	// TODO: Improve?
			fetchAccessPolicies={fetchLifeCyclePolicyDetailsAcls}
			// @ts-expect-error: TODO: Figure out why typescript is being funky here
			saveNewAccessPolicies={updateLifeCyclePolicyAccess}
			descriptionText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.DESCRIPTION"}
			policyTableHeaderText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.NON_USER_ROLES"}
			policyTableRoleText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.ROLE"}
			policyTableNewText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.NEW"}
			userPolicyTableHeaderText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.USERS"}
			userPolicyTableRoleText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.USER"}
			userPolicyTableNewText={"LIFECYCLE.POLICIES.DETAILS.ACCESS.NEW_USER"}
			editAccessRole={"ROLE_UI_LIFECYCLEPOLICY_DETAILS_ACL_EDIT"}
			policyChanged={policyChanged}
			setPolicyChanged={setPolicyChanged}
		/>
	);
};

export default LifeCyclePolicyDetailsAccessTab;
