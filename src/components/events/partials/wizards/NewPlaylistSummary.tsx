import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

import MetadataSummaryTable from "./summaryTables/MetadataSummaryTable";
import AccessSummaryTable from "./summaryTables/AccessSummaryTable";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { PlaylistEntry } from "../../../../slices/playlistDetailsSlice";
import { MetadataCatalog } from "../../../../slices/eventSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";


/**
 * Summary page for new playlists in new playlist wizard.
 */
interface RequiredFormProps {
  policies: TransformedAcl[],
  metadata: { [key: string]: unknown },
  entries: PlaylistEntry[],
}

const NewPlaylistSummary = <T extends RequiredFormProps>({
  formik,
  previousPage,
  metadataFields,
}: {
  formik: FormikProps<T>,
  previousPage: (values: T, twoPagesBack?: boolean) => void,
  metadataFields: MetadataCatalog,
}) => {
  const { t } = useTranslation();

  return <>
    <ModalContentTable>
      <MetadataSummaryTable
        metadataCatalogs={[metadataFields]}
        // @ts-expect-error TS(7006):
        formikValues={formik.values.metadata}
        header={"EVENTS.PLAYLISTS.NEW.METADATA.CAPTION"}
      />

      {/* Summary entries */}
      {formik.values.entries.length > 0 && (
        <div className="obj tbl-list">
          <header>
            <span>{t("EVENTS.PLAYLISTS.DETAILS.TABS.ENTRIES")}</span>
          </header>
          <table className="main-tbl">
            <tbody>
              {formik.values.entries.map((entry, index) => (
                <tr key={entry.contentId}>
                  <td>{index + 1}. {entry.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AccessSummaryTable
        policies={formik.values.policies}
        header={"EVENTS.PLAYLISTS.NEW.ACCESS.CAPTION"}
      />
    </ModalContentTable>

    <WizardNavigationButtons
      isLast
      previousPage={previousPage}
      formik={formik}
    />
  </>;
};


export default NewPlaylistSummary;
