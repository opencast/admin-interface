import { ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table, { TemplateMap } from "../shared/Table";
import Notifications from "../shared/Notifications";
import { CreateType, NavBarLink } from "../NavBar";
import { AppThunk, RootState, useAppDispatch, useAppSelector } from "../../store";
import { resetTableProperties, Resource, Row } from "../../slices/tableSlice";
import { ParseKeys } from "i18next";
import { useLocation } from "react-router";
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
	const dispatch = useAppDispatch();
	const currentLoadRequest = useRef<{ abort:() => void } | null>(null);
	const latestLoadRequestId = useRef(0);
	const allowLoadIntoTable = useRef(true);
	const currentLoadSource = useRef<"auto" | "filters" | null>(null);
	const autoRefreshPaused = useRef(false);
	const autoRefreshPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const location = useLocation();

	const numberOfRows = useAppSelector(state => getTotalResources(state));

	const pauseAutoRefresh = () => {
		autoRefreshPaused.current = true;

		if (autoRefreshPauseTimeout.current) {
			clearTimeout(autoRefreshPauseTimeout.current);
		}

		autoRefreshPauseTimeout.current = setTimeout(() => {
			autoRefreshPaused.current = false;
			autoRefreshPauseTimeout.current = null;
		}, 2000);
	};

	const loadResource = async (source: "auto" | "filters" = "auto") => {
		if (source === "filters") {
			pauseAutoRefresh();
		}

		if (source === "auto" && autoRefreshPaused.current) {
			return;
		}

		if (source === "auto" && currentLoadSource.current === "filters") {
			return;
		}

		const requestId = ++latestLoadRequestId.current;
		currentLoadSource.current = source;

		currentLoadRequest.current?.abort?.();

		const fetchRequest = dispatch(fetchResource());
		currentLoadRequest.current = fetchRequest;

		const fetchResult = await fetchRequest;

		if (requestId === latestLoadRequestId.current) {
			currentLoadSource.current = null;
		}

		if (
			allowLoadIntoTable.current
			&& requestId === latestLoadRequestId.current
			&& fetchResult?.meta?.requestStatus === "fulfilled"
		) {
			dispatch(loadResourceIntoTable());
		}
	};

	const loadResourceFromFilters = () => loadResource("filters");

	useEffect(() => {
		allowLoadIntoTable.current = true;

		// Clear table of previous data
		dispatch(resetTableProperties());

		// Load resource on mount
		loadResource("auto");

		// Fetch resources every minute
		const fetchResourceInterval = setInterval(() => { void loadResource("auto"); }, 5000);

		return () => {
			allowLoadIntoTable.current = false;
			currentLoadRequest.current?.abort?.();
			if (autoRefreshPauseTimeout.current) {
				clearTimeout(autoRefreshPauseTimeout.current);
				autoRefreshPauseTimeout.current = null;
			}
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
							loadResource={loadResourceFromFilters}
							resource={resource}
						/>
					</div>
					<h1>{t(caption)}</h1>
					<h4>{t("TABLE_SUMMARY", { numberOfRows })}</h4>
				</div>
				{/* Include table component */}
				<Table
					templateMap={templateMap}
				/>
		</MainPage>
	);
};

export default TablePage;
