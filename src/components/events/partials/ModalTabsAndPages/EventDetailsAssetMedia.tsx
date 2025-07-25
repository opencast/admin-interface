import Notifications from "../../../shared/Notifications";
import {
	getAssetMedia,
	isFetchingAssetMedia,
} from "../../../../selectors/eventDetailsSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAssetMediaDetails, setModalAssetsTabHierarchy } from "../../../../slices/eventDetailsSlice";
import { AssetTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the media sub-tab for assets tab of event details modal
 */
const EventDetailsAssetMedia = ({
	eventId,
}: {
	eventId: string,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const media = useAppSelector(state => getAssetMedia(state));
	const isFetching = useAppSelector(state => isFetchingAssetMedia(state));

	const openSubTab = (subTabName: AssetTabHierarchy, mediaId = "") => {
		if (subTabName === "media-details") {
			dispatch(fetchAssetMediaDetails({ eventId, mediaId })).then();
		}
		dispatch(setModalAssetsTabHierarchy(subTabName));
	};

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* table with list of media */}
			<div className="obj tbl-container operations-tbl">
				<header>
					{t("EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.CAPTION") /* Media */}
				</header>
				<div className="obj-container">
					<table cellPadding="0" cellSpacing="0" className="main-tbl">
						<thead>
							<tr>
								<th>
									{t("EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.ID") /* ID */}
								</th>
								<th>
									{t("EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.TYPE") /* Type */}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.MIMETYPE",
										) /* Mimetype */
									}
								</th>
								<th>
									{t("EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.TAGS") /* Tags */}
								</th>
								<th className="medium" />
							</tr>
						</thead>
						<tbody>
							{isFetching ||
								media.map((item, key) => (
									<tr key={key}>
										<td>
											<a href={item.url} target="_blank" rel="noreferrer">{item.id}</a>
										</td>
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
												onClick={() => openSubTab("media-details", item.id)}
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

export default EventDetailsAssetMedia;
