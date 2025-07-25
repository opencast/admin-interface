import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import {
	getWorkflowDefById,
} from "../../../../selectors/workflowSelectors";
import { useAppSelector } from "../../../../store";
import { FieldSetField } from "../../../../slices/workflowSlice";

/**
 * This component renders the configuration panel for the selected workflow in the processing step of the new event
 * wizard chosen via dropdown.
 */
interface RequiredFormProps {
	configuration?: { [key: string]: any }
}

const RenderWorkflowConfig = <T extends RequiredFormProps>({
	workflowId,
	formik,
	displayDescription,
}: {
	workflowId: string
	formik: FormikProps<T>
	displayDescription?: boolean
}) => {

	const workflowDef = useAppSelector(state => getWorkflowDefById(state, workflowId));

	// Get html for configuration panel
	const configPanel = !!workflowDef && workflowDef.configurationPanelJson
		? workflowDef.configurationPanelJson
		: [];
	const description = !!workflowDef && workflowDef.description
		? workflowDef.description
		: "";

	const descriptionBoxStyle = {
		margin: "15px 0 0 0",
		position: "relative" as const,
		border: "solid #c9d0d3",
		borderWidth: "1px",
		backgroundColor: "#fafafa",
		overflow: "hidden",
		borderRadius: "4px",
	};

	const descriptionTextStyle = {
		margin: "10px",
		fontFamily: '"Open sans", Helvetica,sans-serif',
		fontSize: "12px",
		whiteSpace: "pre-line" as const,
	};

	return (
		<>
			{displayDescription && description.length > 0 && (
				<div className="collapsible-box" style={descriptionBoxStyle}>
					<div style={descriptionTextStyle}>{description.trim()}</div>
				</div>
			)}

			{Array.isArray(configPanel) && configPanel.length > 0 && (
				<form>
					<div id="workflow-configuration">
						{configPanel.map((configOption, key) => (
							<fieldset key={key}>
								{!!configOption.legend && (
									<legend>{configOption.legend}</legend>
								)}
								{!!configOption.description && (
									<p>{configOption.description}</p>
								)}
								<ul>
									{configOption.fieldset?.map((field, keys) =>
										renderInputByType(field, keys, formik),
									)}
								</ul>
							</fieldset>
						))}
					</div>
				</form>
			)}
		</>
	);
};

// render input depending on field type
const renderInputByType = <T extends RequiredFormProps>(
	field: FieldSetField,
	key: React.Key | null | undefined,
	formik: FormikProps<T>,
) => {
	switch (field.type) {
		case "checkbox":
			return <RenderCheckbox field={field} key={key} formik={formik} />;
		case "radio":
			return <RenderRadio field={field} key={key} formik={formik} />;
		case "number":
			return <RenderNumber field={field} key={key} formik={formik} />;
		case "text":
			return <RenderText field={field} key={key} formik={formik} />;
		case "datetime-local":
			return <RenderDatetimeLocal field={field} key={key} formik={formik} />;
		default:
			return "";
	}
};

const RenderDatetimeLocal = <T extends RequiredFormProps>(
	{ field, formik } : { field: FieldSetField, formik: FormikProps<T> }) => {
		return <RenderField field={field} formik={formik} />;
};

const RenderCheckbox = <T extends RequiredFormProps>(
	{ field, formik } : { field: FieldSetField, formik: FormikProps<T> }) => {
		return <RenderField field={field} formik={formik} />;
};

const RenderRadio = <T extends RequiredFormProps>(
	{ field, formik } : { field: FieldSetField, formik: FormikProps<T> }) => {
		return <RenderField field={field} formik={formik} />;
};

const RenderNumber = <T extends RequiredFormProps>(
	{ field, formik } : { field: FieldSetField, formik: FormikProps<T> }) => {
	// validate that value of number is between max and min
	const validate = (value: string) => {
		let error;
		if (field.max && field.min && (parseInt(value) > field.max || parseInt(value) < field.min)) {
			error = "out of range";
		}
		return error;
	};

		return <RenderField field={field} formik={formik} validate={validate}/>;
};

const RenderText = <T extends RequiredFormProps>({
	field,
	formik,
}: {
	field: FieldSetField,
	formik: FormikProps<T>,
}) => {
		return <RenderField field={field} formik={formik} />;
};

const RenderField = <T extends RequiredFormProps>({
	field,
	formik,
	validate = undefined,
}: {
	field: FieldSetField,
	formik: FormikProps<T>,
	validate?: (value: any) => string | undefined,
}) => {
	// id used for Field and label
	const uuid = uuidv4();
	const disabled = field.disabled ? field.disabled : false;

	const renderField = () => {
			return (
				<Field
					id={uuid}
					defaultValue={field.defaultValue}
					validate={validate}
					className="configField"
					name={"configuration." + field.name}
					disabled={disabled}
					type={field.type}
					min={field.min}
					max={field.max}
				/>
			);
	};

	return (
		<li>
			{renderField()}
			<label htmlFor={uuid}>{field.label as string}</label>
			{/* if input has an additional fieldset or further configuration inputs
						then render again by input type*/}
			{!!field.fieldset && !!formik.values.configuration && !!formik.values.configuration[field.name] && (
				<ul className="workflow-configuration-subpanel">
					{field.fieldset?.map((f, keys) => renderInputByType(f, keys, formik))}
				</ul>
			)}
		</li>
	);
};

export default RenderWorkflowConfig;
