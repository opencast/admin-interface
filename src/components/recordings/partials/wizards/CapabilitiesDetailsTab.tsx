import React from "react";
import { useTranslation } from "react-i18next";
import { RecordingDetails } from "../../../../slices/recordingDetailsSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders details about the capabilities of a recording/capture agent
 */
const CapabilitiesDetailsTab: React.FC<{
	agent: RecordingDetails
}> = ({
	agent,
}) => {
	const { t } = useTranslation();

	const enabled = (flag: boolean) => t(flag ? "YES" : "NO");
	const config = agent.parsedCapabilities?.config;

	return (
		<ModalContentTable>
			{/* Which ways of capturing the agent supports. Only agents using capture agent API 2.x report this. */}
			{agent.version === "2" && config && (
				<div className="obj tbl-details">
					<header>
						<span>{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.CAPTION")}</span>
					</header>
					<div className="obj-container">
						<table className="main-tbl">
							<tbody>
								<tr>
									<td>{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.LOCAL")}</td>
									<td>{enabled(config.local.capture)}</td>
								</tr>
								{config.local.capture && (
									<tr>
										<td>
											{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.LOCAL")}
											{" – "}
											{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.START_PAUSED")}
										</td>
										<td>{enabled(config.local.startpaused)}</td>
									</tr>
								)}
								<tr>
									<td>{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.STREAM")}</td>
									<td>{enabled(config.stream.stream)}</td>
								</tr>
								{config.stream.stream && (
									<tr>
										<td>
											{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.STREAM")}
											{" – "}
											{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.MODES.START_PAUSED")}
										</td>
										<td>{enabled(config.stream.startpaused)}</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
			{/* If capabilities has no item show corresponding message */}
			{agent.capabilities.length > 0 ? (
				<div className="obj tbl-details">
					<header>
						<span>
							{t("RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.CAPTION")}
						</span>
					</header>
					<div className="obj-container">
						<table className="main-tbl">
							<tbody>
								{/* Render table row for each capability item*/}
								{agent.capabilities.map((item, key) => (
									<tr key={key}>
										<td>{item.key}</td>
										<td>{item.value}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div>
					<p>
						{t(
							"RECORDINGS.RECORDINGS.DETAILS.CAPABILITIES.NO_CAPABILITIES",
						)}
					</p>
				</div>
			)}
		</ModalContentTable>
	);
};

export default CapabilitiesDetailsTab;
