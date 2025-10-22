import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SeriesDetails from "./SeriesDetails";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Modal } from "../../../shared/modals/Modal";
import { confirmUnsaved } from "../../../../utils/utils";
import { FormikProps } from "formik";
import { setModalSeries, setShowModal } from "../../../../slices/seriesDetailsSlice";
import { getModalSeries, showModal } from "../../../../selectors/seriesDetailsSelectors";

/**
 * This component renders the modal for displaying series details
 */
const SeriesDetailsModal = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// tracks, whether the policies are different to the initial value
	const [policyChanged, setPolicyChanged] = useState(false);
	const formikRef = useRef<FormikProps<any>>(null);

	const displaySeriesDetailsModal = useAppSelector(state => showModal(state));
	const series = useAppSelector(state => getModalSeries(state))!;

	const hideModal = () => {
		dispatch(setModalSeries(null));
		dispatch(setShowModal(false));
	};

	const close = () => {
		let isUnsavedChanges = false;
		isUnsavedChanges = policyChanged;
		if (formikRef.current && formikRef.current.dirty !== undefined && formikRef.current.dirty) {
			isUnsavedChanges = true;
		}

		if (!isUnsavedChanges || confirmUnsaved(t)) {
			setPolicyChanged(false);
			dispatch(removeNotificationWizardForm());
			hideModal();
			return true;
		}
		return false;
	};

	return (
		<>
			{displaySeriesDetailsModal &&
				<Modal
					open
					closeCallback={close}
					header={t("EVENTS.SERIES.DETAILS.HEADER", { name: series.title })}
					classId="details-modal"
				>
					<SeriesDetails
						seriesId={series.id}
						policyChanged={policyChanged}
						setPolicyChanged={value => setPolicyChanged(value)}
						formikRef={formikRef}
					/>
				</Modal>
			}
		</>
	);
};

export default SeriesDetailsModal;
