import { useTranslation } from "react-i18next";
import { TransformedAcl } from "../../../../../slices/aclDetailsSlice";
import { ParseKeys } from "i18next";

/**
 * This component renders the access table containing access rules provided by user before in wizard summary pages
 */
const AccessSummaryTable = ({
	policies,
	header,
}: {
	policies: TransformedAcl[]
	header: ParseKeys
}) => {
	const { t } = useTranslation();

	return (
		<div className="obj tbl-list">
			<header>{t(header)}</header>
			<table className="main-tbl">
				<thead>
					<tr>
						<th>
							{t("EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.ROLE")}
						</th>
						<th>
							{t("EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.READ")}
						</th>
						<th>
							{t("EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.WRITE")}
						</th>
						<th>
							{t("EVENTS.SERIES.NEW.ACCESS.ACCESS_POLICY.ADDITIONAL_ACTIONS")}
						</th>
					</tr>
				</thead>
				<tbody>
					{/* Insert row for each policy user has provided*/}
					{policies.map((policy, key) => (
						<tr key={key}>
							<td>{policy.role}</td>
							<td>
								<input type="checkbox" disabled checked={policy.read} />
							</td>
							<td>
								<input type="checkbox" disabled checked={policy.write} />
							</td>
							<td>
								{/* repeat for each additional action*/}
								{policy.actions.map((action, key) => (
									<div key={key}>{action}</div>
								))}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default AccessSummaryTable;
