import { useEffect, useState } from "react";
import { Formik } from "formik";
import NewEventSummary from "./NewEventSummary";
import NewAssetUploadPage from "../ModalTabsAndPages/NewAssetUploadPage";
import NewMetadataExtendedPage from "../ModalTabsAndPages/NewMetadataExtendedPage";
import NewAccessPage from "../ModalTabsAndPages/NewAccessPage";
import NewProcessingPage from "../ModalTabsAndPages/NewProcessingPage";
import NewSourcePage from "../ModalTabsAndPages/NewSourcePage";
import { NewEventSchema, MetadataSchema } from "../../../../utils/validate";
import { getInitialMetadataFieldValues } from "../../../../utils/resourceUtils";
import { sourceMetadata } from "../../../../configs/sourceConfig";
import { initialFormValuesNewEvents } from "../../../../configs/modalConfig";
import {
	getAssetUploadOptions,
	getEventMetadata,
	getExtendedEventMetadata,
	getSourceUploadOptions,
} from "../../../../selectors/eventSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getOrgProperties, getUserInformation } from "../../../../selectors/userInfoSelectors";
import { MetadataCatalog, UploadOption, postNewEvent } from "../../../../slices/eventSlice";
import { UserInfoState } from "../../../../slices/userInfoSlice";
import { hasAccess } from "../../../../utils/utils";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import NewMetadataCommonPage from "../ModalTabsAndPages/NewMetadataCommonPage";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import { getAclDefaultActions, getAclDefaultTemplate } from "../../../../selectors/aclSelectors";
import { AclTemplate } from "../../../../slices/aclSlice";

/**
 * This component manages the pages of the new event wizard and the submission of values
 */
const NewEventWizard = ({
	close,
}: {
	close: () => void
}) => {
	const dispatch = useAppDispatch();

	const uploadSourceOptions = useAppSelector(state => getSourceUploadOptions(state));
	const assetUploadOptions = useAppSelector(state => getAssetUploadOptions(state));
	const metadataFields = useAppSelector(state => getEventMetadata(state));
	const extendedMetadata = useAppSelector(state => getExtendedEventMetadata(state));
	const user = useAppSelector(state => getUserInformation(state));
	const orgProperties = useAppSelector(state => getOrgProperties(state));
	const aclDefaultActions = useAppSelector(state => getAclDefaultActions(state));
	const aclDefaultTemplate = useAppSelector(state => getAclDefaultTemplate(state));

	useEffect(() => {
		dispatch(removeNotificationWizardForm());

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Whether the ACL of a new event is initialized with the ACL of its series.
	let initEventAclWithSeriesAcl = true;
	const ADMIN_INIT_EVENT_ACL_WITH_SERIES_ACL = "admin.init.event.acl.with.series.acl";
	if (!!orgProperties && !!orgProperties[ADMIN_INIT_EVENT_ACL_WITH_SERIES_ACL]) {
		initEventAclWithSeriesAcl = user.org.properties[ADMIN_INIT_EVENT_ACL_WITH_SERIES_ACL] === "true";
	}

	const initialValues = getInitialValues(
		metadataFields,
		extendedMetadata,
		uploadSourceOptions,
		user,
		aclDefaultActions,
		aclDefaultTemplate,
	);

	const [page, setPage] = useState(0);
	const [pageCompleted, setPageCompleted] = useState<{ [key: number]: boolean }>({});

	type StepName = "metadata" | "metadata-extended" | "source" | "upload-asset" | "processing" | "access" | "summary";
	type Step = WizardStep & {
		name: StepName,
		hidden: boolean,
	}

	// Caption of steps used by Stepper
	const filterSteps = (): Omit<Step, "hidden">[] => {
		const steps: Step[] = [
			{
				translation: "EVENTS.EVENTS.NEW.METADATA.CAPTION",
				name: "metadata",
				hidden: false,
			},
			{
				translation: "EVENTS.EVENTS.DETAILS.TABS.EXTENDED-METADATA",
				name: "metadata-extended",
				hidden: !(!!extendedMetadata && extendedMetadata.length > 0),
			},
			{
				translation: "EVENTS.EVENTS.NEW.SOURCE.CAPTION",
				name: "source",
				hidden: false,
			},
			{
				translation: "EVENTS.EVENTS.NEW.UPLOAD_ASSET.CAPTION",
				name: "upload-asset",
				hidden: assetUploadOptions.length === 0,
			},
			{
				translation: "EVENTS.EVENTS.NEW.PROCESSING.CAPTION",
				name: "processing",
				hidden: false,
			},
			{
				translation: "EVENTS.EVENTS.NEW.ACCESS.CAPTION",
				name: "access",
				hidden: !hasAccess("ROLE_UI_EVENTS_DETAILS_ACL_VIEW", user),
			},
			{
				translation: "EVENTS.EVENTS.NEW.SUMMARY.CAPTION",
				name: "summary",
				hidden: false,
			},
		];

		return steps.filter(step => !step.hidden);
	};

	const steps = filterSteps();

	// Validation schema of current page
	let currentValidationSchema;
	if (steps[page].name === "metadata" || steps[page].name === "metadata-extended") {
		currentValidationSchema = MetadataSchema(metadataFields);
	} else {
		currentValidationSchema = NewEventSchema[steps[page].name];
	}

	const nextPage = (values: typeof initialValues) => {
		// set page as completely filled out
		const updatedPageCompleted = pageCompleted;
		updatedPageCompleted[page] = true;
		setPageCompleted(updatedPageCompleted);

		let newPage = page;
		newPage = newPage + 1;

		// Skip asset upload step when scheduling
		if (steps[newPage].name === "upload-asset" && values.sourceMode !== "UPLOAD") {
			newPage = newPage + 1;
		}

		setPage(newPage);
	};

	const previousPage = (values: typeof initialValues) => {
		let newPage = page;
		newPage = newPage - 1;
		// Skip asset upload step when scheduling
		if (steps[newPage].name === "upload-asset" && values.sourceMode !== "UPLOAD") {
			newPage = newPage - 1;
		}

		setPage(newPage);
	};

	const handleSubmit = (values: typeof initialValues) => {
		const response = dispatch(postNewEvent({ values, metadataInfo: metadataFields, extendedMetadata }));
		console.info(response);
		close();
	};

	return (
		<>
			<Formik
				initialValues={initialValues}
				validationSchema={currentValidationSchema}
				onSubmit={values => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{formik => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm();
						// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [page]);

					return (
						<>
							{/* Stepper that shows each step of wizard as header */}
							<WizardStepper
								steps={steps}
								activePageIndex={page}
								setActivePage={setPage}
								completed={pageCompleted}
								setCompleted={setPageCompleted}
								isValid={formik.isValid}
								acls={formik.values.policies}
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
								{steps[page].name === "metadata-extended" && (
									<NewMetadataExtendedPage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
										extendedMetadataFields={extendedMetadata}
									/>
								)}
								{steps[page].name === "source" && (
									<NewSourcePage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
									/>
								)}
								{steps[page].name === "upload-asset" && (
									<NewAssetUploadPage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
									/>
								)}
								{steps[page].name === "processing" && (
									<NewProcessingPage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
									/>
								)}
								{steps[page].name === "access" && (
									<NewAccessPage
									// @ts-expect-error TS(7006):
										previousPage={previousPage}
										// @ts-expect-error TS(7006):
										nextPage={nextPage}
										// @ts-expect-error TS(7006):
										formik={formik}
										editAccessRole="ROLE_UI_EVENTS_DETAILS_ACL_EDIT"
										viewUsersAccessRole="ROLE_UI_EVENTS_DETAILS_ACL_USER_ROLES_VIEW"
										viewNonUsersAccessRole="ROLE_UI_EVENTS_DETAILS_ACL_NONUSER_ROLES_VIEW"
										initEventAclWithSeriesAcl={initEventAclWithSeriesAcl}
									/>
								)}
								{steps[page].name === "summary" && (
									<NewEventSummary
										previousPage={previousPage}
										formik={formik}
										metaDataExtendedHidden={!steps.some(step => step.name === "metadata-extended")}
										assetUploadHidden={!steps.some(step => step.name === "upload-asset")}
									/>
								)}
							</div>
						</>
					);
				}}
			</Formik>
		</>
	);
};

// Transform all initial values needed from information provided by backend
const getInitialValues = (
	metadataFields: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	uploadSourceOptions: UploadOption[],
	user: UserInfoState,
	aclDefaultActions?: string[],
	aclDefaultTemplate?: AclTemplate,
) => {
	let initialValues = initialFormValuesNewEvents;

	// Transform metadata fields provided by backend (saved in redux)
	initialValues = { ...initialValues, ...getInitialMetadataFieldValues(
		metadataFields,
	) };

	for (const catalog of extendedMetadata) {
		initialValues = { ...initialValues, ...getInitialMetadataFieldValues(
			catalog,
		) };
	}

	// Update start date for uploads
	if (sourceMetadata?.UPLOAD?.metadata?.[0]) {
		sourceMetadata.UPLOAD.metadata[0].value = new Date().toISOString();
	}

	// Transform additional metadata for source (provided by constant in newEventConfig)
	if (sourceMetadata.UPLOAD) {
		sourceMetadata.UPLOAD.metadata.forEach(field => {
			initialValues[field.id] = field.value;
		});
	}
	if (sourceMetadata.SCHEDULE_SINGLE) {
		sourceMetadata.SCHEDULE_SINGLE.metadata.forEach(field => {
			initialValues[field.id] = field.value;
		});
	}
	if (sourceMetadata.SCHEDULE_MULTIPLE) {
		sourceMetadata.SCHEDULE_MULTIPLE.metadata.forEach(field => {
			initialValues[field.id] = field.value;
		});
	}

	// Add possible files that can be uploaded in source step
	if (uploadSourceOptions) {
		initialValues.uploadAssetsTrack = [];
		// Sort by displayOrder
		uploadSourceOptions = uploadSourceOptions.slice().sort((a, b) => a.displayOrder - b.displayOrder);
		// initial value of upload asset needs to be null, because object (file) is saved there
		for (const option of uploadSourceOptions) {
			initialValues.uploadAssetsTrack.push({
				...option,
				file: undefined,
			});
		};
	}

	// Add all initial form values known upfront listed in newEventsConfig
	for (const [key, value] of Object.entries(initialFormValuesNewEvents)) {
		initialValues[key] = value;
	}

	const defaultDate = new Date();

	// fill times with some default values
	initialValues["scheduleStartHour"] = (defaultDate.getHours() + 1).toString();
	initialValues["scheduleStartMinute"] = "00";
	initialValues["scheduleDurationHours"] = "00";
	initialValues["scheduleDurationMinutes"] = "55";
	initialValues["scheduleEndHour"] = (defaultDate.getHours() + 1).toString();
	initialValues["scheduleEndMinute"] = "55";

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

export default NewEventWizard;
