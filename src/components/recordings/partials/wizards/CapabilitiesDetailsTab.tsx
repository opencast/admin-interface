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

	return (
		<ModalContentTable>
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
