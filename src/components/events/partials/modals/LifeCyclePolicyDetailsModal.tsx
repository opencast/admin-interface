import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Modal } from "../../../shared/modals/Modal";
import { confirmUnsaved } from "../../../../utils/utils";
import { FormikProps } from "formik";
import LifeCyclePolicyDetails from "./LifeCyclePolicyDetails";
import { getModalLifeCyclePolicy, showModal } from "../../../../selectors/lifeCycleDetailsSelectors";
import { setModalLifeCyclePolicy, setShowModal } from "../../../../slices/lifeCycleDetailsSlice";

/**
 * This component renders the modal for displaying lifecycle policy details
 */
const LifeCyclePolicyDetailsModal = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // tracks, whether the policies are different to the initial value
  const [policyChanged, setPolicyChanged] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formikRef = useRef<FormikProps<any>>(null);

  const displayDetailsModal = useAppSelector(state => showModal(state));
  const policy = useAppSelector(state => getModalLifeCyclePolicy(state))!;

  const hideModal = () => {
    dispatch(setModalLifeCyclePolicy(null));
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
      {displayDetailsModal &&
        <Modal
          open
          closeCallback={close}
          header={t("LIFECYCLE.POLICIES.DETAILS.HEADER", { name: policy.title })}
          classId="details-modal"
          focusTrapActive={false}
        >
          <LifeCyclePolicyDetails
            _policyId={policy.id}
            _policyChanged={policyChanged}
            _setPolicyChanged={value => setPolicyChanged(value)}
          />
        </Modal>
      }
    </>
  );
};

export default LifeCyclePolicyDetailsModal;
