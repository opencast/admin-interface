import { useEffect, useState } from "react";
import ModalNavigation from "../../../shared/modals/ModalNavigation";
import { getLifeCyclePolicyDetails } from "../../../../selectors/lifeCycleDetailsSelectors";
import LifeCyclePolicyGeneralTab from "../ModalTabsAndPages/LifeCyclePolicyGeneralTab";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { fetchLifeCyclePolicyActions, fetchLifeCyclePolicyTargetTypes, fetchLifeCyclePolicyTimings } from "../../../../slices/lifeCycleDetailsSlice";
import { ParseKeys } from "i18next";

/**
 * This component manages the tabs of the series details modal
 */
const LifeCyclePolicyDetails = ({
	_policyId,
	_policyChanged,
	_setPolicyChanged,
}: {
	_policyId: string
	_policyChanged: boolean
	_setPolicyChanged: (policyChanged: boolean) => void
}) => {
	const [page, setPage] = useState(0);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		dispatch(fetchLifeCyclePolicyActions());
		dispatch(fetchLifeCyclePolicyTargetTypes());
		dispatch(fetchLifeCyclePolicyTimings());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const policy = useAppSelector(state => getLifeCyclePolicyDetails(state));

	// information about tabs
	const tabs: {
		tabTranslation: ParseKeys,
		accessRole: string,
		name: string,
	}[] = [
		{
			tabTranslation: "LIFECYCLE.POLICIES.DETAILS.TAB.GENERAL",
			accessRole: "ROLE_UI_LIFECYCLEPOLICIES_DETAILS_GENERAL_VIEW",
			name: "general",
		},
		// Policies are currently only accessible to admins and the ACLs don't do
		// anything, so we don't show them.
		// {
		// 	tabTranslation: "LIFECYCLE.POLICIES.DETAILS.TAB.ACCESSPOLICIES",
		// 	accessRole: "ROLE_UI_LIFECYCLEPOLICIES_DETAILS_ACCESSPOLICIES_VIEW",
		// 	name: "Access Policies",
		// },
	];

	const openTab = (tabNr: number) => {
		setPage(tabNr);
	};

	return (
		<>
			{/* Navigation */}
			<ModalNavigation tabInformation={tabs} page={page} openTab={openTab} />

			<div>
				{page === 0 && <LifeCyclePolicyGeneralTab policy={policy} />}
				{/* {page === 1 &&
					<LifeCyclePolicyDetailsAccessTab
						seriesId={policyId}
						header={tabs[page].tabTranslation}
						policyChanged={policyChanged}
						setPolicyChanged={setPolicyChanged}
					/>
				} */}
			</div>
		</>
	);
};

export default LifeCyclePolicyDetails;
