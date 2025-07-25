import { useTranslation } from "react-i18next";
import { renderValidDate } from "../../../utils/dateUtils";
import { Recording } from "../../../slices/recordingSlice";

/**
 * This component renders the updated cells of recordings in the table view
 */
const RecordingsUpdateCell = ({
	row,
}: {
	row: Recording
}) => {
	const { t } = useTranslation();

	return (
		<span>
			{t("dateFormats.dateTime.short", { dateTime: renderValidDate(row.updated) })}
		</span>
	);
};

export default RecordingsUpdateCell;
