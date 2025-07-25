import { useTranslation } from "react-i18next";
import { Usage } from "../../../../slices/themeDetailsSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the usage of a theme in the theme details modal
 */
const UsagePage = ({
	themeUsage,
}: {
	themeUsage: Usage
}) => {
	const { t } = useTranslation();

	return (
		<ModalContentTable>
			<div className="obj">
				<div className="obj-container summary-list">
					<table className="main-tbl">
						<thead>
							<tr>
								<th>{t("CONFIGURATION.THEMES.DETAILS.USAGE.SERIE")}</th>
							</tr>
						</thead>
						<tbody>
							{!!themeUsage.series && themeUsage.series.length > 0 ? (
								themeUsage.series.map((usage, key) => (
									<tr key={key}>
										<td>{usage.title}</td>
									</tr>
								))
							) : (
								<tr>
									<td>{t("CONFIGURATION.THEMES.DETAILS.USAGE.EMPTY")}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</ModalContentTable>
	);
};

export default UsagePage;
