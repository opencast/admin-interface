import React, { useEffect } from "react";
import _ from "lodash";
import DatePicker from "react-datepicker";
import { Formik, FormikErrors, FormikProps } from "formik";
import Notifications from "../../../shared/Notifications";
import {
	getSchedulingConflicts,
	getSchedulingProperties,
	getSchedulingSource,
	isCheckingConflicts,
} from "../../../../selectors/eventDetailsSelectors";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { getRecordings } from "../../../../selectors/recordingSelectors";
import {
	getCurrentLanguageInformation,
	getTimezoneOffset,
	getTimezoneString,
	hasAccess,
	makeTwoDigits,
} from "../../../../utils/utils";
import {
	changeDurationHour,
	changeDurationMinute,
	changeEndHour,
	changeEndMinute,
	changeStartDate,
	changeStartHour,
	changeStartMinute,
	makeDate,
} from "../../../../utils/dateUtils";
import {
	filterDevicesForAccess,
	hasDeviceAccess,
} from "../../../../utils/resourceUtils";
import { NOTIFICATION_CONTEXT } from "../../../../configs/modalConfig";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	checkConflicts,
	saveSchedulingInfo,
	SchedulingInfo,
} from "../../../../slices/eventDetailsSlice";
import {
	removeNotificationWizardForm,
	addNotification,
} from "../../../../slices/notificationSlice";
import { Recording } from "../../../../slices/recordingSlice";
import { useTranslation } from "react-i18next";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import SchedulingTime from "../wizards/scheduling/SchedulingTime";
import SchedulingLocation from "../wizards/scheduling/SchedulingLocation";
import SchedulingInputs from "../wizards/scheduling/SchedulingInputs";
import SchedulingConflicts from "../wizards/scheduling/SchedulingConflicts";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

export type InitialValues = {
	scheduleStartDate: string;
	scheduleStartHour: string;
	scheduleStartMinute: string;
	scheduleDurationHours: string;
	scheduleDurationMinutes: string;
	scheduleEndDate: string;
	scheduleEndHour: string;
	scheduleEndMinute: string;
	captureAgent: string;
	inputs: string[];
}

/**
 * This component manages the main assets tab of event details modal
 */
const EventDetailsSchedulingTab = ({
	eventId,
	formikRef,
}: {
	eventId: string,
	formikRef?: React.RefObject<FormikProps<InitialValues> | null>
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));
	const conflicts = useAppSelector(state => getSchedulingConflicts(state));
	const hasSchedulingProperties = useAppSelector(state => getSchedulingProperties(state));
	const source = useAppSelector(state => getSchedulingSource(state));
	const checkingConflicts = useAppSelector(state => isCheckingConflicts(state));
	const captureAgents = useAppSelector(state => getRecordings(state));

	const checkConflictsWrapper = (eventId: string, startDate: Date, endDate: Date, deviceId: string) => {
		dispatch(checkConflicts({ eventId, startDate, endDate, deviceId }));
	};

	const sourceStartDate = new Date(source.start.date);
	const endStartDate = new Date(source.start.date);
	useEffect(() => {
		dispatch(removeNotificationWizardForm());
		dispatch(checkConflicts({
			eventId,
			startDate: sourceStartDate,
			endDate: endStartDate,
			deviceId: source.device.id,
		})).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Get info about the current language and its date locale
	const currentLanguage = getCurrentLanguageInformation();

	// Get timezone offset; Checks should be performed on UTC times
	const offset = getTimezoneOffset();

	// Set timezone
	const tz = getTimezoneString(offset);

	// Variable and function for checking access rights
	const hasAccessRole = hasAccess(
		"ROLE_UI_EVENTS_DETAILS_SCHEDULING_EDIT",
		user,
	);
	const accessAllowed = (agentId: Recording["id"]) => {
		return !checkingConflicts && hasDeviceAccess(user, agentId);
	};

	// finds the inputs to be displayed in the formik
	const getInputs = (deviceId: Recording["id"]) => {
		if (deviceId === source.device.id) {
			return source.device.inputs ? source.device.inputs : [];
		} else {
			for (const agent of filterDevicesForAccess(user, captureAgents)) {
				if (agent.id === deviceId) {
					return agent.inputs ? agent.inputs : [];
				}
			}
			return [];
		}
	};

	const getInputForAgent = (deviceId: Recording["id"], input: string) => {
		const inputs = getInputs(deviceId);
		const value = inputs.find(agent => agent.id === input)?.value;
		return value ? t(value as ParseKeys) : "";
	};

	// changes the inputs in the formik
	const changeInputs = (deviceId: Recording["id"], setFieldValue: (field: string, value: any) => Promise<void | FormikErrors<any>>) => {
		setFieldValue("captureAgent", deviceId);
		setFieldValue("inputs", []);
	};
	const filterCaptureAgents = (agent: Recording) => {
		return agent.id === source.agentId || hasDeviceAccess(user, agent.id);
	};

	// checks validity of the formik form
	const checkValidity = (formik: FormikProps<InitialValues>) => {
		if (
			formik.dirty &&
			formik.isValid &&
			hasAccessRole &&
			accessAllowed(formik.values.captureAgent) &&
			!(conflicts.length > 0)
		) {
			// check if user provided values differ from initial ones
			if (!_.isEqual(formik.values, formik.initialValues)) {
				if (!_.isEqual(formik.values.inputs, formik.initialValues.inputs)) {
					return !_.isEqual(
						formik.values.inputs.sort(),
						formik.initialValues.inputs.sort(),
					);
				} else {
					return true;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	// submits the formik form
	const submitForm = (values: SchedulingInfo) => {
		dispatch(removeNotificationWizardForm());
		const startDate = makeDate(
			values.scheduleStartDate,
			values.scheduleStartHour,
			values.scheduleStartMinute,
		);
		const endDate = makeDate(
			values.scheduleEndDate,
			values.scheduleEndHour,
			values.scheduleEndMinute,
		);
		dispatch(checkConflicts({ eventId, startDate, endDate, deviceId: values.captureAgent })).then(
			r => {
				if (r) {
					dispatch(saveSchedulingInfo({ eventId, values, startDate, endDate })).then();
				} else {
					dispatch(addNotification({
						type: "error",
						key: "EVENTS_NOT_UPDATED",
						duration: -1,
						context: NOTIFICATION_CONTEXT,
					}));
				}
			},
		);
	};

	// initial values of the formik form
	const getInitialValues = () => {
		const startDate = new Date(source.start.date);
		const endDate = new Date(source.end.date);

		const inputs = source.device.inputMethods
			? Array.from(source.device.inputMethods)
			: [];

		startDate.setHours(0, 0, 0);
		endDate.setHours(0, 0, 0);

		return {
			scheduleStartDate: startDate.toISOString(),
			scheduleStartHour: source.start.hour != null ? makeTwoDigits(source.start.hour) : "",
			scheduleStartMinute: source.start.minute != null ? makeTwoDigits(source.start.minute) : "",
			scheduleDurationHours: source.duration.hour != null ? makeTwoDigits(source.duration.hour) : "",
			scheduleDurationMinutes: source.duration.minute != null ? makeTwoDigits(source.duration.minute) : "",
			scheduleEndDate: endDate.toISOString(),
			scheduleEndHour: source.end.hour != null ? makeTwoDigits(source.end.hour) : "",
			scheduleEndMinute: source.end.minute != null ? makeTwoDigits(source.end.minute) : "",
			captureAgent: source.device.name,
			inputs: inputs.filter(input => input !== ""),
		};
	};

	return (
		<ModalContentTable
			modalBodyChildren={<Notifications context="not_corner" />}
		>
			{
				<SchedulingConflicts
					conflicts={conflicts}
				/>
			}

			{
				/* Scheduling configuration */
				hasSchedulingProperties && (
				/* Initialize form */
					<Formik<InitialValues>
						enableReinitialize
						initialValues={getInitialValues()}
						onSubmit={values => submitForm(values)}
						innerRef={formikRef}
					>
						{formik => (
							<div className="obj tbl-details">
								<header>
									<span>
										{
											t(
												"EVENTS.EVENTS.DETAILS.SCHEDULING.CAPTION",
											) /* Scheduling configuration */
										}
									</span>
								</header>
								<div className="obj-container">
									<table className="main-tbl">
										<tbody>
											{/* time zone */}
											<tr>
												<td>
													{t(
														"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.TIMEZONE",
													)}
												</td>
												<td>{tz}</td>
											</tr>

											{/* start date */}
											<tr>
												<td>
													{t(
														"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.START_DATE",
													)}
												</td>
												<td>
													{hasAccessRole &&
													accessAllowed(formik.values.captureAgent) ? (
														/* date picker for start date */
														<DatePicker
															name="scheduleStartDate"
															selected={new Date(formik.values.scheduleStartDate)}
															onChange={(value: Date | null) =>
																value && changeStartDate(
																	value,
																	formik.values,
																	formik.setFieldValue,
																	eventId,
																	checkConflictsWrapper,
																)
															}
															showYearDropdown
															showMonthDropdown
															yearDropdownItemNumber={2}
															dateFormat="P"
															popperClassName="datepicker-custom"
															className="datepicker-custom-input"
															wrapperClassName="datepicker-custom-wrapper"
															locale={currentLanguage?.dateLocale}
															strictParsing
														/>
													) : (
														<>
															{sourceStartDate.toLocaleDateString(
																currentLanguage ? currentLanguage.dateLocale.code : undefined,
															)}
														</>
													)}
												</td>
											</tr>

											{/* start time */}
											{hasAccessRole && (
												<SchedulingTime
													hour={formik.values.scheduleStartHour}
													minute={formik.values.scheduleStartMinute}
													disabled={!accessAllowed(formik.values.captureAgent)}
													title={"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.START_TIME"}
													hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
													minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
													callbackHour={(value: string) => {
														changeStartHour(
															value,
															formik.values,
															formik.setFieldValue,
															eventId,
															checkConflictsWrapper,
														);
													}}
													callbackMinute={(value: string) => {
														changeStartMinute(
															value,
															formik.values,
															formik.setFieldValue,
															eventId,
															checkConflictsWrapper,
														);
													}}
												/>
											)}
											{!hasAccessRole && (
											<tr>
												<td>
													{t("EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.START_TIME")}
												</td>
												<td>
													{source.start.hour ? makeTwoDigits(source.start.hour) : ""}:
													{source.start.minute ? makeTwoDigits(source.start.minute) : ""}
												</td>
											</tr>
											)}
											{/* duration */}
											{hasAccessRole && (
												<SchedulingTime
													hour={formik.values.scheduleDurationHours}
													minute={formik.values.scheduleDurationMinutes}
													disabled={!accessAllowed(formik.values.captureAgent)}
													title={"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.DURATION"}
													hourPlaceholder={"WIZARD.DURATION.HOURS"}
													minutePlaceholder={"WIZARD.DURATION.MINUTES"}
													callbackHour={(value: string) => {
														changeDurationHour(
															value,
															formik.values,
															formik.setFieldValue,
															eventId,
															checkConflictsWrapper,
														);
													}}
													callbackMinute={(value: string) => {
														changeDurationMinute(
															value,
															formik.values,
															formik.setFieldValue,
															eventId,
															checkConflictsWrapper,
														);
													}}
												/>
											)}
											{!hasAccessRole && (
											<tr>
												<td>
													{t(
														"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.DURATION",
													)}
												</td>
												<td>
													{source.duration.hour ? makeTwoDigits(source.duration.hour) : ""}:
													{source.duration.minute ? makeTwoDigits(source.duration.minute) : ""}
												</td>
											</tr>
											)}
											{/* end time */}
											{hasAccessRole && (
												<SchedulingTime
													hour={formik.values.scheduleEndHour}
													minute={formik.values.scheduleEndMinute}
													disabled={!accessAllowed(formik.values.captureAgent)}
													title={"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.END_TIME"}
													hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
													minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
													callbackHour={(value: string) => {
														changeEndHour(
															value,
															formik.values,
															formik.setFieldValue,
															eventId,
															checkConflictsWrapper,
														);
													}}
													callbackMinute={(value: string) => {
														changeEndMinute(
															value,
															formik.values,
															formik.setFieldValue,
															eventId,
															checkConflictsWrapper,
														);
													}}
													date={
														hasAccessRole &&
														(new Date(formik.values.scheduleEndDate).getDate() !==
														new Date(formik.values.scheduleStartDate).getDate())
														? formik.values.scheduleEndDate
														: undefined
													}
												/>
											)}
											{!hasAccessRole && (
											<tr>
												<td>
													{t(
														"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.END_TIME",
													)}
												</td>
												<td>
													{source.end.hour ? makeTwoDigits(source.end.hour) : ""}:
													{source.end.minute ? makeTwoDigits(source.end.minute) : ""}
													{formik.values.scheduleEndDate.toString() !==
														formik.values.scheduleStartDate.toString() && (
														<span>
															{new Date(
																formik.values.scheduleEndDate,
															).toLocaleDateString(
																currentLanguage ? currentLanguage.dateLocale.code : undefined,
															)}
														</span>
													)}
												</td>
											</tr>
											)}
											{/* capture agent (aka. room or location) */}
												{hasAccessRole && (
													<SchedulingLocation
														location={formik.values.captureAgent}
														inputDevices={filterDevicesForAccess(
															user,
															captureAgents,
														).filter(a => filterCaptureAgents(a))}
														disabled={!accessAllowed(formik.values.captureAgent)}
														title={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.LOCATION"}
														placeholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.LOCATION"}
														callback={(value: string) => {
															changeInputs(
																value,
																formik.setFieldValue,
															);
														}}
													/>
												)}
												{!hasAccessRole &&
													<tr>
														<td>
															{t(
																"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.LOCATION",
															)}
														</td>
														<td>{source.device.name}</td>
													</tr>
												}

											{/* inputs */}
											<tr>
												<td>
													{t(
														"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.INPUTS",
													)}
												</td>
												<td>
													{!!formik.values.captureAgent &&
														!!getInputs(formik.values.captureAgent) &&
														getInputs(formik.values.captureAgent).length >
															0 &&
														(hasAccessRole &&
														accessAllowed(formik.values.captureAgent)
															? <SchedulingInputs
																	inputs={getInputs(formik.values.captureAgent)}
																/>
															: formik.values.inputs.map((input, key) => (
																	<span key={key}>
																		{getInputForAgent(formik.values.captureAgent, input)}
																		<br />
																	</span>
																)))}
												</td>
											</tr>
										</tbody>
									</table>
								</div>

								{/* Save and cancel buttons */}
								{formik.dirty && (
									<>
										{/* Render buttons for updating scheduling */}
										<WizardNavigationButtons
											formik={formik}
											customValidation={!checkValidity(formik)}
											previousPage={() => {
												formik.resetForm({
													values: getInitialValues(),
												});
											}}
											createTranslationString="SAVE"
											cancelTranslationString="CANCEL"
											isLast
										/>
									</>
								)}
							</div>
						)}
					</Formik>
				)
			}
		</ModalContentTable>
	);
};

export default EventDetailsSchedulingTab;
