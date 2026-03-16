import { useState, useEffect } from "react";
import { Formik } from "formik";

import NewMetadataCommonPage from "../ModalTabsAndPages/NewMetadataCommonPage";
import NewAccessPage from "../ModalTabsAndPages/NewAccessPage";
import NewPlaylistEntriesPage from "../ModalTabsAndPages/NewPlaylistEntriesPage";
import NewPlaylistSummary from "./NewPlaylistSummary";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import { initialFormValuesNewPlaylist } from "../../../../configs/modalConfig";
import { MetadataSchema, NewPlaylistSchema } from "../../../../utils/validate";
import { getInitialMetadataFieldValues } from "../../../../utils/resourceUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getNewPlaylistMetadataFields, postNewPlaylist } from "../../../../slices/playlistSlice";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { PlaylistEntry } from "../../../../slices/playlistDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { getAclDefaultActions, getAclDefaultTemplate } from "../../../../selectors/aclSelectors";
import { AclTemplate } from "../../../../slices/aclSlice";
import { UserInfoState } from "../../../../slices/userInfoSlice";


/**
 * Manages tabs of the new playlist wizard and submission of form values.
 * Currently supports metadata and access policy steps.
 */
const NewPlaylistWizard = ({
  close,
}: {
  close: () => void
}) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => getUserInformation(state));
  const metadataFields = getNewPlaylistMetadataFields(user.user.name);
  const aclDefaultActions = useAppSelector(state => getAclDefaultActions(state));
  const aclDefaultTemplate = useAppSelector(state => getAclDefaultTemplate(state));

  useEffect(() => {
    dispatch(removeNotificationWizardForm());
  }, [dispatch]);

  const initialValues = getInitialValues(
    metadataFields,
    user,
    aclDefaultActions,
    aclDefaultTemplate,
  );

  const [page, setPage] = useState(0);
  const [pageCompleted, setPageCompleted] = useState<{ [key: number]: boolean }>({});

  type StepName = "metadata" | "entries" | "access" | "summary";
  type Step = WizardStep & {
    name: StepName,
  }

  const steps: Step[] = [
    {
      translation: "EVENTS.PLAYLISTS.NEW.METADATA.CAPTION",
      name: "metadata",
    },
    {
      translation: "EVENTS.PLAYLISTS.DETAILS.TABS.ENTRIES",
      name: "entries",
    },
    {
      translation: "EVENTS.PLAYLISTS.NEW.ACCESS.CAPTION",
      name: "access",
    },
    {
      translation: "EVENTS.PLAYLISTS.NEW.SUMMARY.CAPTION",
      name: "summary",
    },
  ];

  // Validation schema of current page
  let currentValidationSchema;
  if (page === 0) {
    currentValidationSchema = MetadataSchema(metadataFields);
  } else {
    currentValidationSchema = NewPlaylistSchema[steps[page].name];
  }

  const nextPage = () => {
    const updatedPageCompleted = pageCompleted;
    updatedPageCompleted[page] = true;
    setPageCompleted(updatedPageCompleted);
    setPage(page + 1);
  };

  const previousPage = () => {
    setPage(page - 1);
  };

  const handleSubmit = (
    values: {
      metadata: { [key: string]: unknown },
      policies: TransformedAcl[],
      entries: PlaylistEntry[],
    },
  ) => {
    // Extract metadata field values from the formik values
    const metadataPrefix = metadataFields.flavor + "_";
    const title = (values.metadata[metadataPrefix + "title"] as string) || "";
    const description = (values.metadata[metadataPrefix + "description"] as string) || "";
    const creator = (values.metadata[metadataPrefix + "creator"] as string) || "";

    dispatch(postNewPlaylist({
      values,
      metadataFields: { title, description, creator },
    }));

    close();
  };

  return <>
    <Formik
      initialValues={initialValues}
      validationSchema={currentValidationSchema}
      onSubmit={values => handleSubmit(values)}
    >
      {formik => <>
        <WizardStepper
          steps={steps}
          activePageIndex={page}
          setActivePage={setPage}
          completed={pageCompleted}
          setCompleted={setPageCompleted}
          acls={formik.values.policies}
          isValid={formik.isValid}
        />

        <div>
          {steps[page].name === "metadata" && (
            <NewMetadataCommonPage
              nextPage={nextPage}
              formik={formik}
              metadataFields={metadataFields}
              header={steps[page].translation}
            />
          )}

          {steps[page].name === "entries" && (
            <NewPlaylistEntriesPage
              nextPage={nextPage}
              previousPage={previousPage}
              formik={formik}
            />
          )}

          {steps[page].name === "access" && (
            <NewAccessPage
              nextPage={nextPage}
              previousPage={previousPage}
              // @ts-expect-error TS(7006):
              formik={formik}
              editAccessRole="ROLE_UI_PLAYLISTS_DETAILS_ACL_EDIT"
              viewUsersAccessRole="ROLE_UI_PLAYLISTS_DETAILS_ACL_USER_ROLES_VIEW"
              viewNonUsersAccessRole="ROLE_UI_PLAYLISTS_DETAILS_ACL_NONUSER_ROLES_VIEW"
              initEventAclWithSeriesAcl={false}
            />
          )}

          {steps[page].name === "summary" && (
            <NewPlaylistSummary
              previousPage={previousPage}
              formik={formik}
              metadataFields={metadataFields}
            />
          )}
        </div>
      </>}
    </Formik>
  </>;
};

const getInitialValues = (
  metadataFields: ReturnType<typeof getNewPlaylistMetadataFields>,
  user: UserInfoState,
  aclDefaultActions: string[],
  aclDefaultTemplate?: AclTemplate,
) => {
  const initialValues = { ...initialFormValuesNewPlaylist };

  const metadataInitialValues = getInitialMetadataFieldValues(metadataFields);
  initialValues.metadata = { ...metadataInitialValues };

  initialValues["policies"] = [
    {
      role: user.userRole,
      read: true,
      write: true,
      actions: aclDefaultActions ? aclDefaultActions : [],
      user: user.user,
    },
  ];

  if (aclDefaultTemplate) {
    initialValues["aclTemplate"] = aclDefaultTemplate.id.toString();
    initialValues["policies"] = [...aclDefaultTemplate.acl, ...initialValues["policies"]];
  }

  return initialValues;
};

export default NewPlaylistWizard;
