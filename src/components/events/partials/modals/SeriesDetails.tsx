import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import {
	getSeriesDetailsExtendedMetadata,
	getSeriesDetailsMetadata,
	getSeriesDetailsTheme,
	getSeriesDetailsThemeNames,
	getSeriesDetailsTobiraDataError,
	getSeriesDetailsTobiraStatus,
	hasStatistics as seriesHasStatistics,
} from "../../../../selectors/seriesDetailsSelectors";
import { getOrgProperties, getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import SeriesDetailsAccessTab from "../ModalTabsAndPages/SeriesDetailsAccessTab";
import SeriesDetailsThemeTab from "../ModalTabsAndPages/SeriesDetailsThemeTab";
import SeriesDetailsStatisticTab from "../ModalTabsAndPages/SeriesDetailsStatisticTab";
import DetailsExtendedMetadataTab from "../ModalTabsAndPages/DetailsMetadataTab";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	fetchSeriesDetailsTobira,
	fetchSeriesStatistics,
	setTobiraTabHierarchy,
	updateExtendedSeriesMetadata,
	updateSeriesMetadata,
} from "../../../../slices/seriesDetailsSlice";
import DetailsTobiraTab from "../ModalTabsAndPages/DetailsTobiraTab";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { removeNotificationWizardTobira } from "../../../../slices/notificationSlice";
import { ParseKeys } from "i18next";
import { FormikProps } from "formik";

/**
 * This component manages the tabs of the series details modal
 */
const SeriesDetails = ({
	seriesId,
	policyChanged,
	setPolicyChanged,
	formikRef,
}: {
	seriesId: string
	policyChanged: boolean
	setPolicyChanged: (policyChanged: boolean) => void
	formikRef: React.RefObject<FormikProps<any> | null>
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const extendedMetadata = useAppSelector(state => getSeriesDetailsExtendedMetadata(state));
	const metadataFields = useAppSelector(state => getSeriesDetailsMetadata(state));
	const theme = useAppSelector(state => getSeriesDetailsTheme(state));
	const themeNames = useAppSelector(state => getSeriesDetailsThemeNames(state));
	const hasStatistics = useAppSelector(state => seriesHasStatistics(state));
	const tobiraStatus = useAppSelector(state => getSeriesDetailsTobiraStatus(state));
	const tobiraError = useAppSelector(state => getSeriesDetailsTobiraDataError(state));

	useEffect(() => {
		dispatch(removeNotificationWizardTobira());
		dispatch(fetchSeriesStatistics(seriesId));
		dispatch(fetchSeriesDetailsTobira(seriesId));
		dispatch(setTobiraTabHierarchy("main"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [page, setPage] = useState(0);

	const user = useAppSelector(state => getUserInformation(state));
	const orgProperties = useAppSelector(state => getOrgProperties(state));
	const themesEnabled = (orgProperties["admin.themes.enabled"] || "false").toLowerCase() === "true";

	// information about each tab
	const tabs: {
		tabNameTranslation: ParseKeys,
		accessRole: string,
		name: string,
		hidden?: boolean,
	}[] = [
		{
			tabNameTranslation: "EVENTS.SERIES.DETAILS.TABS.METADATA",
			accessRole: "ROLE_UI_SERIES_DETAILS_METADATA_VIEW",
			name: "metadata",
		},
		{
			tabNameTranslation: "EVENTS.SERIES.DETAILS.TABS.EXTENDED_METADATA",
			accessRole: "ROLE_UI_SERIES_DETAILS_METADATA_VIEW",
			name: "extended-metadata",
			hidden: !extendedMetadata || !(extendedMetadata.length > 0),
		},
		{
			tabNameTranslation: "EVENTS.SERIES.DETAILS.TABS.PERMISSIONS",
			accessRole: "ROLE_UI_SERIES_DETAILS_ACL_VIEW",
			name: "permissions",
		},
		{
			tabNameTranslation: "EVENTS.SERIES.DETAILS.TABS.THEME",
			accessRole: "ROLE_UI_SERIES_DETAILS_THEMES_VIEW",
			name: "theme",
			hidden: !theme && !themesEnabled,
		},
		{
			tabNameTranslation: "EVENTS.SERIES.DETAILS.TABS.TOBIRA",
			accessRole: "ROLE_UI_SERIES_DETAILS_TOBIRA_VIEW",
			name: "tobira",
			hidden: tobiraStatus === "failed" && tobiraError?.message?.includes("503"),
		},
		{
			tabNameTranslation: "EVENTS.SERIES.DETAILS.TABS.STATISTICS",
			accessRole: "ROLE_UI_SERIES_DETAILS_STATISTICS_VIEW",
			name: "statistics",
			hidden: !hasStatistics,
		},
	];

	const openTab = (tabNr: number) => {
		setPage(tabNr);
	};

	return (
		<>
			{/* navigation for navigating between tabs */}
			<nav className="modal-nav" id="modal-nav">
				{tabs.map((tab, index) => !tab.hidden && hasAccess(tab.accessRole, user) && (
					<ButtonLikeAnchor
						key={tab.name}
						extraClassName={cn({ active: page === index })}
						onClick={() => openTab(index)}
					>
						{t(tab.tabNameTranslation)}
					</ButtonLikeAnchor>
				))}
			</nav>

			{/* render modal content depending on current page */}
			<div>
				{page === 0 && (
					<DetailsExtendedMetadataTab
						resourceId={seriesId}
						metadata={[metadataFields]}
						updateResource={updateSeriesMetadata}
						editAccessRole="ROLE_UI_SERIES_DETAILS_METADATA_EDIT"
						header={tabs[page].tabNameTranslation}
						formikRef={formikRef}
					/>
				)}
				{page === 1 && (
					<DetailsExtendedMetadataTab
						resourceId={seriesId}
						metadata={extendedMetadata}
						updateResource={updateExtendedSeriesMetadata}
						editAccessRole="ROLE_UI_SERIES_DETAILS_METADATA_EDIT"
						formikRef={formikRef}
					/>
				)}
				{page === 2 && (
					<SeriesDetailsAccessTab
						seriesId={seriesId}
						header={tabs[page].tabNameTranslation}
						policyChanged={policyChanged}
						setPolicyChanged={setPolicyChanged}
					/>
				)}
				{page === 3 && (
					<SeriesDetailsThemeTab
						theme={theme}
						themeNames={themeNames}
						seriesId={seriesId}
					/>
				)}
				{page === 4 && (
					<DetailsTobiraTab
						kind="series"
						id={seriesId}
					/>
				)}
				{page === 5 && (
					<SeriesDetailsStatisticTab
						seriesId={seriesId}
						header={tabs[page].tabNameTranslation}
					/>
				)}
			</div>
		</>
	);
};

export default SeriesDetails;
