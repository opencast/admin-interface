import React from "react";
import { useTranslation } from "react-i18next";
import { RecordingDetails } from "../../../../slices/recordingDetailsSlice";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders details about a recording/capture agent
 */
const GeneralDetailsTab: React.FC<{
	agent: RecordingDetails
}> = ({
	agent,
}) => {
	const { t } = useTranslation();

	const vendorInformation: { label: ParseKeys, value: string }[] = [
		{ label: "RECORDINGS.RECORDINGS.DETAILS.GENERAL.VENDOR", value: agent.vendor },
		{ label: "RECORDINGS.RECORDINGS.DETAILS.GENERAL.MODEL", value: agent.model },
		{ label: "RECORDINGS.RECORDINGS.DETAILS.GENERAL.HARDWARE", value: agent.hardware },
		{ label: "RECORDINGS.RECORDINGS.DETAILS.GENERAL.FIRMWARE", value: agent.firmware },
	];

	return (
		<ModalContentTable>
			<div className="obj tbl-details">
				<header>
					<span>{t("RECORDINGS.RECORDINGS.DETAILS.GENERAL.CAPTION")}</span>
				</header>
				<div className="obj-container">
					{/* Render table containing general information */}
					<table className="main-tbl">
						<tbody>
							<tr>
								<td>{t("RECORDINGS.RECORDINGS.DETAILS.GENERAL.NAME")}</td>
								<td>{agent.name}</td>
							</tr>
							<tr>
								<td>{t("RECORDINGS.RECORDINGS.DETAILS.GENERAL.URL")}</td>
								<td>
									<a href={agent.url} target="_blank" rel="noreferrer">
										{agent.url}
									</a>
								</td>
							</tr>
							<tr>
								<td>{t("RECORDINGS.RECORDINGS.DETAILS.GENERAL.STATUS")}</td>
								<td>{t(agent.status as ParseKeys)}</td>
							</tr>
							<tr>
								<td>{t("RECORDINGS.RECORDINGS.DETAILS.GENERAL.UPDATE")}</td>
								<td>{agent.update}</td>
							</tr>
							<tr>
								<td>{t("RECORDINGS.RECORDINGS.DETAILS.GENERAL.VERSION")}</td>
								<td>{agent.version}</td>
							</tr>
							{/* Agents using capture agent API 1.x do not report any vendor information */}
							{vendorInformation.map(({ label, value }) => value && (
								<tr key={label}>
									<td>{t(label)}</td>
									<td>{value}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</ModalContentTable>
	);
};

export default GeneralDetailsTab;
