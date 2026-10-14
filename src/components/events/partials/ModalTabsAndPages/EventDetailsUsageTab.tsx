import { useTranslation } from "react-i18next";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import { NotificationComponent } from "../../../shared/Notifications";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import EventDetailsUsageDailyDetail from "./EventDetailsUsageDailyDetail";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	getModalUsageTabHierarchy,
	getUsageStatistics,
	hasUsageStatisticsError,
	isFetchingUsageStatistics,
} from "../../../../selectors/eventDetailsSelectors";
import { setModalUsageTabHierarchy } from "../../../../slices/eventDetailsSlice";
import { formatHMS } from "../../../../utils/dateUtils";

export type UsageTabHierarchy = "overview" | "daily-detail";

/**
 * This component manages the usage tab of the event details modal
 */
const EventDetailsUsageTab = ({
	eventId,
	eventDate,
	header,
}: {
	eventId: string,
	eventDate: string,
	header: ParseKeys,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const tabHierarchy = useAppSelector(state => getModalUsageTabHierarchy(state));
	const usageStatistics = useAppSelector(state => getUsageStatistics(state));
	const hasError = useAppSelector(state => hasUsageStatisticsError(state));
	const isFetching = useAppSelector(state => isFetchingUsageStatistics(state));

	const completenessThreshold = usageStatistics.completenessThreshold;
	const isPossiblyIncomplete = !!completenessThreshold && !!eventDate
		&& new Date(eventDate).getTime() < new Date(completenessThreshold).getTime();

	const openSubTab = (tabType: UsageTabHierarchy) => {
		dispatch(setModalUsageTabHierarchy(tabType));
	};

	return (
		<ModalContentTable
			modalContentChildren={
				<nav>
					<ButtonLikeAnchor
						className={tabHierarchy === "overview" ? "active" : "inactive"}
						onClick={() => openSubTab("overview")}
					>
						{t("EVENTS.EVENTS.DETAILS.USAGE.TAB_OVERVIEW")}
					</ButtonLikeAnchor>
					<ButtonLikeAnchor
						className={tabHierarchy === "daily-detail" ? "active" : "inactive"}
						onClick={() => openSubTab("daily-detail")}
					>
						{t("EVENTS.EVENTS.DETAILS.USAGE.TAB_DETAILS")}
					</ButtonLikeAnchor>
				</nav>
			}
		>
			{tabHierarchy === "daily-detail" ? (
				<EventDetailsUsageDailyDetail eventId={eventId} />
			) : (
				<>
					{hasError && (
						<NotificationComponent
							notification={{
								type: "error",
								message: "EVENTS.EVENTS.DETAILS.USAGE.NOT_AVAILABLE",
								id: 0,
							}}
						/>
					)}
					{!isFetching && isPossiblyIncomplete && (
						<NotificationComponent
							notification={{
								type: "warning",
								message: "EVENTS.EVENTS.DETAILS.USAGE.INCOMPLETE_WARNING",
								id: 0,
								parameter: { date: completenessThreshold },
							}}
						/>
					)}
					<div className="obj tbl-details">
						<header>{t(header)}</header>
						<div className="obj-container">
							{!isFetching && !hasError && (
								<table className="main-tbl">
									<tbody>
										<tr>
											<td>{t("EVENTS.EVENTS.DETAILS.USAGE.VIEWS")}</td>
											<td>{usageStatistics.views}</td>
										</tr>
										<tr>
											<td>{t("EVENTS.EVENTS.DETAILS.USAGE.WATCHTIME")}</td>
											<td>{formatHMS(usageStatistics.watchtime)}</td>
										</tr>
									</tbody>
								</table>
							)}
						</div>
					</div>
				</>
			)}
		</ModalContentTable>
	);
};

export default EventDetailsUsageTab;
