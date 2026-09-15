import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FieldArray, FieldProps, FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import RenderField from "../../../shared/wizard/RenderField";
import { ALL_TARGET_FILTER_TYPES, LifeCyclePolicy, TargetFilter } from "../../../../slices/lifeCycleSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getLifeCyclePolicyActions, getLifeCyclePolicyTargetTypes, getLifeCyclePolicyTimings } from "../../../../selectors/lifeCycleDetailsSelectors";
import DropDown from "../../../shared/DropDown";
import { getEventMetadata } from "../../../../selectors/eventSelectors";
import { fetchEventMetadata } from "../../../../slices/eventSlice";
import { formatPolicyActionsForDropdown, formatWorkflowsForDropdown } from "../../../../utils/dropDownUtils";
import { getWorkflowDef } from "../../../../selectors/workflowSelectors";
import { fetchWorkflowDef } from "../../../../slices/workflowSlice";
import RenderWorkflowConfig, { Configuration } from "./RenderWorkflowConfig";
import { setDefaultConfig } from "../../../../utils/workflowPanelUtils";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { LuCircleX } from "react-icons/lu";

/**
 * This component renders the metadata page for new events and series in the wizards.
 */
// interface RequiredFormProps {
// sourceMode: string,
// processingWorkflow: string,
// }
type EventFilterOption = {
	id: string,
	type: string,
	collection?: unknown
}

const LifeCyclePolicyGeneralFields = <T extends LifeCyclePolicy & {targetFiltersTransformed: { [key: string]: (TargetFilter & { filter: string })[] }}>({
	formik,
	isNew,
}: {
	formik: FormikProps<T>,
	isNew: boolean
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const actions = useAppSelector(state => getLifeCyclePolicyActions(state));
	const targetTypes = useAppSelector(state => getLifeCyclePolicyTargetTypes(state));
	const timings = useAppSelector(state => getLifeCyclePolicyTimings(state));
	const metadataFields = useAppSelector(state => getEventMetadata(state));

	useEffect(() => {
		dispatch(fetchEventMetadata());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const ADDITIONAL_TARGET_FILTER_KEYS_EVENTS = [
		{
			id: "series_name",
			type: "text",
			collection: undefined,
		},
		{
			id: "presenter",
			type: "text",
			collection: undefined,
		},
		{
			id: "start_date",
			type: "date",
			collection: undefined,
		},
		{
			id: "end_date",
			type: "date",
			collection: undefined,
		},
		{
			id: "created",
			type: "date",
			collection: undefined,
		},
		{
			id: "source",
			type: "text",
			collection: undefined,
		},
		{
			id: "rights",
			type: "text",
			collection: undefined,
		},
		{
			id: "location",
			type: "text",
			collection: undefined,
		},
	];

	const eventFilterOptions: EventFilterOption[] = [];
	for (const field of metadataFields.fields) {
		eventFilterOptions.push(field);
	}
	for (const field of ADDITIONAL_TARGET_FILTER_KEYS_EVENTS) {
		eventFilterOptions.push(field);
	}

	const createTargetFilter = (): TargetFilter => {
		return {
			value: "",
			type: "SEARCH",
			must: true,
		};
	};

	const filterOptions = (targetType: string) => {
		switch (targetType) {
			case "EVENT":
				return eventFilterOptions;
			default:
				return [];
		}
	};

	const filterTargetTypesByFilter = (filter: string) => {
		const event = eventFilterOptions.find(event => event.id === filter);

		if (!event) {
			return ALL_TARGET_FILTER_TYPES;
		}
		if (event.type.includes("text")) {
			return ["SEARCH", "WILDCARD"];
		}
		if (event.type.includes("date")) {
			return ["GREATER_THAN", "LESS_THAN"];
		}
		return ALL_TARGET_FILTER_TYPES;
	};


	return (
		<>
			<div className="obj tbl-list">
				<header className="no-expand">{t("LIFECYCLE.POLICIES.NEW.GENERAL.CAPTION")}</header>
				<table className="main-tbl">
					<tbody>

					<tr>
						<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TITLE")}<i className="required">*</i></td>
						<td className="editable">
							<Field
									type="text"
									name="title"
									metadataField={{
										type: "text",
										required: true,
										collection: undefined,
										id: undefined,
									}}
									component={RenderField}
									isFirstField
								/>
							</td>
					</tr>
					{!isNew &&
						<tr>
							<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ISACTIVE")}<i className="required">*</i></td>
							<td className="editable">
								<Field
									type="checkbox"
									name="isActive"
									disabled={true}
								/>
							</td>
						</tr>
					}
					{!isNew &&
						<tr>
							<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ISCREATEDFROMCONFIG")}</td>
							<td className="editable">
								<Field
									type="checkbox"
									name="isCreatedFromConfig"
									disabled={true}
								/>
							</td>
						</tr>
					}
					<tr>
						<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETTYPE")}<i className="required">*</i></td>
						<td className="editable">
							<Field
								key={targetTypes?.join(",") ?? "targetTypes_empty"}
								name="targetType"
								metadataField={{
									type: "text",
									required: true,
									collection: targetTypes.map(element => ({ value: element, name: element })),
									id: "language",
								}}
								component={RenderField}
							/>
						</td>
					</tr>
					<tr>
						<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TIMING")}<i className="required">*</i></td>
						<td className="editable">
							<Field
								key={timings?.join(",") ?? "timings_empty"}
								name={"timing"}
								metadataField={{
									type: "text",
									required: true,
									collection: timings.map(element => ({ value: element, name: element })),
									id: "language",
								}}
								component={RenderField}
							/>
						</td>
					</tr>
					<tr>
						<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ACTION")}<i className="required">*</i></td>
						<td className="editable">
							<Field
								key={actions?.join(",") ?? "actions_empty"}
								name={"action"}
								metadataField={{
									type: "text",
									required: true,
									collection: actions.map(element => ({ value: element, name: element })),
									id: "language",
								}}
								component={RenderField}
							/>
						</td>
					</tr>
					{formik.values.timing === "SPECIFIC_DATE" &&
					<tr>
						<td>
							{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ACTIONDATE")}
							{formik.values.timing === "SPECIFIC_DATE" && <i className="required">*</i>}
						</td>
						<td className="editable">
							<Field
								name={"actionDate"}
								// component={DateTimePickerField}
								metadataField={{
									type: "date",
									required: false,
									collection: undefined,
									id: undefined,
								}}
								component={RenderField}
							/>
						</td>
					</tr>
					}
					{formik.values.timing === "REPEATING" &&
					<tr>
						<td>
							{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.CRONTRIGGER")}
							{formik.values.timing === "REPEATING" && <i className="required">*</i>}
						</td>
						<td>
							<Field
								type="cron"
								name="cronTrigger"
								metadataField={{
									type: "cron",
									required: false,
									collection: undefined,
									id: undefined,
								}}
								component={RenderField}
							/>
						</td>
					</tr>
					}
					{!isNew &&
						<tr>
							<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ID")}</td>
							<td className="editable">
								{formik.values.id}
							</td>
						</tr>
					}

					</tbody>
				</table>
			</div>

			<div></div>


			{/* Target Filters like the ACLs
						Can we make "key" a dropdown?
						Type of "Value" should depend on key, e.g. for key "start_date" show a date picker
			*/}
			<div className="obj tbl-list">
				<header>
					{ t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.CAPTION") }
				</header>

				<table className="main-tbl">
					{/* column headers */}
					<thead>
						<tr>
							<th>
								{ t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.FILTER") }
							</th>
							<th className="fit">
								{ t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.VALUE") }
							</th>
							<th className="fit">
								{ t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.TYPE") }
							</th>
							<th className="fit">
								{ t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.MUST") }
							</th>
							<th className="fit">
								{ t("EVENTS.EVENTS.DETAILS.ACCESS.ACCESS_POLICY.ACTION") }
							</th>
						</tr>
					</thead>

					<tbody>
						{Object.entries(formik.values.targetFiltersTransformed).map(([outerKey, filters]) => {
							if (outerKey !== "dublincore/episode") { return null; }

							return (
								<FieldArray
									key={outerKey}
									name={`targetFiltersTransformed.${outerKey}`}
									render={arrayHelpers => (
										<>
											{Object.entries(filters).map(([key, filter], index) => {
												// Get available filter options
												const availableFilterOptions = filterOptions(formik.values.targetType);

												// Derive available type options based on selected filter
												const dependentTypeOptions = filterTargetTypesByFilter(filter.filter);

												return (
													<tr key={index}>
														<td className="editable">
															<Field
																type="time"
																name={`targetFiltersTransformed.${outerKey}.${key}.filter`}
																value={filter.filter}
																values={availableFilterOptions.map(e => e.id)}
																creatable={true}
																clearFieldName={`targetFiltersTransformed.${outerKey}.${key}.value`}
																component={DropdownField}
																onChangeOverride={(element: { value: string; label: string } | null) => {
																	formik.setFieldValue(`targetFiltersTransformed.${outerKey}.${key}.value`, undefined);
																	formik.setFieldValue(`targetFiltersTransformed.${outerKey}.${key}.filter`, element?.value ?? undefined);
																	// Reset type when filter changes
																	formik.setFieldValue(`targetFiltersTransformed.${outerKey}.${key}.type`, element?.value ? filterTargetTypesByFilter(element?.value)[0] : undefined);
																}}
															/>
														</td>
														<td className="editable">
															<Field
																key={`type-${filter.filter}-${index}`} // ensures rerender when filter changes
																name={`targetFiltersTransformed.${outerKey}.${key}.value`}
																metadataField={{
																	type: getTargetFilterRenderType(filter.filter, availableFilterOptions),
																	required: true,
																	collection: getTargetFilterRenderCollection(filter.filter, availableFilterOptions),
																	id: filter.filter,
																}}
																component={RenderField}
															/>
														</td>
														<td className="editable">
															<Field
																key={`type-${filter.filter}-${index}`} // ensures rerender when filter changes
																name={`targetFiltersTransformed.${outerKey}.${key}.type`}
																value={filter.type}
																values={dependentTypeOptions}
																component={DropdownField}
															/>
														</td>
														<td className="editable">
															<Field
																type="checkbox"
																name={`targetFiltersTransformed.${outerKey}.${key}.must`}
															/>
														</td>
														<td>
															<ButtonLikeAnchor
																onClick={() => arrayHelpers.remove(index)}
																className="action-cell-button remove"
															>
																<LuCircleX />
															</ButtonLikeAnchor>
														</td>
													</tr>
												);
											})}
											<tr>
												<td colSpan={5}>
													<ButtonLikeAnchor
														onClick={() =>
															arrayHelpers.push(createTargetFilter())
														}
														className="button-like-anchor"
													>
														+{" "}
														{t(
															"LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.NEW",
														)}
													</ButtonLikeAnchor>
												</td>
											</tr>
										</>
									)}
								/>
							);
						})}
					</tbody>
				</table>
			</div>

			{formik.values.action === "START_WORKFLOW" &&
				<WorkflowSelector
					formik={formik}
				/>
			}
		</>
	);
};


export default LifeCyclePolicyGeneralFields;

const DropdownField = ({
	field,
	form: { setFieldValue },
	value,
	values,
	clearFieldName,
	creatable = false,
	onChangeOverride,
}: {
	field: FieldProps["field"]
	form: FieldProps["form"]
	value: string,
	values: string[]
	clearFieldName: string
	creatable: boolean
	onChangeOverride?: (element: { value: string; label: string } | null) => void
}) => {
	const { t } = useTranslation();

	const handleChange = (element: { value: string; label: string } | null) => {
		if (onChangeOverride) {
			// call the override function if provided
			onChangeOverride(element);
		} else {
			// default behavior
			setFieldValue(clearFieldName, undefined);
			if (element) {
				setFieldValue(field.name, element.value);
			}
		}
	};

	return (
		<DropDown
			value={field.value as string}
			text={value}
			options={values ? formatPolicyActionsForDropdown(values) : []}
			required={true}
			handleChange={handleChange}
			placeholder={`-- ${t("SELECT_NO_OPTION_SELECTED")} --`}
			creatable={creatable}
			customCSS={{
				width: "100%",
			}}
		/>
	);
};

const getTargetFilterRenderType = (filterName: string, targetFilterOptions: { id: string, type: string, collection?: unknown }[]) => {
	const option = targetFilterOptions.find(e => e.id === filterName);
	if (option === undefined) {
		return "text";
	}
	// Simplify types like "long_text" or "mixed_text"
	if (option.type.includes("text")) {
		return "text";
	}
	return option.type;
};

const getTargetFilterRenderCollection = (filterName: string, targetFilterOptions: { id: string, type: string, collection?: unknown }[]) => {
	const option = targetFilterOptions.find(e => e.id === filterName);
	return option !== undefined ? option.collection : undefined;
};

const WorkflowSelector = <T extends LifeCyclePolicy & {targetFiltersTransformed: { [key: string]: (TargetFilter & { filter: string })[] }}>({
	formik,
}: {
	formik: FormikProps<T>,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const workflowDef = useAppSelector(state => getWorkflowDef(state));
	// const lol = JSON.parse(formik.values.actionParameters.workflowParameters)

	useEffect(() => {
		// Load workflow definitions for selecting
		dispatch(fetchWorkflowDef("tasks"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setDefaultValues = (value: string) => {
		const workflowId = value;
		// fill values with default configuration of chosen workflow
		const defaultConfiguration = setDefaultConfig(workflowDef, workflowId);

		// set default configuration in formik
		formik.setFieldValue("actionParameters.workflowParameters", defaultConfiguration);
		// set chosen workflow in formik
		formik.setFieldValue("actionParameters.workflowId", workflowId);
	};

	return (
		<div className="obj quick-actions">
			<header>
				{t("EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW")}
			</header>
			<div className="obj-container padded">
				{workflowDef.length > 0 ? (
					<div className="editable">
						<DropDown
							value={formik.values.actionParameters.workflowId}
							text={
								workflowDef.find(
									workflow =>
										formik.values.actionParameters.workflowId === workflow.id,
								)?.title ?? ""
							}
							options={formatWorkflowsForDropdown(workflowDef)}
							required={true}
							handleChange={element => {
								if (element) {
									setDefaultValues(element.value as string);
								}
							}}
							placeholder={t(
								"EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW",
							)}
							customCSS={{ width: "100%" }}
						/>
					</div>
				) : (
					<span>
						{t("EVENTS.EVENTS.NEW.PROCESSING.SELECT_WORKFLOW_EMPTY")}
					</span>
				)}

				{/* Configuration panel of selected workflow */}
				<div className="collapsible-box">
					<div
						id="new-event-workflow-configuration"
						className="checkbox-container obj-container"
					>
						{formik.values.actionParameters.workflowId ? (
							<RenderWorkflowConfig
								displayDescription
								workflowId={formik.values.actionParameters.workflowId as string}
								configuration={formik.values.actionParameters.workflowParameters as Configuration}
								configurationName={"actionParameters.workflowParameters"}
							/>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};
