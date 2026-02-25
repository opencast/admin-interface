import { useEffect } from "react";
import { ParseKeys } from "i18next";

import ResourceDetailsAccessPolicyTab from "../../../shared/modals/ResourceDetailsAccessPolicyTab";
import {
  getPlaylistDetailsAcl,
  getPlaylistDetailsPolicyTemplateId,
} from "../../../../selectors/playlistDetailsSelectors";
import { fetchPlaylistDetails, updatePlaylistAccess } from "../../../../slices/playlistDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";


/**
 * This component manages the access policy tab of the playlist details modal
 */
const PlaylistDetailsAccessTab = ({
  playlistId,
  header,
  policyChanged,
  setPolicyChanged,
}: {
  playlistId: string,
  header: ParseKeys,
  policyChanged: boolean,
  setPolicyChanged: (value: boolean) => void,
}) => {
  const dispatch = useAppDispatch();

  const policies = useAppSelector(state => getPlaylistDetailsAcl(state));
  const policyTemplateId = useAppSelector(state => getPlaylistDetailsPolicyTemplateId(state));

  useEffect(() => {
    dispatch(removeNotificationWizardForm());
  }, [dispatch]);

  return <ResourceDetailsAccessPolicyTab
    resourceId={playlistId}
    header={header}
    buttonText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.ACCESS_POLICY.LABEL"}
    descriptionText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.ACCESS_POLICY.DESCRIPTION"}
    policies={policies}
    policyTemplateId={policyTemplateId}
    fetchAccessPolicies={fetchPlaylistDetails}
    saveNewAccessPolicies={updatePlaylistAccess}
    policyTableHeaderText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.NON_USER_ROLES"}
    policyTableRoleText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.ROLE"}
    policyTableNewText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.NEW"}
    userPolicyTableHeaderText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.USERS"}
    userPolicyTableRoleText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.USER"}
    userPolicyTableNewText={"EVENTS.PLAYLISTS.DETAILS.ACCESS.NEW_USER"}
    editAccessRole={"ROLE_UI_PLAYLISTS_DETAILS_ACL_EDIT"}
    viewUsersAccessRole={"ROLE_UI_PLAYLISTS_DETAILS_ACL_USER_ROLES_VIEW"}
    viewNonUsersAccessRole={"ROLE_UI_PLAYLISTS_DETAILS_ACL_NONUSER_ROLES_VIEW"}
    policyChanged={policyChanged}
    setPolicyChanged={setPolicyChanged}
  />;
};

export default PlaylistDetailsAccessTab;
