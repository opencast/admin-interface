import Notifications from "../../../shared/Notifications";
import {
	getAssetPublicationDetails,
	isFetchingAssetPublicationDetails,
} from "../../../../selectors/eventDetailsSelectors";
import { humanReadableBytesFilter } from "../../../../utils/eventDetailsUtils";
import { useAppSelector } from "../../../../store";
import { useTranslation } from "react-i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the publication details sub-tab for assets tab of event details modal
 */
const EventDetailsAssetPublicationDetails = () => {
	const { t } = useTranslation();

	const publication = useAppSelector(state => getAssetPublicationDetails(state));
	const isFetching = useAppSelector(state => isFetchingAssetPublicationDetails(state));

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* table with details for the publication */}
			<div className="obj tbl-container operations-tbl">
				<header>
					{
						t(
							"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.CAPTION",
						) /* Publication Details */
					}
				</header>
				<div className="obj-container">
					<table className="main-tbl">
						{isFetching || (
							<tbody>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.ID",
											) /* Id */
										}
									</td>
									<td>{publication.id}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.TYPE",
											) /* Type */
										}
									</td>
									<td>{publication.type}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.MIMETYPE",
											) /* Mimetype */
										}
									</td>
									<td>{publication.mimetype}</td>
								</tr>
								{!!publication.size && publication.size > 0 && (
									<tr>
										<td>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.SIZE",
												) /* Size */
											}
										</td>
										<td>{humanReadableBytesFilter(publication.size)}</td>
									</tr>
								)}
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.CHANNEL",
											) /* Channel */
										}
									</td>
									<td>{publication.channel}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.REFERENCE",
											) /* Reference */
										}
									</td>
									<td>{publication.reference}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.TAGS",
											) /* Tags */
										}
									</td>
									<td>
										{!!publication.tags && publication.tags.length > 0
											? publication.tags.join(", ")
											: null}
									</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.URL",
											) /* Link */
										}
									</td>
									<td>
										<a
											className="fa fa-external-link"
											href={publication.url}
											target="_blank" rel="noreferrer"
										/>
									</td>
								</tr>
							</tbody>
						)}
					</table>
				</div>
			</div>
		</ModalContentTable>
	);
};

export default EventDetailsAssetPublicationDetails;
