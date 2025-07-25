import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { availableHotkeys } from "../../../configs/hotkeysConfig";
import ButtonLikeAnchor from "../ButtonLikeAnchor";
import { ParseKeys } from "i18next";

/**
 * This component renders the modal for displaying series details
 */
const DetailsModal = ({
	handleClose,
	prefix,
	title,
	children,
}: PropsWithChildren<{
	handleClose: () => void
	prefix: ParseKeys
	title: string
}>) => {
	const { t } = useTranslation();

	const close = () => {
		handleClose();
	};

	useHotkeys(
		availableHotkeys.general.CLOSE_MODAL.sequence,
		() => close(),
		{ description: t(availableHotkeys.general.CLOSE_MODAL.description) ?? undefined },
		[close],
	);

	return (
		<>
			<div className="modal-animation modal-overlay" />
			<section className="modal wizard modal-animation" id="details-modal">
				<header>
					<ButtonLikeAnchor
						extraClassName="fa fa-times close-modal"
						onClick={() => close()}
					/>
					<h2>
						{t(prefix, { name: title })}
					</h2>
				</header>
					{children}
			</section>
		</>
	);
};

export default DetailsModal;
