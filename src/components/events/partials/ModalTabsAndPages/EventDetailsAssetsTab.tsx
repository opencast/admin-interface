import { useEffect } from "react";
import Notifications from "../../../shared/Notifications";
import {
	getAssets,
	getModalAssetsTabHierarchy,
	getUploadAssetOptions,
	isFetchingAssets,
	isTransactionReadOnly,
} from "../../../../selectors/eventDetailsSelectors";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { isFetchingAssetUploadOptions as getIsFetchingAssetUploadOptions } from "../../../../selectors/eventSelectors";
import {
	fetchAssetAttachments,
	fetchAssetCatalogs,
	fetchAssetMedia,
	fetchAssetPublications,
	fetchAssets,
	setModalAssetsTabHierarchy,
} from "../../../../slices/eventDetailsSlice";
import { useTranslation } from "react-i18next";
import { AssetTabHierarchy } from "../modals/EventDetails";
import EventDetailsAssetsAddAsset from "./EventDetailsAssetsAddAsset";
import EventDetailsAssetAttachments from "./EventDetailsAssetAttachments";
import EventDetailsAssetAttachmentDetails from "./EventDetailsAssetAttachmentDetails";
import EventDetailsAssetCatalogs from "./EventDetailsAssetCatalogs";
import EventDetailsAssetCatalogDetails from "./EventDetailsAssetCatalogDetails";
import EventDetailsAssetMedia from "./EventDetailsAssetMedia";
import EventDetailsAssetMediaDetails from "./EventDetailsAssetMediaDetails";
import EventDetailsAssetPublications from "./EventDetailsAssetPublications";
import EventDetailsAssetPublicationDetails from "./EventDetailsAssetPublicationDetails";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the main assets tab of event details modal
 */
const EventDetailsAssetsTab = ({
	eventId,
}: {
	eventId: string,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const assetsTabHierarchy = useAppSelector(state => getModalAssetsTabHierarchy(state));
	const user = useAppSelector(state => getUserInformation(state));
	const assets = useAppSelector(state => getAssets(state));
	const uploadAssetOptions = useAppSelector(state => getUploadAssetOptions(state));
	const isFetching = useAppSelector(state => isFetchingAssets(state));
	const transactionsReadOnly = useAppSelector(state => isTransactionReadOnly(state));
	const isFetchingAssetUploadOptions = useAppSelector(state => getIsFetchingAssetUploadOptions(state));

	const assetsTabs: {
		tabNameTranslation: ParseKeys
		tabHierarchies: string[]
		open: () => void
	}[] = [
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.TITLE",
			tabHierarchies: ["asset-attachments", "attachment-details"],
			open: () => openSubTab("asset-attachments"),
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.TITLE",
			tabHierarchies: ["asset-catalogs", "catalog-details"],
			open: () => openSubTab("asset-catalogs"),
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.TITLE",
			tabHierarchies: ["asset-media", "media-details"],
			open: () => openSubTab("asset-media"),
		},
		{
			tabNameTranslation: "EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.TITLE",
			tabHierarchies: ["asset-publications", "publication-details"],
			open: () => openSubTab("asset-publications"),
		},
	];

	const assetsNavStyle = {
		borderBottom: "1px solid #d6d6d6",
		lineHeight: "35px",
		paddingLeft: "15px",
	};

	const assetsTabActive = {
		padding: "14px 5px",
		fontWeight: "600",
		minWidth: "100px",
		color: "#435263",
	};

	const assetsTabInactive = {
		padding: "14px 5px",
		minWidth: "100px",
		color: "#646e75",
	};

	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		dispatch(fetchAssets(eventId)).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openSubTab = (
		subTabName: AssetTabHierarchy,
	) => {
		dispatch(removeNotificationWizardForm());
		if (subTabName === "asset-attachments") {
			dispatch(fetchAssetAttachments(eventId)).then();
		} else if (subTabName === "asset-catalogs") {
			dispatch(fetchAssetCatalogs(eventId)).then();
		} else if (subTabName === "asset-media") {
			dispatch(fetchAssetMedia(eventId)).then();
		} else if (subTabName === "asset-publications") {
			dispatch(fetchAssetPublications(eventId)).then();
		}
		dispatch(setModalAssetsTabHierarchy(subTabName));
	};

	return (
		<>
			{/* Assets tabs */}
			<nav style={assetsNavStyle}>
				{assetsTabs.map((tab, key) => (
					<ButtonLikeAnchor
						key={key}
						style={tab.tabHierarchies.includes(assetsTabHierarchy) ? assetsTabActive : assetsTabInactive}
						onClick={tab.open}
					>
						{t(tab.tabNameTranslation)}
					</ButtonLikeAnchor>
				))}
			</nav>
			{((assetsTabHierarchy === "entry" && (
				<ModalContentTable
					modalBodyChildren={<Notifications context="not_corner" />}
				>
					{/* table with types of assets */}
					<div className="obj tbl-container operations-tbl">
						{" "}
						{/* Assets */}
						<header>{t("EVENTS.EVENTS.DETAILS.ASSETS.CAPTION")}</header>
						<div className="obj-container">
							{isFetching || (
								<table cellPadding="0" cellSpacing="0" className="main-tbl">
									<thead>
										<tr>
											<th>
												{" "}
												{t("EVENTS.EVENTS.DETAILS.ASSETS.TYPE") /* Type */}
											</th>
											<th>
												{" "}
												{t("EVENTS.EVENTS.DETAILS.ASSETS.SIZE") /* Size */}
											</th>
											<th className="medium">
												{!isFetchingAssetUploadOptions &&
													!!uploadAssetOptions &&
													uploadAssetOptions.length > 0 &&
													!transactionsReadOnly &&
													hasAccess(
														"ROLE_UI_EVENTS_DETAILS_ASSETS_EDIT",
														user,
													) && (
														<ButtonLikeAnchor
															extraClassName="details-link"
															onClick={() =>
																openSubTab("add-asset")
															}
														>
															{t("EVENTS.EVENTS.NEW.UPLOAD_ASSET.ADD")}
														</ButtonLikeAnchor>
													)}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.ATTACHMENTS.CAPTION",
													) /* Attachments */
												}
											</td>
											<td>{assets.attachments}</td>
											<td>
												{assets.attachments > 0 && (
													<ButtonLikeAnchor
														extraClassName="details-link"
														onClick={() =>
															openSubTab("asset-attachments")
														}
													>
														{
															t(
																"EVENTS.EVENTS.DETAILS.ASSETS.DETAILS",
															) /* Details */
														}
													</ButtonLikeAnchor>
												)}
											</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.CAPTION",
													) /* Catalogs */
												}
											</td>
											<td>{assets.catalogs}</td>
											<td>
												{assets.catalogs > 0 && (
													<ButtonLikeAnchor
														extraClassName="details-link"
														onClick={() =>
															openSubTab("asset-catalogs")
														}
													>
														{
															t(
																"EVENTS.EVENTS.DETAILS.ASSETS.DETAILS",
															) /* Details */
														}
													</ButtonLikeAnchor>
												)}
											</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.CAPTION",
													) /* Media */
												}
											</td>
											<td>{assets.media}</td>
											<td>
												{assets.media > 0 && (
													<ButtonLikeAnchor
														extraClassName="details-link"
														onClick={() => openSubTab("asset-media")}
													>
														{
															t(
																"EVENTS.EVENTS.DETAILS.ASSETS.DETAILS",
															) /* Details */
														}
													</ButtonLikeAnchor>
												)}
											</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.CAPTION",
													) /* Publications */
												}
											</td>
											<td>{assets.publications}</td>
											<td>
												{assets.publications > 0 && (
													<ButtonLikeAnchor
														extraClassName="details-link"
														onClick={() =>
															openSubTab("asset-publications")
														}
													>
														{
															t(
																"EVENTS.EVENTS.DETAILS.ASSETS.DETAILS",
															) /* Details */
														}
													</ButtonLikeAnchor>
												)}
											</td>
										</tr>
									</tbody>
								</table>
							)}
						</div>
					</div>
				</ModalContentTable>
			)) ||
			(assetsTabHierarchy === "add-asset" && (
				<EventDetailsAssetsAddAsset
					eventId={eventId}
				/>
			)) ||
			(assetsTabHierarchy === "asset-attachments" && (
				<EventDetailsAssetAttachments
					eventId={eventId}
				/>
			)) ||
			(assetsTabHierarchy === "attachment-details" && (
				<EventDetailsAssetAttachmentDetails />
			)) ||
			(assetsTabHierarchy === "asset-catalogs" && (
				<EventDetailsAssetCatalogs
					eventId={eventId}
				/>
			)) ||
			(assetsTabHierarchy === "catalog-details" && (
				<EventDetailsAssetCatalogDetails />
			)) ||
			(assetsTabHierarchy === "asset-media" && (
				<EventDetailsAssetMedia
					eventId={eventId}
				/>
			)) ||
			(assetsTabHierarchy === "media-details" && (
				<EventDetailsAssetMediaDetails />
			)) ||
			(assetsTabHierarchy === "asset-publications" && (
				<EventDetailsAssetPublications
					eventId={eventId}
				/>
			)) ||
			(assetsTabHierarchy === "publication-details" && (
				<EventDetailsAssetPublicationDetails />
			)))}
		</>
	);
};


export default EventDetailsAssetsTab;
