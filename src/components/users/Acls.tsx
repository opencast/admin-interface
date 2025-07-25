import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import { aclsTemplateMap } from "../../configs/tableConfigs/aclsTableMap";
import { fetchFilters } from "../../slices/tableFilterSlice";
import {
	loadAclsIntoTable,
} from "../../thunks/tableThunks";
import { getTotalAcls } from "../../selectors/aclSelectors";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAcls } from "../../slices/aclSlice";
import { usersLinks } from "./partials/UsersNavigation";
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of acls
 */
const Acls = () => {
	const { t } = useTranslation();
	const [displayNavigation, setNavigation] = useState(false);

	const dispatch = useAppDispatch();
	const acls = useAppSelector(state => getTotalAcls(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("acls"));

		// Load acls on mount
		const loadAcls = async () => {
			// Fetching acls from server
			await dispatch(fetchAcls());

			// Load acls into table
			if (allowLoadIntoTable) {
				dispatch(loadAclsIntoTable());
			}
		};
		loadAcls();

		// Fetch Acls every minute
		const fetchAclInterval = setInterval(loadAcls, 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchAclInterval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				links={usersLinks}
				create={{
					accessRole: "ROLE_UI_ACLS_CREATE",
					text: "USERS.ACTIONS.ADD_ACL",
					resource: "acl",
				}}
			/>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					{/* Include filters component */}
					<TableFilters
						loadResource={fetchAcls}
						loadResourceIntoTable={loadAclsIntoTable}
						resource={"acls"}
					/>
					<h1>{t("USERS.ACLS.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: acls })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={aclsTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Acls;
