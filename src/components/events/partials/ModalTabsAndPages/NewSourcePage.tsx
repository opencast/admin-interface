import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import DatePicker from "react-datepicker";
import {
	getCurrentLanguageInformation,
	getTimezoneOffset,
	translateOverrideFallback,
} from "../../../../utils/utils";
import { FieldArray, FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import RenderField from "../../../shared/wizard/RenderField";
import { getRecordings } from "../../../../selectors/recordingSelectors";
import { sourceMetadata } from "../../../../configs/sourceConfig";
import { weekdays } from "../../../../configs/modalConfig";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import {
	filterDevicesForAccess,
	hasAnyDeviceAccess,
} from "../../../../utils/resourceUtils";
import {
	changeDurationHour,
	changeDurationHourMultiple,
	changeDurationMinute,
	changeDurationMinuteMultiple,
	changeEndDateMultiple,
	changeEndHour,
	changeEndHourMultiple,
	changeEndMinute,
	changeEndMinuteMultiple,
	changeStartDate,
	changeStartDateMultiple,
	changeStartHour,
	changeStartHourMultiple,
	changeStartMinute,
	changeStartMinuteMultiple,
} from "../../../../utils/dateUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Recording, fetchRecordings } from "../../../../slices/recordingSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { parseISO } from "date-fns";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { checkConflicts, UploadAssetsTrack } from "../../../../slices/eventSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import SchedulingTime from "../wizards/scheduling/SchedulingTime";
import SchedulingLocation from "../wizards/scheduling/SchedulingLocation";
import SchedulingInputs from "../wizards/scheduling/SchedulingInputs";
import SchedulingConflicts from "../wizards/scheduling/SchedulingConflicts";
import { ParseKeys } from "i18next";
import { LuCircleX } from "react-icons/lu";

/**
 * This component renders the source page for new events in the new event wizard.
 */
interface RequiredFormProps {
	scheduleStartDate: string,
	sourceMode: string,
	// Schedule
	location: string
	scheduleEndDate: string
	scheduleStartHour: string
	scheduleEndHour: string
	scheduleStartMinute: string
	scheduleEndMinute: string
	scheduleDurationHours: string
	scheduleDurationMinutes: string
	// checkConflicts
	repeatOn: string[],
	// Upload
	uploadAssetsTrack?: UploadAssetsTrack[]
}

const NewSourcePage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));
	const inputDevices = useAppSelector(state => getRecordings(state));

	const [conflicts, setConflicts] = useState<{title: string, start: string, end: string}[]>([]);

	useEffect(() => {
		// Load recordings that can be used for input
		dispatch(fetchRecordings("inputs"));

		// validate form because dependent default values need to be checked
		formik.validateForm().then(r => console.info(r));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Remove old notifications of context event-form
	// Helps to prevent multiple notifications for same problem
	const removeOldNotifications = () => {
		dispatch(removeNotificationWizardForm());
	};

	const scheduleOptionAvailable = () => {
		return inputDevices.length > 0 && hasAnyDeviceAccess(user, inputDevices);
	};

	return (
		<>
			<ModalContentTable>
				{/* Show notifications with context events-form*/}
				<Notifications context="not_corner" />
				{
					<SchedulingConflicts
						conflicts={conflicts}
					/>
				}

				<div className="obj list-obj">
					<header className="no-expand">
						{t("EVENTS.EVENTS.NEW.SOURCE.SELECT_SOURCE")}
					</header>
					{/* Radio buttons for choosing source mode */}
					<div className="obj-container">
						<ul>
							{scheduleOptionAvailable() ? (
								<li>
									<label>
										<Field
											type="radio"
											name="sourceMode"
											className="source-toggle"
											value="UPLOAD"
										/>
										<span>
											{t("EVENTS.EVENTS.NEW.SOURCE.UPLOAD.CAPTION")}
										</span>
									</label>
								</li>
							) : (
								<li>
									<label>
										<span>
											{t("EVENTS.EVENTS.NEW.SOURCE.UPLOAD.CAPTION")}
										</span>
									</label>
								</li>
							)}
							{scheduleOptionAvailable() && (
								<>
									<li>
										<label>
											<Field
												type="radio"
												name="sourceMode"
												className="source-toggle"
												onClick={() =>
													changeStartDate(
														new Date(formik.values.scheduleStartDate),
														formik.values,
														formik.setFieldValue,
													)
												}
												value="SCHEDULE_SINGLE"
											/>
											<span>
												{t(
													"EVENTS.EVENTS.NEW.SOURCE.SCHEDULE_SINGLE.CAPTION",
												)}
											</span>
										</label>
									</li>
									<li>
										<label>
											<Field
												type="radio"
												name="sourceMode"
												className="source-toggle"
												value="SCHEDULE_MULTIPLE"
											/>
											<span>
												{t(
													"EVENTS.EVENTS.NEW.SOURCE.SCHEDULE_MULTIPLE.CAPTION",
												)}
											</span>
										</label>
									</li>
								</>
							)}
						</ul>
					</div>
				</div>

				{/* Render rest of page depending on which source mode is chosen */}
				{formik.values.sourceMode === "UPLOAD" && (
					<Upload formik={formik} />
				)}
				{scheduleOptionAvailable() &&
					(formik.values.sourceMode === "SCHEDULE_SINGLE" ||
						formik.values.sourceMode === "SCHEDULE_MULTIPLE") && (
						<Schedule
							formik={formik}
							inputDevices={filterDevicesForAccess(user, inputDevices)}
						/>
					)}
			</ModalContentTable>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={async () => {
					removeOldNotifications();
					const noConflicts = await dispatch(checkConflicts(formik.values));
					if (Array.isArray(noConflicts)) {
						setConflicts(noConflicts);
					}
					if ((typeof noConflicts == "boolean" && noConflicts)
						|| (Array.isArray(noConflicts) && noConflicts.length === 0)) {
						nextPage(formik.values);
					}
				}}
				previousPage={previousPage}
			/>
		</>
	);
};

/*
 * Renders buttons for uploading files and fields for additional metadata
 */
type RequiredFormPropsUpload = {
	uploadAssetsTrack?: UploadAssetsTrack[]
}

const Upload = <T extends RequiredFormPropsUpload>({
	formik,
}: {
	formik: FormikProps<T>
}) => {
	const { t } = useTranslation();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, assetId: string) => {
		if (e.target.files) {
			if (e.target.files.length === 0) {
				formik.setFieldValue(assetId, null);
			} else {
				formik.setFieldValue(assetId, e.target.files);
			}
		}
	};

	return (
		<>
			<div className="obj tbl-details">
				<header>
					{t("EVENTS.EVENTS.NEW.SOURCE.UPLOAD.RECORDING_ELEMENTS")}
				</header>
				<div className="obj-container">
					<table className="main-tbl">
						<tbody>
							{/* File upload button for each upload asset */}
							<FieldArray
								name="uploadAssetsTrack"
								render={_arrayHelpers => (
									formik.values.uploadAssetsTrack &&
									formik.values.uploadAssetsTrack.length > 0 &&
									formik.values.uploadAssetsTrack.map((asset, key) => (
										<tr key={key}>
											<td>
												<span style={{ fontWeight: "bold" }}>
													{translateOverrideFallback(asset, t, "SHORT")}
												</span>
												<p>
													{translateOverrideFallback(asset, t, "DETAIL")}
												</p>
											</td>
											<td>
												<div className="file-upload">
													<input
														id={asset.id}
														className="blue-btn file-select-btn"
														accept={asset.accept}
														onChange={e =>
															handleChange(e, `uploadAssetsTrack.${key}.file`)
														}
														type="file"
														multiple={asset.multiple}
														name={`uploadAssetsTrack.${key}.file`}
														tabIndex={0}
													/>
												</div>
											</td>
											<td className="fit">
												<ButtonLikeAnchor
													style={{ visibility: asset.file ? "visible" : "hidden" }}
													className="action-cell-button remove"
													onClick={() => {
														formik.setFieldValue(
															`uploadAssetsTrack.${key}.file`,
															null,
														);
														(document.getElementById(asset.id) as HTMLInputElement).value = "";
													}}
												>
													<LuCircleX />
												</ButtonLikeAnchor>
											</td>
										</tr>
									))
								)}
							/>
						</tbody>
					</table>
				</div>
			</div>
			<div className="obj list-obj">
				<header className="no-expand">
					{t("EVENTS.EVENTS.NEW.SOURCE.UPLOAD.RECORDING_METADATA")}
				</header>
				<div className="obj-container">
					<table className="main-tbl">
						<tbody>
							{/* One row for each metadata field*/}
							{sourceMetadata.UPLOAD && sourceMetadata.UPLOAD.metadata.map((field, key) => (
								<tr key={key}>
									<td>
										<span>{t(field.label as ParseKeys)}</span>
										{field.required && <i className="required">*</i>}
									</td>
									<td className="editable">
										<Field
											name={field.id}
											metadataField={field}
											component={RenderField}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

/*
 * Renders fields for providing information for schedule of event
 */
const Schedule = <T extends {
	location: string
	scheduleStartDate: string
	scheduleEndDate: string
	sourceMode: string
	scheduleStartHour: string
	scheduleEndHour: string
	scheduleStartMinute: string
	scheduleEndMinute: string
	scheduleDurationHours: string
	scheduleDurationMinutes: string
}>({
	formik,
	inputDevices,
}: {
	formik: FormikProps<T>,
	inputDevices: Recording[]
}) => {
	const { t } = useTranslation();
	const currentLanguage = getCurrentLanguageInformation();

	const renderInputDeviceOptions = () => {
		if (formik.values.location) {
			const inputDevice = inputDevices.find(
				({ name }) => name === formik.values.location,
			);
			if (!inputDevice) {
				return <></>;
			}
			return (
				<SchedulingInputs
					inputs={inputDevice.inputs}
				/>
			);
		}
	};

	return (
		<div className="obj">
			<header>{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.CAPTION")}</header>
			<div className="obj-container">
				<table className="main-tbl">
					<tbody>
						<tr>
							<td>{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.TIMEZONE")}</td>
							<td>{"UTC" + getTimezoneOffset()}</td>
						</tr>
						<tr>
							<td>
								{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.START_DATE")}{" "}
								<i className="required">*</i>
							</td>
							<td>
								<DatePicker
									name="scheduleStartDate"
									selected={typeof formik.values.scheduleStartDate === "string" ? parseISO(formik.values.scheduleStartDate) : formik.values.scheduleStartDate}
									onChange={value => {
										if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
											if (value) {
												changeStartDateMultiple(
													value,
													formik.values,
													formik.setFieldValue,
												);
											}
										} else {
											if (value) {
												changeStartDate(
													value,
													formik.values,
													formik.setFieldValue,
												);
											}
										}
									}}
									showYearDropdown
									showMonthDropdown
									yearDropdownItemNumber={2}
									dateFormat="P"
									popperClassName="datepicker-custom"
									className="datepicker-custom-input"
									portalId="root"
									locale={currentLanguage?.dateLocale}
									strictParsing
								/>
							</td>
						</tr>
						{/* Render fields specific for multiple schedule (Only if this is current source mode)*/}
						{formik.values.sourceMode === "SCHEDULE_MULTIPLE" && (
							<>
								<tr>
									<td>
										{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.END_DATE")}{" "}
										<i className="required">*</i>
									</td>
									<td>
										<DatePicker
											name="scheduleEndDate"
											selected={typeof formik.values.scheduleEndDate === "string" ? parseISO(formik.values.scheduleEndDate) : formik.values.scheduleEndDate}
											onChange={value =>
												value && changeEndDateMultiple(
													value,
													formik.values,
													formik.setFieldValue,
												)
											}
											showYearDropdown
											showMonthDropdown
											yearDropdownItemNumber={2}
											dateFormat="P"
											popperClassName="datepicker-custom"
											className="datepicker-custom-input"
											portalId="root"
											locale={currentLanguage?.dateLocale}
											strictParsing
										/>
									</td>
								</tr>
								<tr>
									<td>
										{t("EVENTS.EVENTS.NEW.SOURCE.SCHEDULE_MULTIPLE.REPEAT_ON")}{" "}
										<i className="required">*</i>
									</td>
									<td>
										{/* Repeat checkbox for each week day*/}
										{weekdays.map((day, key) => (
											<div key={key} className="day-check-container">
												{t(day.label)}
												<br />
												<Field
													type="checkbox"
													name="repeatOn"
													value={day.name}
													tabIndex={6 + key}
												/>
											</div>
										))}
									</td>
								</tr>
							</>
						)}
						{/* start time */}
						<SchedulingTime
							hour={formik.values.scheduleStartHour}
							minute={formik.values.scheduleStartMinute}
							disabled={false}
							title={"EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.START_TIME"}
							hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
							minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
							callbackHour={(value: string) => {
								if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
									changeStartHourMultiple(
										value,
										formik.values,
										formik.setFieldValue,
									);
								} else {
									changeStartHour(
										value,
										formik.values,
										formik.setFieldValue,
									);
								}
							}}
							callbackMinute={(value: string) => {
								if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
									changeStartMinuteMultiple(
										value,
										formik.values,
										formik.setFieldValue,
									);
								} else {
									changeStartMinute(
										value,
										formik.values,
										formik.setFieldValue,
									);
								}
							}}
						/>
						{/* duration */}
						<SchedulingTime
							hour={formik.values.scheduleDurationHours}
							minute={formik.values.scheduleDurationMinutes}
							disabled={false}
							title={"EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.DURATION"}
							hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
							minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
							callbackHour={(value: string) => {
								if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
									changeDurationHourMultiple(
										value,
										formik.values,
										formik.setFieldValue,
									);
								} else {
									changeDurationHour(
										value,
										formik.values,
										formik.setFieldValue,
									);
								}
							}}
							callbackMinute={(value: string) => {
								if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
									changeDurationMinuteMultiple(
										value,
										formik.values,
										formik.setFieldValue,
									);
								} else {
									changeDurationMinute(
										value,
										formik.values,
										formik.setFieldValue,
									);
								}
							}}
						/>
						{/* end time */}
						<SchedulingTime
							hour={formik.values.scheduleEndHour}
							minute={formik.values.scheduleEndMinute}
							disabled={false}
							title={"EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.END_TIME"}
							hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
							minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
							callbackHour={(value: string) => {
								if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
									changeEndHourMultiple(
										value,
										formik.values,
										formik.setFieldValue,
									);
								} else {
									changeEndHour(
										value,
										formik.values,
										formik.setFieldValue,
									);
								}
							}}
							callbackMinute={(value: string) => {
								if (formik.values.sourceMode === "SCHEDULE_MULTIPLE") {
									changeEndMinuteMultiple(
										value,
										formik.values,
										formik.setFieldValue,
									);
								} else {
									changeEndMinute(
										value,
										formik.values,
										formik.setFieldValue,
									);
								}
							}}
							date={
								formik.values.sourceMode === "SCHEDULE_SINGLE" &&
								(new Date(formik.values.scheduleEndDate).getDate() !==
								new Date(formik.values.scheduleStartDate).getDate())
								? formik.values.scheduleEndDate
								: undefined
							}
						/>

						<SchedulingLocation
								location={formik.values.location}
								inputDevices={inputDevices}
								disabled={false}
								title={"EVENTS.EVENTS.NEW.SOURCE.PLACEHOLDER.LOCATION"}
								placeholder={"EVENTS.EVENTS.NEW.SOURCE.PLACEHOLDER.LOCATION"}
								callback={(value: string) => {
									formik.setFieldValue("location", value);
								}}
							/>
						<tr>
							<td>{t("EVENTS.EVENTS.NEW.SOURCE.PLACEHOLDER.INPUTS")}</td>
							<td>
								{/* Render checkbox for each input option of the selected input device*/}
								{renderInputDeviceOptions()}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default NewSourcePage;
