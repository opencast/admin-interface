import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

import PlaylistDetails from "./PlaylistDetails";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Modal } from "../../../shared/modals/Modal";
import { confirmUnsaved } from "../../../../utils/utils";
import { MetadataValues } from "../ModalTabsAndPages/DetailsMetadataTab";
import { setModalPlaylist, setShowModal } from "../../../../slices/playlistDetailsSlice";
import { getModalPlaylist, showModal } from "../../../../selectors/playlistDetailsSelectors";


/**
 * This component renders the modal for displaying playlist details
 */
const PlaylistDetailsModal = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [policyChanged, setPolicyChanged] = useState(false);
  const formikRef = useRef<FormikProps<MetadataValues>>(null);

  const displayPlaylistDetailsModal = useAppSelector(state => showModal(state));
  const playlist = useAppSelector(state => getModalPlaylist(state))!;

  const hideModal = () => {
    dispatch(setModalPlaylist(null));
    dispatch(setShowModal(false));
  };

  const close = () => {
    let isUnsavedChanges = policyChanged;
    if (formikRef.current?.dirty) {
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

  return <>
    {displayPlaylistDetailsModal &&
      <Modal
        open
        closeCallback={close}
        header={t("EVENTS.PLAYLISTS.DETAILS.HEADER", { name: playlist.title })}
        classId="details-modal"
      >
        <PlaylistDetails
          playlistId={playlist.id}
          policyChanged={policyChanged}
          setPolicyChanged={value => setPolicyChanged(value)}
          formikRef={formikRef}
        />
      </Modal>
    }
  </>;
};

export default PlaylistDetailsModal;
