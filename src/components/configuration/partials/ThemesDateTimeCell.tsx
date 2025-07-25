import { useTranslation } from "react-i18next";
import { renderValidDate } from "../../../utils/dateUtils";
import { ThemeDetailsType } from "../../../slices/themeSlice";

/**
 * This component renders the creation date cells of themes in the table view
 */
const ThemesDateTimeCell = ({
	row,
}: {
	row: ThemeDetailsType
}) => {
	const { t } = useTranslation();

	return (
		// Link template for creation date of themes
		<span>
			{t("dateFormats.date.short", {
				date: row.creationDate ? renderValidDate(row.creationDate) : "",
			})}
		</span>
	);
};

export default ThemesDateTimeCell;
