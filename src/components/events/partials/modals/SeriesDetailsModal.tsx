import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SeriesDetails from "./SeriesDetails";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch } from "../../../../store";
import { Modal, ModalHandle } from "../../../shared/modals/Modal";
import { FormikProps } from "formik";

/**
 * This component renders the modal for displaying series details
 */
const SeriesDetailsModal = ({
	seriesTitle,
	seriesId,
	modalRef,
}: {
	seriesTitle: string
	seriesId: string
	modalRef: React.RefObject<ModalHandle | null>
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// tracks, whether the policies are different to the initial value
	const [policyChanged, setPolicyChanged] = useState(false);
	const formikRef = useRef<FormikProps<any>>(null);

	const confirmUnsaved = () => {
		return window.confirm(t("CONFIRMATIONS.WARNINGS.UNSAVED_CHANGES"));
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
			return true;
		}
		return false;
	};

	return (
		<Modal
			closeCallback={close}
			header={t("EVENTS.SERIES.DETAILS.HEADER", { name: seriesTitle })}
			classId="details-modal"
			ref={modalRef}
		>
			<SeriesDetails
				seriesId={seriesId}
				policyChanged={policyChanged}
				setPolicyChanged={value => setPolicyChanged(value)}
				formikRef={formikRef}
			/>
		</Modal>
	);
};

export default SeriesDetailsModal;
