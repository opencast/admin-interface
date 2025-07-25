import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../Header";
import NavBar from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";
import TimeSeriesStatistics from "../shared/TimeSeriesStatistics";
import {
	getStatistics,
	hasStatistics as getHasStatistics,
	hasStatisticsError,
	isFetchingStatistics,
} from "../../selectors/statisticsSelectors";
import {
	getOrgId,
} from "../../selectors/userInfoSelectors";
import { fetchUserInfo } from "../../slices/userInfoSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchStatisticsPageStatistics,
	fetchStatisticsPageStatisticsValueUpdate,
} from "../../slices/statisticsSlice";
import { createChartOptions } from "../../utils/statisticsUtils";
import { NotificationComponent } from "../shared/Notifications";
import { ParseKeys } from "i18next";

const Statistics: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [displayNavigation, setNavigation] = useState(false);

	const organizationId = useAppSelector(state => getOrgId(state));
	const statistics = useAppSelector(state => getStatistics(state));
	const hasStatistics = useAppSelector(state => getHasStatistics(state));
	const hasError = useAppSelector(state => hasStatisticsError(state));
	const isLoadingStatistics = useAppSelector(state => isFetchingStatistics(state));

	// fetch user information for organization id, then fetch statistics
	useEffect(() => {
		dispatch(fetchUserInfo());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
			dispatch(fetchStatisticsPageStatistics(organizationId)).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	/* generates file name for download-link for a statistic */
	const statisticsCsvFileName = (statsTitle: string) => {
		const sanitizedStatsTitle = statsTitle
			.replace(/[^0-9a-z]/gi, "_")
			.toLowerCase();
		return (
			"export_organization?_" +
			organizationId +
			"_" +
			sanitizedStatsTitle +
			".csv"
		);
	};

	return (
		<span>
			<Header />
			<NavBar
					displayNavigation={displayNavigation}
					setNavigation={setNavigation}
					links={[
						{
							path: "/statistics/organization",
							accessRole: "ROLE_UI_STATISTICS_ORGANIZATION_VIEW",
							text: "STATISTICS.NAVIGATION.ORGANIZATION",
						},
					]}
			/>

			{/* main view of this page, displays statistics */}
			<MainView open={displayNavigation}>
				<div className="obj statistics">
					{/* heading */}
					<div className="controls-container">
						<h1>
							{" "}
							{t("STATISTICS.NAVIGATION.ORGANIZATION") /* Organisation */}{" "}
						</h1>
					</div>

					{!isLoadingStatistics &&
						(hasError || !hasStatistics ? (
							/* error message */
							<div className="obj">
								<NotificationComponent
									notification={{
										type: "error",
										message: "STATISTICS.NOT_AVAILABLE",
										id: 0,
									}}
								/>
							</div>
						) : (
							/* iterates over the different available statistics */
							statistics.map((stat, key) => (
								<div className="obj" key={key}>
									{/* title of statistic */}
									<header className="no-expand">{t(stat.title as ParseKeys)}</header>

									{stat.providerType === "timeSeries" ? (
										/* visualization of statistic for time series data */
										<div className="obj-container">
											<TimeSeriesStatistics
												resourceId={organizationId}
												statTitle={t(stat.title as ParseKeys)}
												providerId={stat.providerId}
												fromDate={stat.from}
												toDate={stat.to}
												timeMode={stat.timeMode}
												dataResolution={stat.dataResolution}
												statDescription={stat.description}
												onChange={fetchStatisticsPageStatisticsValueUpdate}
												exportUrl={stat.csvUrl}
												exportFileName={statisticsCsvFileName}
												totalValue={stat.totalValue}
												sourceData={stat.values}
												chartLabels={stat.labels}
												chartOptions={createChartOptions(stat.timeMode, stat.dataResolution)}
											/>
										</div>
									) : (
										/* unsupported type message */
										<NotificationComponent
											notification={{
												type: "error",
												message: "STATISTICS.UNSUPPORTED_TYPE",
												id: 0,
											}}
										/>
									)}
								</div>
							))
						))}
				</div>
			</MainView>
			<Footer />
		</span>
    );
};

export default Statistics;
