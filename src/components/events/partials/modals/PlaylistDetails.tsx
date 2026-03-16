import { useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { FormikProps } from "formik";
import { ParseKeys } from "i18next";

import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { confirmUnsaved, hasAccess } from "../../../../utils/utils";
import { useAppSelector } from "../../../../store";
import {
  getPlaylistDetailsEntriesChanged,
  getPlaylistDetailsMetadata,
} from "../../../../selectors/playlistDetailsSelectors";
import { updatePlaylistMetadata } from "../../../../slices/playlistDetailsSlice";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import DetailsMetadataTab, { MetadataValues } from "../ModalTabsAndPages/DetailsMetadataTab";
import PlaylistDetailsAccessTab from "../ModalTabsAndPages/PlaylistDetailsAccessTab";
import PlaylistDetailsEntriesTab from "../ModalTabsAndPages/PlaylistDetailsEntriesTab";


export enum PlaylistDetailsPage {
  Metadata,
  Entries,
  AccessPolicy,
}

/**
 * This component manages the tabs of the playlist details modal
 */
const PlaylistDetails = ({
  playlistId,
  policyChanged,
  setPolicyChanged,
  formikRef,
}: {
  playlistId: string,
  policyChanged: boolean,
  setPolicyChanged: (value: boolean) => void,
  formikRef: React.RefObject<FormikProps<MetadataValues> | null>,
}) => {
  const { t } = useTranslation();

  const metadata = useAppSelector(state => getPlaylistDetailsMetadata(state));
  const user = useAppSelector(state => getUserInformation(state));
  const entriesChanged = useAppSelector(state => getPlaylistDetailsEntriesChanged(state));

  const [page, setPage] = useState(0);

  const tabs: {
    tabNameTranslation: ParseKeys,
    accessRole: string,
    name: string,
  }[] = [
    {
      tabNameTranslation: "EVENTS.PLAYLISTS.DETAILS.TABS.METADATA",
      accessRole: "ROLE_UI_PLAYLISTS_DETAILS_METADATA_VIEW",
      name: "metadata",
    },
    {
      tabNameTranslation: "EVENTS.PLAYLISTS.DETAILS.TABS.ENTRIES",
      accessRole: "ROLE_UI_PLAYLISTS_DETAILS_METADATA_VIEW",
      name: "entries",
    },
    {
      tabNameTranslation: "EVENTS.PLAYLISTS.DETAILS.TABS.PERMISSIONS",
      accessRole: "ROLE_UI_PLAYLISTS_DETAILS_ACL_VIEW",
      name: "permissions",
    },
  ];

  const openTab = (tabNr: number) => {
    let isUnsavedChanges = policyChanged || entriesChanged;
    if (formikRef.current?.dirty) {
      isUnsavedChanges = true;
    }

    if (!isUnsavedChanges || confirmUnsaved(t)) {
      setPage(tabNr);
    }
  };

  return <>
    {/* Tab navigation */}
    <nav className="modal-nav" id="modal-nav">
      {tabs.map((tab, index) => hasAccess(tab.accessRole, user) && (
        <ButtonLikeAnchor
          key={tab.name}
          className={cn({ active: page === index })}
          onClick={() => openTab(index)}
        >
          {t(tab.tabNameTranslation)}
        </ButtonLikeAnchor>
      ))}
    </nav>

    {/* Tab content */}
    <div>
      {page === 0 && (
        <DetailsMetadataTab
          resourceId={playlistId}
          metadata={[metadata]}
          updateResource={updatePlaylistMetadata}
          editAccessRole="ROLE_UI_PLAYLISTS_DETAILS_METADATA_EDIT"
          formikRef={formikRef}
          header={tabs[page].tabNameTranslation}
        />
      )}
      {page === 1 && <PlaylistDetailsEntriesTab
        playlistId={playlistId}
      />}
      {page === 2 && <PlaylistDetailsAccessTab
        playlistId={playlistId}
        header={tabs[page].tabNameTranslation}
        policyChanged={policyChanged}
        setPolicyChanged={setPolicyChanged}
      />}
    </div>
  </>;
};

export default PlaylistDetails;
