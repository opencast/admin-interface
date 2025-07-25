import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalHandle } from "./modals/Modal";
import { NotificationComponent } from "./Notifications";
import { ParseKeys } from "i18next";

export type ResourceType = "EVENT" | "SERIES" | "LOCATION" | "USER" | "GROUP" | "ACL" | "THEME" | "TOBIRA_PATH";

const ConfirmModal = <T, >({
	close,
	resourceType,
	resourceName,
	resourceId,
	deleteMethod,
	deleteAllowed = true,
	deleteNotAllowedMessage,
	deleteWithCautionMessage,
	modalRef,
}: {
	close: () => void,
	resourceType: ResourceType,
	resourceName: string,
	resourceId: T,
	deleteMethod: (id: T) => void,
	deleteAllowed?: boolean,
	deleteNotAllowedMessage?: ParseKeys,
	deleteWithCautionMessage?: ParseKeys,
	modalRef: React.RefObject<ModalHandle | null>
}) => {
	const { t } = useTranslation();

	const handleClose = () => {
		close();
	};

	const handleConfirmation = () => {
		deleteMethod(resourceId);
		close();
	};

	return (
		<Modal
			header={t("CONFIRMATIONS.ACTIONS.CONFIRMATION")}
			classId="confirm-modal"
			ref={modalRef}
		>
			{deleteAllowed ? (
				<div>
					{deleteWithCautionMessage && (
						<NotificationComponent
							notification={{
								type: "warning",
								message: deleteWithCautionMessage,
								id: 0,
							}}
						/>
					)}

					<div>
						<p>
							<span style={{ padding: "0px 4px" }}>
								{t(`CONFIRMATIONS.METADATA.NOTICE.${resourceType}`)}
							</span>
						</p>
						<p className="delete">{resourceName}</p>
					</div>
					{resourceType === "EVENT" && (
						<p className="warning">
							{t("CONFIRMATIONS.WARNINGS.EVENT_WILL_BE_GONE")}
						</p>
					)}
					<p>{t("CONFIRMATIONS.CONTINUE_ACTION")}</p>

					<div className="btn-container">
						<button
							className="cancel-btn close-modal"
							onClick={() => handleClose()}
						>
							<i>{t("CANCEL")}</i>
						</button>
						<button
							className="danger-btn"
							onClick={() => handleConfirmation()}
						>
							<i>{t("CONFIRM")}</i>
						</button>
					</div>
				</div>
			) : (
				<div>
					{deleteNotAllowedMessage && (
						<NotificationComponent
							notification={{
								type: "error",
								message: deleteNotAllowedMessage,
								id: 0,
							}}
						/>
					)}
					<div className="btn-container">
						<button
							className="cancel-btn close-modal"
							onClick={() => handleClose()}
						>
							<i>{t("CANCEL")}</i>
						</button>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default ConfirmModal;
