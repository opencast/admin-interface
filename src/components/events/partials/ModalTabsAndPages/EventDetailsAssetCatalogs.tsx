import Notifications from "../../../shared/Notifications";
import {
	getAssetCatalogs,
	isFetchingAssetCatalogs,
} from "../../../../selectors/eventDetailsSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAssetCatalogDetails, setModalAssetsTabHierarchy } from "../../../../slices/eventDetailsSlice";
import { AssetTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the catalogs sub-tab for assets tab of event details modal
 */
const EventDetailsAssetCatalogs = ({
	eventId,
}: {
	eventId: string,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const catalogs = useAppSelector(state => getAssetCatalogs(state));
	const isFetching = useAppSelector(state => isFetchingAssetCatalogs(state));

	const openSubTab = (subTabName: AssetTabHierarchy, catalogId = "") => {
		if (subTabName === "catalog-details") {
			dispatch(fetchAssetCatalogDetails({ eventId, catalogId })).then();
		}
		dispatch(setModalAssetsTabHierarchy(subTabName));
	};

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* table with list of catalogs */}
			<div className="obj tbl-container operations-tbl">
				<header>
					{
						t(
							"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.CAPTION",
						) /* Catalogs */
					}
				</header>
				<div className="obj-container">
					<table cellPadding="0" cellSpacing="0" className="main-tbl">
						<thead>
							<tr>
								<th>
									{t("EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.ID") /* ID */}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.TYPE",
										) /* Type */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.MIMETYPE",
										) /* Mimetype */
									}
								</th>
								<th>
									{
										t(
											"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.TAGS",
										) /* Tags */
									}
								</th>
								<th className="medium" />
							</tr>
						</thead>
						<tbody>
							{isFetching ||
								catalogs.map((item, key) => (
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
													openSubTab("catalog-details", item.id)
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

export default EventDetailsAssetCatalogs;
