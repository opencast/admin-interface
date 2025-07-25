import { useTranslation } from "react-i18next";
import { renderValidDate } from "../../../../../utils/dateUtils";

const SchedulingConflicts = ({
	conflicts,
}: {
	conflicts: {
		title: string,
		start: string,
		end: string,
	}[],
}) => {
	const { t } = useTranslation();

	return (
		/* list of scheduling conflicts*/
		conflicts.length > 0 ? (
			<table className="main-tbl scheduling-conflict">
				<tbody>
					{conflicts.map((conflict, key) => (
						<tr key={key}>
							<td>{conflict.title}</td>
							<td>
								{t("dateFormats.dateTime.medium", {
									dateTime: renderValidDate(conflict.start),
								})}
							</td>
							<td>
								{t("dateFormats.dateTime.medium", {
									dateTime: renderValidDate(conflict.end),
								})}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		) : <></>
	);
};

export default SchedulingConflicts;
