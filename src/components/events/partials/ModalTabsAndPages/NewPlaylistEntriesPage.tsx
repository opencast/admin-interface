import { useCallback } from "react";
import { FormikProps } from "formik";

import { PlaylistEntry } from "../../../../slices/playlistDetailsSlice";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import PlaylistEntriesEditor from "./PlaylistEntriesEditor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";


interface RequiredFormProps {
  entries: PlaylistEntry[],
}

/**
 * Wizard page for adding entries to a new playlist.
 * Stores entries in Formik values rather than Redux state.
 */
const NewPlaylistEntriesPage = <T extends RequiredFormProps>({
  formik,
  nextPage,
  previousPage,
}: {
  formik: FormikProps<T>,
  nextPage: (values: T) => void,
  previousPage: (values: T) => void,
}) => {
  const entries = formik.values.entries;

  const setEntries = useCallback((updated: PlaylistEntry[]) => {
    void formik.setFieldValue("entries", updated);
  }, [formik]);

  return <>
    <ModalContentTable>
      <PlaylistEntriesEditor
        entries={entries}
        setEntries={setEntries}
      />
    </ModalContentTable>

    <WizardNavigationButtons
      noValidation
      previousPage={previousPage}
      nextPage={nextPage}
      formik={formik}
    />
  </>;
};

export default NewPlaylistEntriesPage;
