import Notifications from "../../../shared/Notifications";
import {
	getAssetAttachments,
	isFetchingAssetAttachments,
} from "../../../../selectors/eventDetailsSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAssetAttachmentDetails, setModalAssetsTabHierarchy } from "../../../../slices/eventDetailsSlice";
import { AssetTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the attachments sub-tab for assets tab of event details modal
 */
const EventDetailsAssetAttachments = ({
	eventId,
}: {
	eventId: string,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const attachments = useAppSelector(state => getAssetAttachments(state));
	const isFetching = useAppSelector(state => isFetchingAssetAttachments(state));

	const openSubTab = (subTabName: AssetTabHierarchy, attachmentId = "") => {
		if (subTabName === "attachment-details") {
			dispatch(fetchAssetAttachmentDetails({ eventId, attachmentId })).then();
		}
		dispatch(setModalAssetsTabHierarchy(subTabName));
	};

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* table with list of attachments */}
			<div className="obj tbl-container operations-tbl">
				<header>
					{
						t(
							"EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.CAPTION",
						) /* Attachments */
					}
				</header>
				<div className="obj-container">
					<table cellPadding="0" cellSpacing="0" className="main-tbl">
						<thead>
							<tr>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.ID",
										) /* ID */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.TYPE",
										) /* Type */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.MIMETYPE",
										) /* Mimetype */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.TAGS",
										) /* Tags */
									}
								</th>
								<th className="medium" />
							</tr>
						</thead>
						<tbody>
							{isFetching ||
								attachments.map((item, key) => (
									<tr key={key}>
										<td>{item.id}</td>
										<td>{item.type}</td>
										<td>{item.mimetype}</td>
										<td>
											{!!item.tags && item.tags.length > 0
												? item.tags.join(", ")
												: null}
										</td>
										<td>
											<ButtonLikeAnchor
												extraClassName="details-link"
												onClick={() =>
													openSubTab("attachment-details", item.id)
												}
											>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.DETAILS",
													) /* Details */
												}
											</ButtonLikeAnchor>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		</ModalContentTable>
	);
};

export default EventDetailsAssetAttachments;
