import { FormikProps } from "formik";

import MetadataSummaryTable from "./summaryTables/MetadataSummaryTable";
import AccessSummaryTable from "./summaryTables/AccessSummaryTable";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { MetadataCatalog } from "../../../../slices/eventSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";


/**
 * Summary page for new playlists in new playlist wizard.
 */
interface RequiredFormProps {
  policies: TransformedAcl[],
  metadata: { [key: string]: unknown }
}

const NewPlaylistSummary = <T extends RequiredFormProps>({
  formik,
  previousPage,
  metadataFields,
}: {
  formik: FormikProps<T>,
  previousPage: (values: T, twoPagesBack?: boolean) => void,
  metadataFields: MetadataCatalog,
}) => <>
    <ModalContentTable>
      <MetadataSummaryTable
        metadataCatalogs={[metadataFields]}
        // @ts-expect-error TS(7006):
        formikValues={formik.values.metadata}
        header={"EVENTS.PLAYLISTS.NEW.METADATA.CAPTION"}
      />

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


export default NewPlaylistSummary;
