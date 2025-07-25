import { useTranslation } from "react-i18next";
import { renderValidDate } from "../../../utils/dateUtils";
import { Event } from "../../../slices/eventSlice";

/**
 * This component renders the end cells of events in the table view
 */
const EventsEndCell = ({
	row,
}: {
	row: Event
}) => {
	const { t } = useTranslation();

	return (
		// Link template for start date of event
		<span>{t("dateFormats.time.short", { time: renderValidDate(row.end_date) })}</span>
	);
};
export default EventsEndCell;
