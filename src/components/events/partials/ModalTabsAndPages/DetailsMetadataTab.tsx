import React from "react";
import { useTranslation } from "react-i18next";
import { Formik, FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import _ from "lodash";
import Notifications from "../../../shared/Notifications";
import RenderMultiField from "../../../shared/wizard/RenderMultiField";
import RenderField from "../../../shared/wizard/RenderField";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import {
	hasAccess,
} from "../../../../utils/utils";
import { getMetadataCollectionFieldName } from "../../../../utils/resourceUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { MetadataCatalog } from "../../../../slices/eventSlice";
import { AsyncThunk } from "@reduxjs/toolkit";
import RenderDate from "../../../shared/RenderDate";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import { addNotification } from "../../../../slices/notificationSlice";
import { NOTIFICATION_CONTEXT } from "../../../../configs/modalConfig";

type InitialValues = {
	[key: string]: string | string[];
}

/**
 * This component renders metadata details of a certain event or series
 */
const DetailsMetadataTab = ({
	resourceId,
	metadata,
	updateResource,
	editAccessRole,
	formikRef,
	header,
}: {
	resourceId: string,
	metadata: MetadataCatalog[],
	updateResource: AsyncThunk<void, {
		id: string;
		values: { [key: string]: any; };
		catalog: MetadataCatalog;
	}, any> // (id: string, values: { [key: string]: any }, catalog: MetadataCatalog) => void,
	editAccessRole: string,
	formikRef?: React.RefObject<FormikProps<InitialValues> | null>
	header?: ParseKeys
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));

	const handleSubmit = (values: { [key: string]: any }, catalog: MetadataCatalog) => {
		dispatch(updateResource({ id: resourceId, values, catalog }))
			.unwrap()
			.then(() => {
				dispatch(addNotification({
					type: "info",
					key: "METADATA_SAVED",
					duration: 3,
					context: NOTIFICATION_CONTEXT,
				}));
			})
			.catch(() => {
				dispatch(addNotification({
					type: "warning",
					key: "METADATA_NOT_SAVED",
					duration: 3,
					context: NOTIFICATION_CONTEXT,
				}));
			});
	};

	// set current values of metadata fields as initial values
	const getInitialValues = (metadataCatalog: MetadataCatalog) => {
		const initialValues: { [key: string]: any } = {};

		// Transform metadata fields and their values provided by backend (saved in redux)
		metadataCatalog.fields.forEach(field => {
			initialValues[field.id] = field.value;
		});

		return initialValues;
	};

	const checkValidity = (formik: FormikProps<any>) => {
		if (formik.dirty && formik.isValid && hasAccess(editAccessRole, user)) {
			// check if user provided values differ from initial ones
			return !_.isEqual(formik.values, formik.initialValues);
		} else {
			return false;
		}
	};

	return (<ModalContentTable
		modalBodyChildren={<Notifications context="not_corner" />}
	>
		{metadata.map(catalog => (
			// initialize form
			<Formik<InitialValues>
				key={catalog.flavor}
				enableReinitialize
				initialValues={getInitialValues(catalog)}
				onSubmit={values => handleSubmit(values, catalog)}
				innerRef={formikRef}
			>{formik => (
				/* Render table for each metadata catalog */
				<div className="obj tbl-details">
					<header>
						<span>{t(header ? header : catalog.title as ParseKeys)}</span>
					</header>
					<div className="obj-container">
						<table className="main-tbl">
							<tbody>
								{/* Render table row for each metadata field depending on type */}
								{catalog.fields.map((field, index) => (
									<tr key={field.id}>
										<td>
											<span>{t(field.label as ParseKeys)}</span>
											{field.required && (
												<i className="required">*</i>
											)}
										</td>
										{field.readOnly || !hasAccess(editAccessRole, user) ? (
											<td>
												{/* non-editable field if readOnly is set or user doesn't have edit access rights */}
												{field.collection?.length ? (
													getMetadataCollectionFieldName(field, field, t)
												) : (
													field.type === "time" || field.type === "date"
														? <RenderDate date={field.value as string} />
														: field.value
												)}
											</td>
										) : (
											<td className="editable">
												{/* Render single value or multi value editable input */}
												{field.type === "mixed_text" ? (
													<Field
														name={field.id}
														fieldInfo={field}
														showCheck
														isFirstField={index === 0}
														component={RenderMultiField}
													/>
												) : (
													<Field
														name={field.id}
														metadataField={field}
														showCheck
														isFirstField={index === 0}
														component={RenderField}
													/>
												)}
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
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
				</div>
			)}</Formik>
		))}
	</ModalContentTable>);
};

export default DetailsMetadataTab;
