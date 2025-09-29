import React from "react";
import { useTranslation } from "react-i18next";
import NewEventWizard from "../events/partials/wizards/NewEventWizard";
import NewSeriesWizard from "../events/partials/wizards/NewSeriesWizard";
import NewThemeWizard from "../configuration/partials/wizard/NewThemeWizard";
import NewAclWizard from "../users/partials/wizard/NewAclWizard";
import NewGroupWizard from "../users/partials/wizard/NewGroupWizard";
import NewUserWizard from "../users/partials/wizard/NewUserWizard";
import { Modal, ModalHandle } from "./modals/Modal";

/**
 * This component renders the modal for adding new resources
 */
export type NewResource =
  | "events"
  | "series"
  | "user"
  | "group"
  | "acl"
  | "themes";

const NewResourceModal = ({
  handleClose,
  resource,
  modalRef,
}: {
  handleClose: () => void;
  resource: "events" | "series" | "user" | "group" | "acl" | "themes";
  modalRef: React.RefObject<ModalHandle | null>;
}) => {
  const { t } = useTranslation();

  const close = () => {
    handleClose();
  };

  const headerText = () => {
    switch (resource) {
      case "events":
        return t("EVENTS.EVENTS.NEW.CAPTION");
      case "series":
        return t("EVENTS.SERIES.NEW.CAPTION");
      case "themes":
        return t("CONFIGURATION.THEMES.DETAILS.NEWCAPTION");
      case "acl":
        return t("USERS.ACLS.NEW.CAPTION");
      case "group":
        return t("USERS.GROUPS.NEW.CAPTION");
      case "user":
        return t("USERS.USERS.DETAILS.NEWCAPTION");
    }
  };

  return (
    <Modal
      header={headerText()}
      classId="add-event-modal"
      // initialFocus={"#firstField"}
      ref={modalRef}
    >
      {resource === "events" && (
        // New Event Wizard
        <NewEventWizard close={close} />
      )}
      {resource === "series" && (
        // New Series Wizard
        <NewSeriesWizard close={close} />
      )}
      {resource === "themes" && (
        // New Theme Wizard
        <NewThemeWizard close={close} />
      )}
      {resource === "acl" && (
        // New ACL Wizard
        <NewAclWizard close={close} />
      )}
      {resource === "group" && (
        // New Group Wizard
        <NewGroupWizard close={close} />
      )}
      {resource === "user" && (
        // New User Wizard
        <NewUserWizard close={close} />
      )}
    </Modal>
  );
};

export default NewResourceModal;
