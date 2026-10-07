import { useTranslation } from "react-i18next";
import { LifeCyclePolicy, TargetFilter } from "../../../../slices/lifeCycleSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Formik, FormikProps } from "formik";
import Notifications from "../../../shared/Notifications";
import { ConfigurationPanelField } from "../../../../slices/workflowSlice";
import { updateLifeCyclePolicy } from "../../../../slices/lifeCycleDetailsSlice";
import LifeCyclePolicyGeneralFields from "../wizards/LifeCyclePolicyGeneralFields";
import { hasAccess } from "../../../../utils/utils";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { LifeCyclePolicySchema } from "../../../../utils/validate";
import _ from "lodash";
import { parseTargetFiltersForEditing, parseTargetFiltersForSubmit } from "../../../../utils/lifeCycleUtils";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { addNotification } from "../../../../slices/notificationSlice";
import { NOTIFICATION_CONTEXT } from "../../../../configs/modalConfig";

/**
 * This component renders details about a recording/capture agent
 */
const LifeCyclePolicyGeneralTab = ({
	policy,
}: {
	policy: LifeCyclePolicy
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));

	const handleSubmit = (values: LifeCyclePolicy & {
		workflowParameters: ConfigurationPanelField[],
		targetFiltersTransformed: { [key: string]: (TargetFilter & { filter: string })[] }
	}) => {

		// Parse filters
		const targetFilters: typeof values["targetFilters"] = parseTargetFiltersForSubmit(values.targetFiltersTransformed);

		// TODO: Improve workflowParameters rendering
		// Parse action parameters
		// const workflowParameters: { [key: string]: unknown} = {};
		// for (const field of values.workflowParameters) {
		//   if (field.fieldset && field.fieldset.length > 0) {
		//     workflowParameters[field.fieldset[0].name] = field.fieldset[0].value
		//   }
		// }
		// const newActionParameters = {
		//   ...values.actionParameters,
		//   workflowParameters
		// }

		const newValues = {
			...values,
			targetFilters: targetFilters,
			// actionParameters: newActionParameters,
		};
		// values.actionParameters["workflowParameters"] = JSON.stringify(workflowParameters);

		dispatch(updateLifeCyclePolicy(newValues))
			.unwrap()
			.then(() => {
				dispatch(addNotification({
					type: "info",
					key: "LIFECYCLE_POLICY_SAVED",
					duration: 3,
					context: NOTIFICATION_CONTEXT,
				}));
			})
			.catch(() => {
				dispatch(addNotification({
					type: "warning",
					key: "LIFECYCLE_POLICY_NOT_SAVED",
					duration: 3,
					context: NOTIFICATION_CONTEXT,
				}));
			});
	};

	// set current values of metadata fields as initial values
	const getInitialValues = (policy: LifeCyclePolicy) => {
		const initialValues: LifeCyclePolicy & {
			workflowParameters: ConfigurationPanelField[],
			targetFiltersTransformed: { [key: string]: (TargetFilter & { filter: string })[] }
		} = {
			workflowParameters: [],
			targetFiltersTransformed: {},
			...policy,
		};

		// Access policies are handled in a different tab
		// Remove them here, else they will delete the ACL due to their formatting
		// @ts-expect-error: TODO: Find a typesafe (or straight up better) way to do this
		delete initialValues.accessControlEntries;

		// Transform filters into something more editable
		const targetFiltersTransformed = {
			"dublincore/episode": [],
			...parseTargetFiltersForEditing(policy.targetFilters),
		};
		// for (const key in policy.targetFilters) {
		// 	targetFiltersArray.push({
		// 		filter: key,
		// 		...policy.targetFilters[key],
		// 	});
		// }

		// TODO: Improve workflowParameters rendering
		// Parse action parameters
		// const configPanelFields: ConfigurationPanelField[] = []
		// const workflowParameters = JSON.parse(policy.actionParameters["workflowParameters"] as string)
		// Object.entries(workflowParameters).forEach(([key, value]) => {
		//   configPanelFields.push({
		//     fieldset: [{
		//       name: key,
		//       value: value,
		//       defaultValue: value,
		//       type: "text",
		//       checked: false,
		//       label: key,
		//     }]
		//   });
		// });

		initialValues.targetFiltersTransformed = targetFiltersTransformed;
		// initialValues.workflowParameters = configPanelFields;

		return initialValues;
	};

	const checkValidity = (formik: FormikProps<ReturnType<typeof getInitialValues>>) => {
		if (formik.dirty && formik.isValid && hasAccess("ROLE_UI_LIFECYCLEPOLICY_DETAILS_GENERAL_EDIT", user)) {
			// check if user provided values differ from initial ones
			return !_.isEqual(formik.values, formik.initialValues);
		} else {
			return false;
		}
	};

	return (
		// initialize form
		<Formik
			enableReinitialize
			initialValues={getInitialValues(policy)}
			validationSchema={LifeCyclePolicySchema[0]}
			onSubmit={values => handleSubmit(values)}
		>
			{formik => (
				<>
					<div className="modal-content">
						<div className="modal-body">
							<Notifications context="not_corner" />
							<div className="full-col">
								{/* <div className="obj tbl-list">
									<header className="no-expand">{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.CAPTION")}</header> */}

									{/* Render fields */}
									<LifeCyclePolicyGeneralFields
										formik={formik}
										isNew={false}
									/>

									<div className="obj list-obj">
										<header className="no-expand">
											{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.NOTE.TITLE")}
										</header>
										<div className="obj-container">
											<span>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.NOTE.MESSAGE")}</span>
										</div>
									</div>

									{formik.dirty && (
										// Render buttons for updating metadata
										<WizardNavigationButtons
											formik={formik}
											customValidation={!checkValidity(formik)}
											previousPage={() => formik.resetForm()}
											createTranslationString="SAVE"
											cancelTranslationString="CANCEL"
											isLast
										/>
									)}
								{/* </div> */}
							</div>
						</div>
					</div>
				</>
			)}
		</Formik>
	);
};

export default LifeCyclePolicyGeneralTab;
