import ConfirmModal, { ResourceType } from "./ConfirmModal";
import { useRef } from "react";
import { IconButton } from "./IconButton";
import { ModalHandle } from "./modals/Modal";
import { ParseKeys } from "i18next";

export const ActionCellDelete = <T, >({
	editAccessRole,
	tooltipText,
	resourceId,
	resourceName,
	resourceType,
	deleteMethod,
	deleteAllowed,
	showCautionMessage,
	deleteNotAllowedMessage,
	deleteWithCautionMessage,
}: {
	editAccessRole: string
	tooltipText: ParseKeys
	resourceId: T
	resourceName: string
	resourceType: ResourceType
	deleteMethod: (id: T) => void
	deleteAllowed?: boolean,
	showCautionMessage?: boolean,
	deleteNotAllowedMessage?: ParseKeys,
	deleteWithCautionMessage?: ParseKeys,
}) => {
	const deleteConfirmationModalRef = useRef<ModalHandle>(null);

	return (
		<>
			{/* delete button */}
			<IconButton
				callback={() => deleteConfirmationModalRef.current?.open()}
				iconClassname={"remove"}
				editAccessRole={editAccessRole}
				tooltipText={tooltipText}
			/>

			{/* Confirmation modal for deleting */}
			<ConfirmModal
				close={() => deleteConfirmationModalRef.current?.close?.()}
				resourceName={resourceName}
				resourceId={resourceId}
				resourceType={resourceType}
				deleteMethod={deleteMethod}
				deleteAllowed={deleteAllowed}
				deleteNotAllowedMessage={deleteNotAllowedMessage}
				deleteWithCautionMessage={showCautionMessage ? deleteWithCautionMessage : undefined}
				modalRef={deleteConfirmationModalRef}
			/>
		</>
	);
};
