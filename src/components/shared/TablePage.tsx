import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table, { TemplateMap } from "../shared/Table";
import Notifications from "../shared/Notifications";
import { fetchFilters } from "../../slices/tableFilterSlice";
import { CreateType, NavBarLink } from "../NavBar";
import { AppThunk, RootState, useAppDispatch, useAppSelector } from "../../store";
import { resetTableProperties, Resource } from "../../slices/tableSlice";
import { AsyncThunk } from "@reduxjs/toolkit";
import { ParseKeys } from "i18next";
import { useLocation } from "react-router";
import MainPage from "./MainPage";

/**
 * This component renders a generic page with a table
 */
const TablePage = ({
	resource,
	fetchResource,
	loadResourceIntoTable,
	getTotalResources,
	navBarLinks,
	navBarCreate,
	caption,
	templateMap,
	navBarChildren,
	children,
}: {
	resource: Resource
	fetchResource: AsyncThunk<any, void, any>,
	loadResourceIntoTable: () => AppThunk,
	getTotalResources: (state: RootState) => number,
	navBarLinks: NavBarLink[]
	navBarCreate?: CreateType
	navBarChildren?: ReactNode
	caption: ParseKeys
	templateMap: TemplateMap
	children?: ReactNode
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const location = useLocation();

	const numberOfRows = useAppSelector(state => getTotalResources(state));

	useEffect(() => {
		// State variable for interrupting the load function
		let allowLoadIntoTable = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		dispatch(fetchFilters(resource));

		// Load resource on mount
		const loadResource = async () => {
			// Fetching resources from server
			await dispatch(fetchResource());

			// Load resources into table
			if (allowLoadIntoTable) {
				dispatch(loadResourceIntoTable());
			}
		};
		loadResource();

		// Fetch resources every minute
		const fetchResourceInterval = setInterval(loadResource, 5000);

		return () => {
			allowLoadIntoTable = false;
			clearInterval(fetchResourceInterval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.hash]);

	return (
		<MainPage
			navBarLinks={navBarLinks}
			navBarCreate={navBarCreate}
			navBarChildren={navBarChildren}
		>
				{/* Include notifications component */}
				<Notifications context={"other"}/>

				<div className="controls-container">
					<div className="filters-container">
						{children}

						{/* Include filters component */}
						<TableFilters
							loadResource={fetchResource}
							loadResourceIntoTable={loadResourceIntoTable}
							resource={resource}
						/>
					</div>
					<h1>{t(caption)}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows })}</h4>
				</div>
				{/* Include table component */}
				<Table templateMap={templateMap} />
		</MainPage>
	);
};

export default TablePage;
