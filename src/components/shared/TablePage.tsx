import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table, { TemplateMap } from "../shared/Table";
import Notifications from "../shared/Notifications";
import { CreateType, NavBarLink } from "../NavBar";
import { AppThunk, RootState, useAppSelector } from "../../store";
import { Resource, Row } from "../../slices/tableSlice";
import { ParseKeys } from "i18next";
import MainPage from "./MainPage";
import { GenericAsyncThunk } from "../../utils/utils";

/**
 * This component renders a generic page with a table
 */
const TablePage = <T extends Row, >({
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
	fetchResource: GenericAsyncThunk,
	loadResourceIntoTable: () => AppThunk,
	getTotalResources: (state: RootState) => number,
	navBarLinks: NavBarLink[]
	navBarCreate?: CreateType
	navBarChildren?: ReactNode
	caption: ParseKeys
	templateMap: TemplateMap<T>
	children?: ReactNode
}) => {
	const { t } = useTranslation();

	const numberOfRows = useAppSelector(state => getTotalResources(state));

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
				<Table
					resource={resource}
					templateMap={templateMap}
					fetchResource={fetchResource}
					loadResourceIntoTable={loadResourceIntoTable}
				/>
		</MainPage>
	);
};

export default TablePage;
