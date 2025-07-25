import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import cn from "classnames";
import { getMetadataCollectionFieldName } from "../../../utils/resourceUtils";
import { getCurrentLanguageInformation } from "../../../utils/utils";
import DropDown from "../DropDown";
import { parseISO } from "date-fns";
import { FieldProps } from "formik";
import { MetadataField } from "../../../slices/eventSlice";
import { GroupBase, SelectInstance } from "react-select";
import TextareaAutosize from "react-textarea-autosize";

/**
 * This component renders an editable field for single values depending on the type of the corresponding metadata
 */
const RenderField = ({
	field,
	metadataField,
	form,
	showCheck = false,
	isFirstField = false,
}: {
	field: FieldProps["field"]
	metadataField: MetadataField
	form: FieldProps["form"]
	showCheck?: boolean,
	isFirstField?: boolean,
}) => {
	const { t } = useTranslation();

	// TODO: Figure out how to type a ref that could have multiple types
	const editableRef = useRef<any>(null);
	const [focused, setFocused] = useState(false);
	const onFocus = () => setFocused(true);
	const onBlur = () => setFocused(false);

	return (
		<div
			onClick={() => {
				if (editableRef.current) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					if (editableRef.current.focus) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
						editableRef.current.focus();
					}
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					if (editableRef.current.setFocus) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
						editableRef.current.setFocus(); // For DatePicker
					}
				}
			}}
			onFocus={onFocus}
			onBlur={onBlur}
			style={{ display: "flex", justifyContent: "space-between" }}
		>
			{metadataField.type === "time" && (
				<EditableSingleValueTime
					field={field}
					form={form}
					isFirstField={isFirstField}
					ref={editableRef}
				/>
			)}
			{metadataField.type === "text" &&
				!!metadataField.collection &&
				metadataField.collection.length > 0 && (
					<EditableSingleSelect
						metadataField={metadataField}
						field={field}
						form={form}
						text={getMetadataCollectionFieldName(metadataField, field, t)}
						isFirstField={isFirstField}
						focused={focused}
						setFocused={setFocused}
						ref={editableRef}
					/>
				)}
			{metadataField.type === "ordered_text" && (
				<EditableSingleSelect
					metadataField={metadataField}
					field={field}
					form={form}
					text={getMetadataCollectionFieldName(metadataField, field, t)}
					isFirstField={isFirstField}
					focused={focused}
					setFocused={setFocused}
					ref={editableRef}
				/>
			)}
			{metadataField.type === "text" &&
				!(
					!!metadataField.collection && metadataField.collection.length !== 0
				) && (
					<EditableSingleValue
						field={field}
						isFirstField={isFirstField}
						ref={editableRef}
					/>
				)}
			{metadataField.type === "text_long" && (
				<EditableSingleValueTextArea
					field={field}
					isFirstField={isFirstField}
					ref={editableRef}
				/>
			)}
			{metadataField.type === "date" && (
				<EditableDateValue
					field={field}
					form={form}
					isFirstField={isFirstField}
					ref={editableRef}
				/>
			)}
			{metadataField.type === "boolean" && (
				<EditableBooleanValue
					field={field}
					isFirstField={isFirstField}
					ref={editableRef}
				/>
			)}
			<div style={{ display: "flex", justifyContent: "flex-end" }}>
				{!focused && showCheck && (
					<i
						className={cn("saved fa fa-check", {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							active: form.initialValues[field.name] !== field.value,
						})}
					/>
				)}
				{!focused && <i className="edit fa fa-pencil-square" />}
			</div>
		</div>
	);
};

// Renders editable field for a boolean value
const EditableBooleanValue = ({
	field,
	isFirstField,
	ref,
}: {
	field: FieldProps["field"]
	isFirstField?: boolean,
	ref: React.RefObject<HTMLInputElement>
}) => {
	return (
		<input
			{...field}
			ref={ref}
			type="checkbox"
			checked={field.value as boolean}
			autoFocus={isFirstField}
		/>
	);
};

// Renders editable field for a data value
const EditableDateValue = ({
	field,
	form: { setFieldValue },
	isFirstField,
	ref,
}: {
	field: FieldProps["field"]
	form: FieldProps["form"]
	isFirstField?: boolean,
	ref: React.RefObject<DatePicker>
}) => {
	return (
		// For some reason onclick events are bubbling up from the datepicker which we do not want.
		// Therefore we wrap it.
		<div onClick={e => { e.stopPropagation(); }}>
			<DatePicker
				ref={ref}
				selected={!isNaN(Date.parse(field.value as string)) ? new Date(field.value as string) : null}
				onChange={value => setFieldValue(field.name, value)}
				showTimeInput
				showYearDropdown
				showMonthDropdown
				yearDropdownItemNumber={2}
				dateFormat="Pp"
				popperPlacement="bottom-start"
				popperClassName="datepicker-custom"
				className="datepicker-custom-input"
				wrapperClassName="datepicker-custom-wrapper"
				locale={getCurrentLanguageInformation()?.dateLocale}
				strictParsing
				autoFocus={isFirstField}
			/>
		</div>
	);
};

// renders editable field for selecting value via dropdown
const EditableSingleSelect = ({
	field,
	metadataField,
	text,
	form: { setFieldValue },
	isFirstField,
	focused,
	setFocused,
	ref,
}: {
	field: FieldProps["field"]
	metadataField: MetadataField
	text: string
	form: FieldProps["form"]
	isFirstField?: boolean,
	focused: boolean,
	setFocused: (open: boolean) => void
	ref: React.RefObject<SelectInstance<any, boolean, GroupBase<any>>>
}) => {
	const { t } = useTranslation();

	return (
		<DropDown
			ref={ref}
			value={field.value as string}
			text={text}
			options={metadataField.collection
				? metadataField.collection.map(item => ({ label: item.label ?? item.name, value: item.value, order: item.order }))
				: []}
			required={metadataField.required}
			handleChange={element => element && setFieldValue(field.name, element.value)}
			placeholder={focused
				? `-- ${t("SELECT_NO_OPTION_SELECTED")} --`
				: `${t("SELECT_NO_OPTION_SELECTED")}`
			}
			customCSS={{ isMetadataStyle: focused ? false : true }}
			handleMenuIsOpen={(open: boolean) => setFocused(open)}
			openMenuOnFocus
			autoFocus={isFirstField}
		/>
	);
};

// Renders editable text area
const EditableSingleValueTextArea = ({
	field,
	isFirstField,
	ref,
}: {
	field: FieldProps["field"]
	isFirstField?: boolean,
	ref: React.RefObject<HTMLTextAreaElement>
}) => {
	return (
		// Maybe replace TextareaAutosize with css "field-sizing: content" once all
		// major browsers support that.
		<TextareaAutosize
			{...field}
			ref={ref}
			autoFocus={isFirstField}
			className="single-value-textarea"
		/>
	);
};

// Renders editable input for single value
const EditableSingleValue = ({
	field,
	isFirstField,
	ref,
}: {
	field: FieldProps["field"]
	isFirstField?: boolean,
	ref: React.RefObject<HTMLInputElement | null>
}) => {
	return (
		<input
			{...field}
			ref={ref}
			className="single-value"
			autoFocus={isFirstField}
			type="text"
			onKeyDown={event => {
				if (event.key === "Enter") {
					ref.current?.blur();
				}
			}}
		/>
	);
};

// Renders editable field for time value
const EditableSingleValueTime = ({
	field,
	form: { setFieldValue },
	isFirstField,
	ref,
}: {
	field: FieldProps["field"]
	form: FieldProps["form"]
	isFirstField?: boolean,
	ref: React.RefObject<DatePicker>
}) => {
	return (
		// For some reason onclick events are bubbling up from the datepicker which we do not want.
		// Therefore we wrap it.
		<div onClick={e => { e.stopPropagation(); }}>
			<DatePicker
				ref={ref}
				selected={typeof field.value === "string" ? parseISO(field.value) : field.value as Date}
				onChange={value => setFieldValue(field.name, value)}
				showTimeSelect
				showTimeSelectOnly
				dateFormat="p"
				popperPlacement="bottom-start"
				popperClassName="datepicker-custom"
				className="datepicker-custom-input"
				wrapperClassName="datepicker-custom-wrapper"
				locale={getCurrentLanguageInformation()?.dateLocale}
				strictParsing
				autoFocus={isFirstField}
			/>
		</div>
	);
};

export default RenderField;
