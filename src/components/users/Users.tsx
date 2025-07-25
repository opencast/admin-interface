import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import { usersTemplateMap } from "../../configs/tableConfigs/usersTableMap";
import { getTotalUsers } from "../../selectors/userSelectors";
import {
	loadUsersIntoTable,
} from "../../thunks/tableThunks";
import { fetchFilters } from "../../slices/tableFilterSlice";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUsers } from "../../slices/userSlice";
import { usersLinks } from "./partials/UsersNavigation";
import { resetTableProperties } from "../../slices/tableSlice";

/**
 * This component renders the table view of users
 */
const Users = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [displayNavigation, setNavigation] = useState(false);

	const users = useAppSelector(state => getTotalUsers(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters("users"));

		// Load users on mount
		const loadUsers = async () => {
			// Fetching users from server
			await dispatch(fetchUsers());

			// Load users into table
			if (allowLoadIntoTable) {
				dispatch(loadUsersIntoTable());
			}
		};
		loadUsers();

		// Fetch users every minute
		const fetchUsersInterval = setInterval(loadUsers, 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchUsersInterval);
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
					accessRole: "ROLE_UI_USERS_CREATE",
					text: "USERS.ACTIONS.ADD_USER",
					resource: "user",
				}}
			/>

			<MainView open={displayNavigation}>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					{/* Include filters component */}
					<TableFilters
						loadResource={fetchUsers}
						loadResourceIntoTable={loadUsersIntoTable}
						resource={"users"}
					/>
					<h1>{t("USERS.USERS.TABLE.CAPTION")}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows: users })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={usersTemplateMap} />
			</MainView>
			<Footer />
		</>
	);
};

export default Users;
