import Notifications from "../../../shared/Notifications";
import {
	getAssetPublications,
	isFetchingAssetPublications,
} from "../../../../selectors/eventDetailsSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAssetPublicationDetails, setModalAssetsTabHierarchy } from "../../../../slices/eventDetailsSlice";
import { AssetTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the publications sub-tab for assets tab of event details modal
 */
const EventDetailsAssetPublications = ({
	eventId,
}: {
	eventId: string,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const publications = useAppSelector(state => getAssetPublications(state));
	const isFetching = useAppSelector(state => isFetchingAssetPublications(state));

	const openSubTab = (subTabName: AssetTabHierarchy, publicationId = "") => {
		if (subTabName === "publication-details") {
			dispatch(fetchAssetPublicationDetails({ eventId, publicationId })).then();
		}
		dispatch(setModalAssetsTabHierarchy(subTabName));
	};

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* table with list of publications */}
			<div className="obj tbl-container operations-tbl">
				<header>
					{
						t(
							"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.CAPTION",
						) /* Publications */
					}
				</header>
				<div className="obj-container">
					<table cellPadding="0" cellSpacing="0" className="main-tbl">
						<thead>
							<tr>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.ID",
										) /* ID */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.CHANNEL",
										) /* Channel */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.TAGS",
										) /* Tags */
									}
								</th>
								<th className="medium" />
							</tr>
						</thead>
						<tbody>
							{isFetching ||
								publications.map((item, key) => (
									<tr key={key}>
										<td>{item.id}</td>
										<td>{item.channel}</td>
										<td>
											{!!item.tags && item.tags.length > 0
												? item.tags.join(", ")
												: null}
										</td>
										<td>
											<ButtonLikeAnchor
												extraClassName="details-link"
												onClick={() =>
													openSubTab("publication-details", item.id)
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

export default EventDetailsAssetPublications;
