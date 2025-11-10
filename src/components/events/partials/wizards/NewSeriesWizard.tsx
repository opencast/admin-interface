import { useEffect, useState } from "react";
import { Formik } from "formik";
import NewThemePage from "../ModalTabsAndPages/NewThemePage";
import NewSeriesSummary from "./NewSeriesSummary";
import {
	getSeriesExtendedMetadata,
	getSeriesMetadata,
	getSeriesTobiraPageError,
	getSeriesTobiraPageStatus,
} from "../../../../selectors/seriesSeletctor";
import NewMetadataExtendedPage from "../ModalTabsAndPages/NewMetadataExtendedPage";
import NewAccessPage from "../ModalTabsAndPages/NewAccessPage";
import WizardStepper, { WizardStep } from "../../../shared/wizard/WizardStepper";
import { initialFormValuesNewSeries } from "../../../../configs/modalConfig";
import { MetadataSchema, NewSeriesSchema } from "../../../../utils/validate";
import { getInitialMetadataFieldValues } from "../../../../utils/resourceUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchSeriesDetailsTobiraNew, postNewSeries } from "../../../../slices/seriesSlice";
import { MetadataCatalog } from "../../../../slices/eventSlice";
import NewTobiraPage from "../ModalTabsAndPages/NewTobiraPage";
import { getOrgProperties, getUserInformation } from "../../../../selectors/userInfoSelectors";
import { UserInfoState } from "../../../../slices/userInfoSlice";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import NewMetadataCommonPage from "../ModalTabsAndPages/NewMetadataCommonPage";
import { hasAccess } from "../../../../utils/utils";
import { getAclDefaultActions, getAclDefaultTemplate } from "../../../../selectors/aclSelectors";
import { AclTemplate } from "../../../../slices/aclSlice";

/**
 * This component manages the pages of the new series wizard and the submission of values
 */
const NewSeriesWizard = ({
	close,
}: {
	close: () => void
}) => {
	const dispatch = useAppDispatch();

	const metadataFields = useAppSelector(state => getSeriesMetadata(state));
	const extendedMetadata = useAppSelector(state => getSeriesExtendedMetadata(state));
	const tobiraStatus = useAppSelector(state => getSeriesTobiraPageStatus(state));
	const tobiraError = useAppSelector(state => getSeriesTobiraPageError(state));
	const user = useAppSelector(state => getUserInformation(state));
	const orgProperties = useAppSelector(state => getOrgProperties(state));
	const aclDefaultActions = useAppSelector(state => getAclDefaultActions(state));
	const aclDefaultTemplate = useAppSelector(state => getAclDefaultTemplate(state));

	useEffect(() => {
		dispatch(removeNotificationWizardForm());

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// This should set off a web request that will intentionally fail, in order
		// to check if tobira is available at all
		dispatch(fetchSeriesDetailsTobiraNew(""));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const themesEnabled = (orgProperties["admin.themes.enabled"] || "false").toLowerCase() === "true";

	const initialValues = getInitialValues(
		metadataFields,
		extendedMetadata,
		user,
		aclDefaultActions,
		aclDefaultTemplate,
	);

	const [page, setPage] = useState(0);
	const [pageCompleted, setPageCompleted] = useState<{ [key: number]: boolean }>({});


	type StepName = "metadata" | "metadata-extended" | "access" | "theme" | "tobira" | "summary";
	type Step = WizardStep & {
		name: StepName,
		hidden: boolean,
	}

	// Caption of steps used by Stepper
	const filterSteps = (): Omit<Step, "hidden">[] => {
		const steps: Step[] = [
			{
				translation: "EVENTS.SERIES.NEW.METADATA.CAPTION",
				name: "metadata",
				hidden: false,
			},
			{
				translation: "EVENTS.EVENTS.DETAILS.TABS.EXTENDED-METADATA",
				name: "metadata-extended",
				hidden: !(!!extendedMetadata && extendedMetadata.length > 0),
			},
			{
				translation: "EVENTS.SERIES.NEW.ACCESS.CAPTION",
				name: "access",
				hidden: false,
			},
			{
				translation: "EVENTS.SERIES.NEW.THEME.CAPTION",
				name: "theme",
				hidden: !themesEnabled,
			},
			{
				translation: "EVENTS.SERIES.NEW.TOBIRA.CAPTION",
				name: "tobira",
				hidden: !hasAccess("ROLE_UI_SERIES_DETAILS_TOBIRA_EDIT", user) || !!(tobiraStatus === "failed" && tobiraError?.message?.includes("503")),
			},
			{
				translation: "EVENTS.SERIES.NEW.SUMMARY.CAPTION",
				name: "summary",
				hidden: false,
			},
		];
		return steps.filter(step => !step.hidden);
	};

	const steps = filterSteps();

	// Validation schema of current page
	let currentValidationSchema;
	if (page === 0 || page === 1) {
		currentValidationSchema = MetadataSchema(metadataFields);
	} else {
		currentValidationSchema = NewSeriesSchema[steps[page].name];
	}

	const nextPage = () => {
		// set page as completely filled out
		const updatedPageCompleted = pageCompleted;
		updatedPageCompleted[page] = true;
		setPageCompleted(updatedPageCompleted);

		setPage(page + 1);
	};

	const previousPage = () => {
		setPage(page - 1);
	};

	const handleSubmit = (
		values:
			{
				[key: string]: any;
				policies: TransformedAcl[];
				theme: string;
			},
	) => {
		const response = dispatch(postNewSeries({ values, metadataInfo: metadataFields, extendedMetadata }));
		console.info(response);
		close();
	};

	return (
		<>
			{/* Initialize overall form */}
			<Formik
				initialValues={initialValues}
				validationSchema={currentValidationSchema}
				onSubmit={values => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{formik => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm().then();
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
								{steps[page].name === "metadata-extended" && (
									<NewMetadataExtendedPage
										nextPage={nextPage}
										previousPage={previousPage}
										formik={formik}
										extendedMetadataFields={extendedMetadata}
									/>
								)}
								{steps[page].name === "access" && (
									<NewAccessPage
										nextPage={nextPage}
										previousPage={previousPage}
										// @ts-expect-error TS(7006):
										formik={formik}
										editAccessRole="ROLE_UI_SERIES_DETAILS_ACL_EDIT"
										viewUsersAccessRole="ROLE_UI_SERIES_DETAILS_ACL_USER_ROLES_VIEW"
										viewNonUsersAccessRole="ROLE_UI_SERIES_DETAILS_ACL_NONUSER_ROLES_VIEW"
										initEventAclWithSeriesAcl={false}
									/>
								)}
								{steps[page].name === "theme" && (
									<NewThemePage
										nextPage={nextPage}
										previousPage={previousPage}
										formik={formik}
									/>
								)}
								{steps[page].name === "tobira" && (
									<NewTobiraPage
										mode={{ mount: true }}
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{steps[page].name === "summary" && (
									<NewSeriesSummary
										previousPage={previousPage}
										formik={formik}
										metaDataExtendedHidden={!steps.some(step => step.name === "metadata-extended")}
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

const getInitialValues = (
	metadataFields: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	user: UserInfoState,
	aclDefaultActions: string[],
	aclDefaultTemplate?: AclTemplate,
) => {
	let initialValues = initialFormValuesNewSeries;

	// Transform metadata fields provided by backend (saved in redux)
	let metadataInitialValues = getInitialMetadataFieldValues(
		metadataFields,
	);

	for (const catalog of extendedMetadata) {
		metadataInitialValues = { ...metadataInitialValues, ...getInitialMetadataFieldValues(
			catalog,
		) };
	}

	initialValues = { ...initialValues, ...metadataInitialValues };

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

export default NewSeriesWizard;
