import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table, { TemplateMap } from "../shared/Table";
import Notifications from "../shared/Notifications";
import { CreateType, NavBarLink } from "../NavBar";
import { RootState, useAppDispatch, useAppSelector } from "../../store";
import { Resource, Row, tableClosed, tableOpened } from "../../slices/tableSlice";
import { ParseKeys } from "i18next";
import { useLocation } from "react-router";
import MainPage from "./MainPage";

/**
 * This component renders a generic page with a table
 */
const TablePage = <T extends Row, >({
	resource,
	getTotalResources,
	navBarLinks,
	navBarCreate,
	caption,
	templateMap,
	navBarChildren,
	children,
}: {
	resource: Resource
	getTotalResources: (state: RootState) => number,
	navBarLinks: NavBarLink[]
	navBarCreate?: CreateType
	navBarChildren?: ReactNode
	caption: ParseKeys
	templateMap: TemplateMap<T>
	children?: ReactNode
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const location = useLocation();

	const numberOfRows = useAppSelector(state => getTotalResources(state));

	useEffect(() => {
		// Loading and refreshing the resource is handled by the table listener
		dispatch(tableOpened(resource));

		return () => {
			dispatch(tableClosed());
		};
	}, [location.hash, resource, dispatch]);

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
							resource={resource}
						/>
					</div>
					<h1>{t(caption)}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows })}</h4>
				</div>
				{/* Include table component */}
				<Table
					resource={resource}
					templateMap={templateMap}
				/>
		</MainPage>
	);
};

export default TablePage;
