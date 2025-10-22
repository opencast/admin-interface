import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FieldArray, FormikProps } from "formik";
import Notifications from "../../../shared/Notifications";
import { getTimezoneOffset, hasAccess } from "../../../../utils/utils";
import { weekdays } from "../../../../configs/modalConfig";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import {
	getSchedulingSeriesOptions,
	isLoadingScheduling,
} from "../../../../selectors/eventSelectors";
import { checkSchedulingConflicts } from "../../../../utils/bulkActionUtils";
import DropDown from "../../../shared/DropDown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import {
	Event,
	EditedEvents,
	fetchScheduling,
	Conflict,
} from "../../../../slices/eventSlice";
import { Recording } from "../../../../slices/recordingSlice";
import lodash, { groupBy } from "lodash";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import SchedulingTime from "../wizards/scheduling/SchedulingTime";
import SchedulingLocation from "../wizards/scheduling/SchedulingLocation";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the edit page for scheduled events of the corresponding bulk action
 */
interface RequiredFormProps {
	events: Event[],
	editedEvents: EditedEvents[],
}

const EditScheduledEventsEditPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
	setPageCompleted,
	inputDevices,
	conflictState: { conflicts, setConflicts },
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T) => void,
	setPageCompleted: (rec: Record<number, boolean>) => void,
	inputDevices: Recording[],
	conflictState: { conflicts: Conflict[], setConflicts: (conflicts: Conflict[]) => void },
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const loading = useAppSelector(state => isLoadingScheduling(state));
	const seriesOptions = useAppSelector(state => getSchedulingSeriesOptions(state));

	const user = useAppSelector(state => getUserInformation(state));

	useEffect(() => {
		const fetchEventInfos =
			formik.values.editedEvents.length !== formik.values.events.length ||
			formik.values.events.some(
				event =>
					!formik.values.editedEvents.find(e => e.eventId === event.id),
			);

		// Fetch data about series and schedule info of chosen events from backend
		dispatch(fetchScheduling({
			events: formik.values.events,
			fetchNewScheduling: fetchEventInfos,
			setFormikValue: formik.setFieldValue,
	}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.events]);

	/**
	 * For a given matrix of events, return an array of events where the events
	 * have been grouped by their value
	 */
	const reduceGroupEvents = (events: EditedEvents[][]) => {
		const reducedEvents: EditedEvents[] = [];
		Object.entries(events).forEach(([_, value]) => {
			reducedEvents.push(reduceGroupedEvent(value));
		});
		return reducedEvents;
	};

	/**
	 * For a given array of events, returns an event where each property of the event is empty,
	 * except if the value of the property was the exact same for all events in the array,
	 * in which case the property is that value
	 */
	const reduceGroupedEvent = (groupedEvents: EditedEvents[]) => {
		const result = groupedEvents.reduce((prev, curr) => {
			for (const [key, value] of Object.entries(curr)) {
				// TODO: This relies on the fact that the EditedEvent type only contains 'string' and 'string[]'. Improve on that.
				if (typeof value === "string") {
					// @ts-expect-error TS(7006):
					prev[key as keyof EditedEvents] = prev[key as keyof EditedEvents] === curr[key as keyof EditedEvents] ? curr[key as keyof EditedEvents] : "";
				} else {
					// @ts-expect-error TS(7006):
					prev[key as keyof EditedEvents] = prev[key as keyof EditedEvents] === curr[key as keyof EditedEvents] ? curr[key as keyof EditedEvents] : [];
				}
			}
			return prev;
		}, lodash.cloneDeep(groupedEvents[0]));
		return result;
	};

	const findSeriesName = (seriesOptions: { name: string, value: string }[], editedEvents: EditedEvents[]) => {
		const series = seriesOptions.find(e => e.value === reduceGroupedEvent(editedEvents).changedSeries);
		return series ? series.name : "";
	};

	return (
		<>
			<ModalContentTable modalContentClassName="modal-content">
				<Notifications context="not_corner" />

				{/* Table that shows conflicts with other events*/}
				{conflicts.length > 0 && (
					<div className="obj list-obj">
						<table className="main-tbl scheduling-conflict">
							<tr>
								<th>
									{t(
										"BULK_ACTIONS.EDIT_EVENTS.GENERAL.CONFLICT_FIRST_EVENT",
									)}
								</th>
								<th>
									{t(
										"BULK_ACTIONS.EDIT_EVENTS.GENERAL.CONFLICT_SECOND_EVENT",
									)}
								</th>
								<th>{t("EVENTS.EVENTS.TABLE.START")}</th>
								<th>{t("EVENTS.EVENTS.TABLE.END")}</th>
							</tr>
							{conflicts.map(conflict =>
								conflict.conflicts.map((c, key) => (
									<tr key={key}>
										<td>{conflict.eventId}</td>
										<td>{c.title}</td>
										<td>{c.start}</td>
										<td>{c.end}</td>
									</tr>
								)),
							)}
						</table>
					</div>
				)}

				<div className="obj header-description">
					<span>{t("BULK_ACTIONS.EDIT_EVENTS.EDIT.HEADER")}</span>
				</div>

				{/* Repeat table for each selected event */}
				{!loading && (
					<FieldArray
						name="editedEvents"
						render={_arrayHelpers => (
							<>
							{hasAccess(
								"ROLE_UI_EVENTS_DETAILS_METADATA_EDIT",
								user,
							) && (
								<div className="obj tbl-details">
									<header>{t("BULK_ACTIONS.EDIT_EVENTS_METADATA.EDIT.TABLE.FIELDS")}</header>
									<div className="obj-container">
										<table className="main-tbl">
											<tbody>
												<tr>
													<td>
														<span>
															{t(
																"EVENTS.EVENTS.DETAILS.METADATA.TITLE",
															)}
														</span>
													</td>
													<td className="editable">
													{/*
														* Per event there are 14 input fields, so with 'key * 14', the right
														* event is reached. After the '+' comes the number of the input field.
														* This is the first input field for this event.
														*/}
														<input
															type={"text"}
															onChange={element => {
																formik.values.editedEvents.forEach((_, i) => {
																	formik.setFieldValue(
																		`editedEvents.${i}.changedTitle`,
																		element.target.value,
																	);
																});
															}}
															defaultValue={formik.values.editedEvents.length > 0 ? reduceGroupedEvent(formik.values.editedEvents).title : ""}
														/>
													</td>
												</tr>
												<tr>
													<td>
														<span>
															{t(
																"EVENTS.EVENTS.DETAILS.METADATA.SERIES",
															)}
														</span>
													</td>
													<td className="editable">
														{/*
															* Per event there are 14 input fields, so with 'key * 14', the right
															* event is reached. After the '+' comes the number of the input field.
															* This is the second input field for this event.
															*/}
														<DropDown
															value={
																formik.values.editedEvents.length > 0 ? reduceGroupedEvent(formik.values.editedEvents).changedSeries : ""
															}
															text={
																formik.values.editedEvents.length > 0 ? findSeriesName(seriesOptions, formik.values.editedEvents) : ""
															}
															options={seriesOptions.map(option => ({ label: option.name, value: option.value }))}
															required={false}
															handleChange={element => {
																if (element) {
																	formik.values.editedEvents.forEach((_, i) => {
																		formik.setFieldValue(
																			`editedEvents.${i}.changedSeries`,
																			element.value,
																		);
																	});
																}
															}}
															placeholder={formik.values.editedEvents.length > 0 ? reduceGroupedEvent(formik.values.editedEvents).series : ""}
															tabIndex={2 * 14 + 2}
														/>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							)}
								{
									reduceGroupEvents(Object.values(groupBy(formik.values.editedEvents, i => i.weekday))).map((groupedEvent, key) => (
										<div key={key} className="obj tbl-details">
											<header>{t(`EVENTS.EVENTS.NEW.WEEKDAYSLONG.${groupedEvent.weekday}`)
												+ " ("
												+ t("BULK_ACTIONS.EDIT_EVENTS.EDIT.EVENTS")
												+ " "
												+ formik.values.editedEvents.reduce((acc, cur) => cur.weekday === groupedEvent.weekday ? ++acc : acc, 0)
												+ ")"}
											</header>
											<div className="obj-container">
												<table className="main-tbl">
													<tbody>
														{hasAccess(
															"ROLE_UI_EVENTS_DETAILS_SCHEDULING_EDIT",
															user,
														) && (
															<>
																<tr>
																	<td>
																		{t(
																			"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.TIMEZONE",
																		)}
																	</td>
																	<td>{"UTC" + getTimezoneOffset()}</td>
																</tr>
																<SchedulingTime
																	hour={groupedEvent.changedStartTimeHour}
																	minute={groupedEvent.changedStartTimeMinutes}
																	disabled={false}
																	title={"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.START_TIME"}
																	hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
																	minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
																	callbackHour={(value: string) => {
																		for (const [i, entry] of formik.values.editedEvents.entries()) {
																			if (entry.weekday === groupedEvent.weekday) {
																				formik.setFieldValue(
																					`editedEvents.${i}.changedStartTimeHour`,
																					value,
																				);
																			}
																		}
																	}}
																	callbackMinute={(value: string) => {
																		for (const [i, entry] of formik.values.editedEvents.entries()) {
																			if (entry.weekday === groupedEvent.weekday) {
																				formik.setFieldValue(
																					`editedEvents.${i}.changedStartTimeMinutes`,
																					value,
																				);
																			}
																		}
																	}}
																/>
																<SchedulingTime
																	hour={groupedEvent.changedEndTimeHour}
																	minute={groupedEvent.changedEndTimeMinutes}
																	disabled={false}
																	title={"EVENTS.EVENTS.DETAILS.SOURCE.DATE_TIME.END_TIME"}
																	hourPlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.HOUR"}
																	minutePlaceholder={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.MINUTE"}
																	callbackHour={(value: string) => {
																		for (const [i, entry] of formik.values.editedEvents.entries()) {
																			if (entry.weekday === groupedEvent.weekday) {
																				formik.setFieldValue(
																					`editedEvents.${i}.changedEndTimeHour`,
																					value,
																				);
																			}
																		}
																	}}
																	callbackMinute={(value: string) => {
																		for (const [i, entry] of formik.values.editedEvents.entries()) {
																			if (entry.weekday === groupedEvent.weekday) {
																				formik.setFieldValue(
																					`editedEvents.${i}.changedEndTimeMinutes`,
																					value,
																				);
																			}
																		}
																	}}
																/>

																{/* Dropdown for location/input device */}
																<SchedulingLocation
																	location={groupedEvent.changedLocation}
																	inputDevices={inputDevices}
																	disabled={false}
																	title={"EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.LOCATION"}
																	placeholder={"SELECT_NO_OPTION_SELECTED"}
																	callback={(value: string) => {
																		for (const [i, entry] of formik.values.editedEvents.entries()) {
																			if (entry.weekday === groupedEvent.weekday) {
																				formik.setFieldValue(
																					`editedEvents.${i}.changedLocation`,
																					value,
																				);
																				formik.setFieldValue(
																					`editedEvents.${i}.changedDeviceInputs`,
																					value,
																				);
																			}
																		}
																	}}
																/>
																{/* Radio buttons for weekdays
																	*
																	*/}
																<tr>
																	<td>
																		{t(
																			"EVENTS.EVENTS.NEW.SOURCE.SCHEDULE_MULTIPLE.WEEKDAY",
																		)}
																	</td>
																	<td className="weekdays">
																		<fieldset>
																		{weekdays.map((day, index) => (
																			<label key={index}>
																				<input
																					tabIndex={key * 14 + 8 + index}
																					type="radio"
																					name={groupedEvent.weekday}
																					onChange={element => {
																						for (const [i, value] of formik.values.editedEvents.entries()) {
																							if (value.weekday === groupedEvent.weekday) {
																								formik.setFieldValue(
																									`editedEvents.${i}.changedWeekday`,
																									element.target.value,
																								);
																							}
																						}
																					}}
																					defaultChecked={groupedEvent.weekday === day.name}
																					value={day.name}
																				/>
																				{t(day.label)}
																			</label>
																		))}
																		</fieldset>
																	</td>
																</tr>
															</>
														)}
													</tbody>
												</table>
											</div>
										</div>
									))
								}
							</>
						)}
					/>
				)}
			</ModalContentTable>

			{/* Navigation buttons */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={
					() => {
						dispatch(removeNotificationWizardForm());
						if (
							checkSchedulingConflicts(
								formik.values,
								setConflicts,
								dispatch,
							)
						) {
							nextPage(formik.values);
						}
					}
				}
				previousPage={
					() => {
						previousPage(formik.values);
						if (!formik.isValid) {
							// set page as not filled out
							setPageCompleted([]);
						}
					}
				}
			/>
		</>
	);
};

export default EditScheduledEventsEditPage;
