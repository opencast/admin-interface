import { useEffect, useRef } from "react";
import Notifications from "../../../shared/Notifications";
import {
	getAssetMediaDetails,
	isFetchingAssetMediaDetails,
} from "../../../../selectors/eventDetailsSelectors";
import {
	formatDuration,
	humanReadableBytesFilter,
} from "../../../../utils/eventDetailsUtils";
import { useAppSelector } from "../../../../store";
import { useTranslation } from "react-i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component manages the media details sub-tab for assets tab of event details modal
 */
const EventDetailsAssetMediaDetails = () => {
	const { t } = useTranslation();

	const media = useAppSelector(state => getAssetMediaDetails(state));
	const isFetching = useAppSelector(state => isFetchingAssetMediaDetails(state));

	const PlayerType = media.hasVideo ? "video" : "audio";

	const videoRef = useRef<HTMLVideoElement>(null);

	// Make sure to reload the video player when the url changes, React will not do that for us
	// This is necessary for proper rerendering when switching between assets
	useEffect(() => {
		videoRef.current?.load();
	}, [media.url]);

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{/* table with general details for the media */}
			<div className="obj tbl-details">
				<header>
					{
						t(
							"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.TITLE",
						) /* Media Details */
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
												"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.ID",
											) /* Id */
										}
									</td>
									<td>{media.id}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.TYPE",
											) /* Type */
										}
									</td>
									<td>{media.type}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.MIMETYPE",
											) /* Mimetype */
										}
									</td>
									<td>{media.mimetype}</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.TAGS",
											) /* Tags */
										}
									</td>
									<td>
										{!!media.tags && media.tags.length > 0
											? media.tags.join(", ")
											: null}
									</td>
								</tr>
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.DURATION",
											) /* Duration */
										}
									</td>
									<td>
										{media.duration
											? formatDuration(media.duration)
											: null}
									</td>
								</tr>
								{!!media.size && media.size > 0 && (
									<tr>
										<td>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.SIZE",
												) /* Size */
											}
										</td>
										<td>{humanReadableBytesFilter(media.size)}</td>
									</tr>
								)}
								<tr>
									<td>
										{
											t(
												"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.URL",
											) /* Link */
										}
									</td>
									<td>
										<a href={media.url} target="_blank" rel="noreferrer">{media.url.split("?")[0]}</a>
									</td>
								</tr>
							</tbody>
						)}
					</table>
				</div>
			</div>

			{/* section with details for the media streams */}
			<div className="obj tbl-container media-stream-details">
				<header>
					{t("EVENTS.EVENTS.DETAILS.ASSETS.STREAMS") /* Streams */}
				</header>
				<div className="obj-container">
					<div className="table-series">
						{/* table with details for the audio streams */}
						<div className="wrapper">
							<header>
								{
									t(
										"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.STREAM_AUDIO",
									) /* Audio streams */
								}
							</header>
							<table className="main-tbl">
								<thead>
									<tr>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.ID",
												) /* ID */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.TYPE",
												) /* Type */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.CHANNELS",
												) /* Channels */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.BITRATE",
												) /* Bitrate */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.BITDEPTH",
												) /* Bitdepth */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.SAMPLINGRATE",
												) /* Samplingrate */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.FRAMECOUNT",
												) /* Framecount */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.PEAKLEVELDB",
												) /* Peak level DB */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.RMSLEVELDB",
												) /* RMS level DB */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.RMSPEAKDB",
												) /* RMS speak DB */
											}
										</th>
									</tr>
								</thead>
								<tbody>
									{!!media.streams.audio &&
										media.streams.audio.map((audioStream, key) => (
											<tr key={key}>
												<td>{key}</td>
												<td>{audioStream.type}</td>
												<td>{audioStream.channels}</td>
												<td>{audioStream.bitrate}</td>
												<td>{audioStream.bitdepth}</td>
												<td>{audioStream.samplingrate}</td>
												<td>{audioStream.framecount}</td>
												<td>{audioStream.peakleveldb}</td>
												<td>{audioStream.rmsleveldb}</td>
												<td>{audioStream.rmspeakdb}</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>

						{/* table with details for the video streams */}
						<div className="wrapper">
							<header>
								{
									t(
										"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.STREAM_VIDEO",
									) /* Video streams */
								}
							</header>
							<table className="main-tbl">
								<thead>
									<tr>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.ID",
												) /* ID */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.TYPE",
												) /* Type */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.FRAMERATE",
												) /* Framerate */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.BITRATE",
												) /* Bitrate */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.RESOLUTION",
												) /* Resolution */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.FRAMECOUNT",
												) /* Framecount */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.SCANTYPE",
												) /* Scantype */
											}
										</th>
										<th>
											{
												t(
													"EVENTS.EVENTS.DETAILS.ASSETS.MEDIA.DETAILS.SCANORDER",
												) /* Scanorder */
											}
										</th>
									</tr>
								</thead>
								<tbody>
									{!!media.streams.video &&
										media.streams.video.map((videoStream, key) => (
											<tr key={key}>
												<td>{key}</td>
												<td>
													{videoStream.type}
													<i />
												</td>
												<td>
													{videoStream.framerate}
													<i />
												</td>
												<td>
													{videoStream.bitrate}
													<i />
												</td>
												<td>
													{videoStream.resolution}
													<i />
												</td>
												<td>
													{videoStream.framecount}
													<i />
												</td>
												<td>
													{videoStream.scantype}
													<i />
												</td>
												<td>
													{videoStream.scanorder}
													<i />
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* preview video/audio player (only if we actually have video/audio) */}
			{(media.hasVideo || media.hasAudio) && (
				<div className="obj tbl-container media-stream-details">
					<header>
						{t("EVENTS.EVENTS.DETAILS.ASSETS.PREVIEW") /* Preview */}
					</header>
					<div className="obj-container">
						<div>
							{/* video player */}
							<div className="video-player">
								<div>
									<PlayerType ref={videoRef} id="player" controls>
											<source src={media.url} type={media.mimetype}/>
									</PlayerType>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</ModalContentTable>
	);
};

export default EventDetailsAssetMediaDetails;
