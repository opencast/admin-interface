import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EventDetails from "./EventDetails";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { getModalEvent } from "../../../../selectors/eventDetailsSelectors";
import { setModalEvent, setShowModal } from "../../../../slices/eventDetailsSlice";
import { Modal } from "../../../shared/modals/Modal";
import { FormikProps } from "formik";

/**
 * This component renders the modal for displaying event details
 */
const EventDetailsModal = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// tracks, whether the policies are different to the initial value
	const [policyChanged, setPolicyChanged] = useState(false);
	const formikRef = useRef<FormikProps<any>>(null);

	const event = useAppSelector(state => getModalEvent(state))!;

	const confirmUnsaved = () => {
		return window.confirm(t("CONFIRMATIONS.WARNINGS.UNSAVED_CHANGES"));
	};

	const hideModal = () => {
		dispatch(setModalEvent(null));
		dispatch(setShowModal(false));
	};

	const close = () => {
		let isUnsavedChanges = false;
		isUnsavedChanges = policyChanged;
		if (formikRef.current && formikRef.current.dirty !== undefined && formikRef.current.dirty) {
			isUnsavedChanges = true;
		}

		if (!isUnsavedChanges || confirmUnsaved()) {
			setPolicyChanged(false);
			dispatch(removeNotificationWizardForm());
			hideModal();
			return true;
		}
		return false;
	};

	return (
		<Modal
			open
			closeCallback={close}
			header={t("EVENTS.EVENTS.DETAILS.HEADER", { name: event.title })}
			classId="details-modal"
		>
			<EventDetails
				eventId={event.id}
				policyChanged={policyChanged}
				setPolicyChanged={value => setPolicyChanged(value)}
				formikRef={formikRef}
			/>
		</Modal>
	);
};

export default EventDetailsModal;
