import { ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import TableFilters from "../shared/TableFilters";
import Table, { TemplateMap } from "../shared/Table";
import Notifications from "../shared/Notifications";
import { fetchFilters } from "../../slices/tableFilterSlice";
import { CreateType, NavBarLink } from "../NavBar";
import { AppThunk, RootState, useAppDispatch, useAppSelector } from "../../store";
import { resetTableProperties, Resource } from "../../slices/tableSlice";
import { AsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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
	const currentLoadRequest = useRef<{ abort:() => void } | null>(null);
	const latestLoadRequestId = useRef(0);
	const allowLoadIntoTable = useRef(true);
	const currentLoadSource = useRef<"auto" | "filters">(null);
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

		const fetchRequest = dispatch(fetchResource()) as Promise<PayloadAction<any, string>> & { abort:() => void };
		currentLoadRequest.current = fetchRequest;

		const fetchResult = await fetchRequest as { meta?: { requestStatus?: string } };

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

		dispatch(fetchFilters(resource));

		// Load resource on mount
		loadResource("auto");

		// Fetch resources every minute
		const fetchResourceInterval = setInterval(() => loadResource("auto"), 5000);

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
				<Table templateMap={templateMap} />
		</MainPage>
	);
};

export default TablePage;
