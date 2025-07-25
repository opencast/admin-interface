import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Event } from "../../../slices/eventSlice";
import { Tooltip } from "../../shared/Tooltip";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";
import { enrichPublications } from "../../../thunks/assetsThunks";
import { useAppDispatch } from "../../../store";
import { Publication } from "../../../slices/eventDetailsSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { ParseKeys } from "i18next";

// References for detecting a click outside of the container of the popup listing publications of an event
const containerPublications = React.createRef<HTMLDivElement>();

/**
 * This component renders the published cells of events in the table view
 */
const PublishCell = ({
	row,
}: {
	row: Event
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [publications, setPublications] = useState(row.publications);
	// State of popup listing publications of an event
	const [showPopup, setShowPopup] = useState(false);

	useEffect(() => {
		// Enrich publications
		const fetchPublications = async () => {
			if (!!row.publications && row.publications.length > 0) {
				let transformedPublications: Publication[] = [];
				try {
					const resultAction = await dispatch(enrichPublications({ publications: row.publications }));
					transformedPublications = unwrapResult(resultAction);
				} catch (rejectedValueOrSerializedError) {
					console.error(rejectedValueOrSerializedError);
				}
				setPublications(transformedPublications);
			}
		};

		// Reset publications. This is to immediately update the table on page switch.
		setPublications(row.publications);
		// Enrich publications. It is ok if this is not immediate.
		fetchPublications();
	// Only update if the publications have actually changed by fake deep checking with JSON.stringify
	// This should be acceptable for our simple and small publication objects
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, JSON.stringify(row.publications)]);

	useEffect(() => {
		// Function for handling clicks outside of popup
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerPublications.current &&
				!containerPublications.current.contains(e.target as Node)
			) {
				setShowPopup(false);
			}
		};

		// Event listener for handle a click outside of popup
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const onlyEngage = publications.length === 1
		&& publications[0].enabled
		&& !publications[0].hide
		&& publications[0].id === "engage-player";

	return (
		<div className="popover-wrapper">
			{onlyEngage && (
				<Tooltip title={t("EVENTS.EVENTS.TABLE.TOOLTIP.PLAYER")}>
					<a href={publications[0].url} rel="noreferrer" target="_blank">
						<ButtonLikeAnchor>
							{t("YES")}
						</ButtonLikeAnchor>
					</a>
				</Tooltip>
			)}
			{!onlyEngage && publications.length > 0 && (
				<>
					<ButtonLikeAnchor extraClassName="popover-wrapper__trigger">
						<span onClick={() => setShowPopup(!showPopup)}>{t("YES")}</span>
					</ButtonLikeAnchor>
					{showPopup && (
						<div className="js-popover popover" ref={containerPublications}>
							<div className="popover__header" />
							<div className="popover__content">
								{/* Show a list item for each publication of an event that isn't hidden*/}
								{publications.map((publication, key) =>
									!publication.hide ? (
										// Check if publications is enabled and choose icon according
										publication.enabled ? (
											<a
												href={publication.url}
												className="popover__list-item"
												target="_blank"
												rel="noreferrer"
												key={key}
											>
												<span>{publication.label ? t(publication.label as ParseKeys) : t(publication.name as ParseKeys)}</span>
											</a>
										) : (
											<ButtonLikeAnchor key={key} extraClassName="popover__list-item">
												<span>{publication.label ? t(publication.label as ParseKeys) : t(publication.name as ParseKeys)}</span>
											</ButtonLikeAnchor>
										)
									) : null,
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default PublishCell;
