import { useEffect } from "react";
import ResourceDetailsAccessPolicyTab from "../../../shared/modals/ResourceDetailsAccessPolicyTab";
import { getPolicyTemplateId, getSeriesDetailsAcl } from "../../../../selectors/seriesDetailsSelectors";
import {
	fetchSeriesDetailsAcls,
	updateSeriesAccess,
} from "../../../../slices/seriesDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { ParseKeys } from "i18next";

/**
 * This component manages the access policy tab of the series details modal
 */
const SeriesDetailsAccessTab = ({
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

	const policies = useAppSelector(state => getSeriesDetailsAcl(state));
	const policyTemplateId = useAppSelector(state => getPolicyTemplateId(state));

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ResourceDetailsAccessPolicyTab
			resourceId={seriesId}
			header={header}
			buttonText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.LABEL"}
			descriptionText={"EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.DESCRIPTION"}
			policies={policies}
			policyTemplateId={policyTemplateId}
			fetchAccessPolicies={fetchSeriesDetailsAcls}
			saveNewAccessPolicies={updateSeriesAccess}
			policyTableHeaderText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.NON_USER_ROLES"}
			policyTableRoleText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.ROLE"}
			policyTableNewText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.NEW"}
			userPolicyTableHeaderText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.USERS"}
			userPolicyTableRoleText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.USER"}
			userPolicyTableNewText={"EVENTS.SERIES.DETAILS.ACCESS.ACCESS_POLICY.NEW_USER"}
			editAccessRole={"ROLE_UI_SERIES_DETAILS_ACL_EDIT"}
			viewUsersAccessRole={"ROLE_UI_SERIES_DETAILS_ACL_USER_ROLES_VIEW"}
			viewNonUsersAccessRole={"ROLE_UI_SERIES_DETAILS_ACL_NONUSER_ROLES_VIEW"}
			policyChanged={policyChanged}
			setPolicyChanged={setPolicyChanged}
			withOverrideButton={true}
		/>
	);
};

export default SeriesDetailsAccessTab;
