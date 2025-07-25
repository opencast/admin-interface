import { getPolicies, getPolicyTemplateId } from "../../../../selectors/eventDetailsSelectors";
import ResourceDetailsAccessPolicyTab from "../../../shared/modals/ResourceDetailsAccessPolicyTab";
import { useAppSelector } from "../../../../store";
import {
	fetchAccessPolicies,
	fetchHasActiveTransactions,
	saveAccessPolicies,
} from "../../../../slices/eventDetailsSlice";
import { ParseKeys } from "i18next";

/**
 * This component manages the access policy tab of the event details modal
 */
const EventDetailsAccessPolicyTab = ({
	eventId,
	header,
	policyChanged,
	setPolicyChanged,
}: {
	eventId: string,
	header: ParseKeys,
	policyChanged: boolean,
	setPolicyChanged: (value: boolean) => void,
}) => {
	const policies = useAppSelector(state => getPolicies(state));
	const policyTemplateId = useAppSelector(state => getPolicyTemplateId(state));

	return (
		<ResourceDetailsAccessPolicyTab
			resourceId={eventId}
			header={header}
			buttonText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.LABEL"}
			policies={policies}
			policyTemplateId={policyTemplateId}
			fetchAccessPolicies={fetchAccessPolicies}
			fetchHasActiveTransactions={fetchHasActiveTransactions}
			saveNewAccessPolicies={saveAccessPolicies}
			descriptionText={"EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.DESCRIPTION"}
			policyTableHeaderText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NON_USER_ROLES"}
			policyTableRoleText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ROLE"}
			policyTableNewText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW"}
			userPolicyTableHeaderText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.USERS"}
			userPolicyTableRoleText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.USER"}
			userPolicyTableNewText={"EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.NEW_USER"}
			editAccessRole={"ROLE_UI_EVENTS_DETAILS_ACL_EDIT"}
			viewUsersAccessRole={"ROLE_UI_EVENTS_DETAILS_ACL_USER_ROLES_VIEW"}
			viewNonUsersAccessRole={"ROLE_UI_EVENTS_DETAILS_ACL_NONUSER_ROLES_VIEW"}
			policyChanged={policyChanged}
			setPolicyChanged={setPolicyChanged}
		/>
	);
};

export default EventDetailsAccessPolicyTab;
