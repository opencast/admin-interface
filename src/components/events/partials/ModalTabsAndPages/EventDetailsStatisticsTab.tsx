import {
	getStatistics,
	hasStatisticsError,
} from "../../../../selectors/eventDetailsSelectors";
import TimeSeriesStatistics from "../../../shared/TimeSeriesStatistics";
import { useAppSelector } from "../../../../store";
import { fetchEventStatisticsValueUpdate } from "../../../../slices/eventDetailsSlice";
import { useTranslation } from "react-i18next";
import { createChartOptions } from "../../../../utils/statisticsUtils";
import { NotificationComponent } from "../../../shared/Notifications";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the statistics tab of the event details modal
 */
const EventDetailsStatisticsTab = ({
	eventId,
	header,
}: {
	eventId: string,
	header: ParseKeys,
}) => {
	const { t } = useTranslation();

	const statistics = useAppSelector(state => getStatistics(state));
	const hasError = useAppSelector(state => hasStatisticsError(state));

	/* generates file name for download-link for a statistic */
	const statisticsCsvFileName = (statsTitle: string) => {
		const sanitizedStatsTitle = statsTitle
			.replace(/[^0-9a-z]/gi, "_")
			.toLowerCase();
		return "export_event_" + eventId + "_" + sanitizedStatsTitle + ".csv";
	};

	return (
		<ModalContentTable>
			{hasError ? (
				/* error message */
				<div className="obj">
					<header>{t(header) /* Statistics */}</header>
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
									resourceId={eventId}
									statTitle={t(stat.title as ParseKeys)}
									providerId={stat.providerId}
									fromDate={stat.from}
									toDate={stat.to}
									timeMode={stat.timeMode}
									dataResolution={stat.dataResolution}
									statDescription={stat.description}
									onChange={fetchEventStatisticsValueUpdate}
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
			)}
		</ModalContentTable>
	);
};

export default EventDetailsStatisticsTab;
