import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import { loadLifeCyclePoliciesIntoTable } from "../../thunks/tableThunks";
import { fetchFilters } from "../../slices/tableFilterSlice";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { getTotalLifeCyclePolicies } from "../../selectors/lifeCycleSelectors";
import {
	fetchLifeCyclePolicies,
	LifeCyclePolicy as LifeCyclePolicyRow,
} from "../../slices/lifeCycleSlice";
import { lifeCyclePoliciesTemplateMap } from "../../configs/tableConfigs/lifeCyclePoliciesTableMap";
import { fetchLifeCyclePolicyActions, fetchLifeCyclePolicyTargetTypes, fetchLifeCyclePolicyTimings } from "../../slices/lifeCycleDetailsSlice";
import { ModalHandle } from "../shared/modals/Modal";
import { eventsLinks } from "./partials/EventsNavigation";
import { resetTableProperties, Row } from "../../slices/tableSlice";
import LifeCyclePolicyDetailsModal from "./partials/modals/LifeCyclePolicyDetailsModal";

/**
 * This component renders the table view of policies
 */
const LifeCyclePolicies = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [displayNavigation, setNavigation] = useState(false);
	const newPolicyModalRef = useRef<ModalHandle>(null);

	const policiesTotal = useAppSelector(state => getTotalLifeCyclePolicies(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("lifeCyclePolicies"));

		// Load policies on mount
		const loadLifeCyclePolicies = async () => {
			// Fetching policies from server
			await dispatch(fetchLifeCyclePolicies());

			// Load policies into table
			if (allowLoadIntoTable) {
				dispatch(loadLifeCyclePoliciesIntoTable());
			}
		};
		loadLifeCyclePolicies();

		// Fetch policies repeatedly
		const fetchInterval = setInterval(() => { loadLifeCyclePolicies(); }, 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchInterval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const showNewPolicyModal = async () => {
		await dispatch(fetchLifeCyclePolicyActions());
		await dispatch(fetchLifeCyclePolicyTargetTypes());
		await dispatch(fetchLifeCyclePolicyTimings());

		newPolicyModalRef.current?.open();
	};

	return (
		<>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				navAriaLabel={"EVENTS.EVENTS.NAVIGATION.LABEL"}
				links={
					eventsLinks
				}
				create={{
					accessRole: "ROLE_UI_EVENTS_CREATE",
					onShowModal: showNewPolicyModal,
					text: "LIFECYCLE.POLICIES.TABLE.ADD_POLICY",
					resource: "lifecyclepolicy",
				}}
			>
			</NavBar>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					{/* Include filters component */}
					{/* LifeCycle policies are not indexed, can't search or filter them */}
					{/* But if we don't include this component, the policies won't load on page load, because the first
							fetch request we send to the backend contains invalid params >.> */}
					<TableFilters
						loadResource={fetchLifeCyclePolicies}
						loadResourceIntoTable={loadLifeCyclePoliciesIntoTable}
						resource={"lifeCyclePolicies"}
					/>

					<h1>{t("LIFECYCLE.POLICIES.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: policiesTotal })}</h4>
				</div>
				{/* Include table component */}
				<Table<Row & LifeCyclePolicyRow>
					templateMap={lifeCyclePoliciesTemplateMap}
					fetchResource={fetchLifeCyclePolicies}
					loadResourceIntoTable={loadLifeCyclePoliciesIntoTable}
				/>
			</MainView>
			<Footer />

			{/* Include table modal */}
			<LifeCyclePolicyDetailsModal />
		</>
	);
};

export default LifeCyclePolicies;
