import moment from "moment";
import { makeTwoDigits } from "./utils";
import { FormikErrors } from "formik";

/**
 * This File contains methods concerning dates
 */

// check if date can be parsed
export const renderValidDate = (date: string) => {
	return !isNaN(Date.parse(date)) ? new Date(date) : "";
};

// transform relative date to an absolute date
export const relativeToAbsoluteDate = (relative: string, type: string, from: boolean) => {
	const localMoment = moment();

	let absolute;
	if (from) {
		absolute = localMoment.startOf(type as moment.unitOfTime.StartOf);
	} else {
		absolute = localMoment.endOf(type as moment.unitOfTime.StartOf);
	}

	absolute = absolute.add(relative, type as moment.unitOfTime.Base);

	return absolute.toDate();
};

type RelativeDateSpanValue = {
	relativeDateSpan: {
		from: string;
		to: string;
		unit: string;
	};
};

type UnknownWithRelativeDateSpan = {
	relativeDateSpan: {
		from: unknown;
		to: unknown;
		unit: unknown;
	};
};

export function isRelativeDateSpanValue(
	value: unknown,
): value is RelativeDateSpanValue {
	if (
		typeof value === "object" &&
		value !== null &&
		"relativeDateSpan" in value
	) {
		const { relativeDateSpan } = value as UnknownWithRelativeDateSpan;
		return (
			typeof relativeDateSpan?.from === "string" &&
			typeof relativeDateSpan?.to === "string" &&
			typeof relativeDateSpan?.unit === "string"
		);
	}
	return false;
}

// transform from relative date span to filter value containing absolute dates
export const relativeDateSpanToFilterValue = (
	fromRelativeDate: string,
	toRelativeDate: string,
	type: string,
) => {
	const fromAbsoluteDate = relativeToAbsoluteDate(fromRelativeDate, type, true);
	const toAbsoluteDate = relativeToAbsoluteDate(toRelativeDate, type, false);

	return (
		fromAbsoluteDate.toISOString() +
		"/" +
		toAbsoluteDate.toISOString()
	).toString();
};

// creates a date object from a date, hour and minute
export const makeDate = (
	date: string | number | Date,
	hour: string,
	minute: string,
) => {
	const madeDate = new Date(date);
	madeDate.setHours(parseInt(hour));
	madeDate.setMinutes(parseInt(minute));

	return madeDate;
};

// calculates the duration between a start and end date in hours and minutes
export const calculateDuration = (
	startDate: Date,
	endDate: Date,
) => {
	const duration = (endDate.getTime() - startDate.getTime()) / 1000;
	const durationHours = (duration - (duration % 3600)) / 3600;
	const durationMinutes = (duration % 3600) / 60;

	return { durationHours, durationMinutes };
};

// sets the duration in the formik
const setDuration = (
	startDate: Date,
	endDate: Date,
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
) => {
	const { durationHours, durationMinutes } = calculateDuration(
		startDate,
		endDate,
	);

	setFieldValue("scheduleDurationHours", makeTwoDigits(durationHours));
	setFieldValue("scheduleDurationMinutes", makeTwoDigits(durationMinutes));
};

// checks if the time of the endDate is before the time of the startDate
const isEndBeforeStart = (
	startDate: Date,
	endDate: Date,
) => {
	return startDate > endDate;
};

type RequiredFormikValues = {
	scheduleEndHour: string,
	scheduleEndMinute: string,
	captureAgent?: string,  // Ideally this should be required if "checkConflicts" is not undefined
}

// changes the start in the formik
const changeStart = (
	eventId: string,
	start: {
		date: string | number | Date,
		hour: string,
		minute: string,
	},
	formikValues: RequiredFormikValues,
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	const startDate = makeDate(start.date, start.hour, start.minute);
	const endDate = makeDate(
		start.date,
		formikValues.scheduleEndHour,
		formikValues.scheduleEndMinute,
	);

	if (isEndBeforeStart(startDate, endDate)) {
		endDate.setDate(startDate.getDate() + 1);
	}

	setDuration(startDate, endDate, setFieldValue);
	setFieldValue("scheduleEndDate", endDate.toISOString());
	setFieldValue("scheduleStartDate", startDate.toISOString());

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

export const changeStartDate = (
	value: Date,
	formikValues: RequiredFormikValues & { scheduleStartHour: string, scheduleStartMinute: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeStart(
		eventId,
		{
			date: value,
			hour: formikValues.scheduleStartHour,
			minute: formikValues.scheduleStartMinute,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);
};

export const changeStartHour = (
	value: string,
	formikValues: RequiredFormikValues & { scheduleStartDate: string | number, scheduleStartMinute: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeStart(
		eventId,
		{
			date: formikValues.scheduleStartDate,
			hour: value,
			minute: formikValues.scheduleStartMinute,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleStartHour", value);
};

export const changeStartMinute = (
	value: string,
	formikValues: RequiredFormikValues & { scheduleStartDate: string | number, scheduleStartHour: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeStart(
		eventId,
		{
			date: formikValues.scheduleStartDate,
			hour: formikValues.scheduleStartHour,
			minute: value,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleStartMinute", value);
};

// changes the end in the formik
const changeEnd = (
	eventId: string,
	end: {
		hour: string,
		minute: string,
	},
	formikValues: RequiredFormikValues & { scheduleStartDate: string | number, scheduleStartHour: string, scheduleStartMinute: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	const endDate = makeDate(
		formikValues.scheduleStartDate,
		end.hour,
		end.minute,
	);
	const startDate = makeDate(
		formikValues.scheduleStartDate,
		formikValues.scheduleStartHour,
		formikValues.scheduleStartMinute,
	);

	if (isEndBeforeStart(startDate, endDate)) {
		endDate.setDate(startDate.getDate() + 1);
	}

	setDuration(startDate, endDate, setFieldValue);
	setFieldValue("scheduleEndDate", endDate.toISOString());

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

export const changeEndHour = (
	value: string,
	formikValues: RequiredFormikValues & { scheduleStartDate: string | number, scheduleStartHour: string, scheduleStartMinute: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeEnd(
		eventId,
		{
			hour: value,
			minute: formikValues.scheduleEndMinute,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleEndHour", value);
};

export const changeEndMinute = (
	value: string,
	formikValues: RequiredFormikValues & { scheduleStartDate: string | number, scheduleStartHour: string, scheduleStartMinute: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeEnd(
		eventId,
		{
			hour: formikValues.scheduleEndHour,
			minute: value,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleEndMinute", value);
};

// changes the duration in the formik
const changeDuration = (
	eventId: string,
	duration: { hours: string, minutes: string },
	formikValues: RequiredFormikValues & { scheduleStartDate: string | number, scheduleStartHour: string, scheduleStartMinute: string },
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	const startDate = makeDate(
		formikValues.scheduleStartDate,
		formikValues.scheduleStartHour,
		formikValues.scheduleStartMinute,
	);
	const endDate = new Date(startDate.toISOString());

	endDate.setHours(endDate.getHours() + parseInt(duration.hours));
	endDate.setMinutes(endDate.getMinutes() + parseInt(duration.minutes));

	setFieldValue("scheduleEndHour", makeTwoDigits(endDate.getHours()));
	setFieldValue("scheduleEndMinute", makeTwoDigits(endDate.getMinutes()));
	setFieldValue("scheduleEndDate", endDate.toISOString());

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

export const changeDurationHour = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleStartDate: string | number,
		scheduleStartHour: string,
		scheduleStartMinute: string,
		scheduleDurationMinutes: string
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeDuration(
		eventId,
		{
			hours: value,
			minutes: formikValues.scheduleDurationMinutes,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleDurationHours", value);
};

export const changeDurationMinute = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleStartDate: string | number,
		scheduleStartHour: string,
		scheduleStartMinute: string,
		scheduleDurationHours: string
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeDuration(
		eventId,
		{
			hours: formikValues.scheduleDurationHours,
			minutes: value,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleDurationMinutes", value);
};

// changes the start in the formik
const changeStartMultiple = (
	eventId: string,
	start: {
		date: string | number | Date,
		hour: string,
		minute: string,
	},
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	const startDate = makeDate(start.date, start.hour, start.minute);
	let endDate = makeDate(
		start.date,
		formikValues.scheduleEndHour,
		formikValues.scheduleEndMinute,
	);

	if (isEndBeforeStart(startDate, endDate)) {
		endDate.setDate(startDate.getDate() + 1);
	}

	setDuration(startDate, endDate, setFieldValue);

	endDate = makeDate(
		formikValues.scheduleEndDate,
		formikValues.scheduleEndHour,
		formikValues.scheduleEndMinute,
	);

	if (isEndBeforeStart(startDate, endDate)) {
		endDate.setDate(startDate.getDate() + 1);
	}

	setFieldValue("scheduleEndDate", endDate.toISOString());
	setFieldValue("scheduleStartDate", startDate.toISOString());

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

export const changeStartDateMultiple = (
	value: Date,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeStartMultiple(
		eventId,
		{
			date: value,
			hour: formikValues.scheduleStartHour,
			minute: formikValues.scheduleStartMinute,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);
};

export const changeStartHourMultiple = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeStartMultiple(
		eventId,
		{
			date: formikValues.scheduleStartDate,
			hour: value,
			minute: formikValues.scheduleStartMinute,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleStartHour", value);
};

export const changeStartMinuteMultiple = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeStartMultiple(
		eventId,
		{
			date: formikValues.scheduleStartDate,
			hour: formikValues.scheduleStartHour,
			minute: value,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleStartMinute", value);
};

// changes the end in the formik
export const changeEndDateMultiple = (
	value: string | Date,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	const endDate = makeDate(
		value,
		formikValues.scheduleEndHour,
		formikValues.scheduleEndMinute,
	);
	const startDate = makeDate(
		formikValues.scheduleStartDate,
		formikValues.scheduleStartHour,
		formikValues.scheduleStartMinute,
	);

	if (isEndBeforeStart(startDate, endDate)) {
		startDate.setDate(endDate.getDate());
		if (isEndBeforeStart(startDate, endDate)) {
			startDate.setDate(endDate.getDate() - 1);
		}
	}

	setFieldValue("scheduleEndDate", endDate.toISOString());
	setFieldValue("scheduleStartDate", startDate.toISOString());

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

// changes the end in the formik
const changeEndMultiple = (
	eventId: string,
	end: {
		hour: string,
		minute: string,
	},
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	let endDate = makeDate(formikValues.scheduleStartDate, end.hour, end.minute);
	const startDate = makeDate(
		formikValues.scheduleStartDate,
		formikValues.scheduleStartHour,
		formikValues.scheduleStartMinute,
	);

	if (isEndBeforeStart(startDate, endDate)) {
		endDate.setDate(startDate.getDate() + 1);
	}

	setDuration(startDate, endDate, setFieldValue);

	endDate = makeDate(formikValues.scheduleEndDate, end.hour, end.minute);

	if (isEndBeforeStart(startDate, endDate)) {
		endDate.setDate(startDate.getDate() + 1);
	  setFieldValue("scheduleEndDate", endDate.toISOString());
	}

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

export const changeEndHourMultiple = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeEndMultiple(
		eventId,
		{
			hour: value,
			minute: formikValues.scheduleEndMinute,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleEndHour", value);
};

export const changeEndMinuteMultiple = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeEndMultiple(
		eventId,
		{
			hour: formikValues.scheduleEndHour,
			minute: value,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleEndMinute", value);
};

// changes the duration in the formik
const changeDurationMultiple = (
	eventId: string,
	duration: {
		hours: string,
		minutes: string,
	},
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	const startDate = makeDate(
		formikValues.scheduleStartDate,
		formikValues.scheduleStartHour,
		formikValues.scheduleStartMinute,
	);
	const endDate = makeDate(
		formikValues.scheduleEndDate,
		formikValues.scheduleStartHour,
		formikValues.scheduleStartMinute,
	);

	endDate.setHours(endDate.getHours() + parseInt(duration.hours));
	endDate.setMinutes(endDate.getMinutes() + parseInt(duration.minutes));

	setFieldValue("scheduleEndHour", makeTwoDigits(endDate.getHours()));
	setFieldValue("scheduleEndMinute", makeTwoDigits(endDate.getMinutes()));
	setFieldValue("scheduleEndDate", endDate.toISOString());

	if (!!checkConflicts && !!formikValues.captureAgent) {
		checkConflicts(
			eventId,
			startDate,
			endDate,
			formikValues.captureAgent,
		);
	}
};

export const changeDurationHourMultiple = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
		scheduleDurationMinutes: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeDurationMultiple(
		eventId,
		{
			hours: value,
			minutes: formikValues.scheduleDurationMinutes,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleDurationHours", value);
};

export const changeDurationMinuteMultiple = (
	value: string,
	formikValues: RequiredFormikValues & {
		scheduleEndDate: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
		scheduleDurationHours: string,
	},
	setFieldValue: (field: string, value: string) => Promise<void | FormikErrors<any>>,
	eventId = "",
	checkConflicts?: (id: string, startDate: Date, endDate: Date, ca: string) => unknown,
) => {
	changeDurationMultiple(
		eventId,
		{
			hours: formikValues.scheduleDurationHours,
			minutes: value,
		},
		formikValues,
		setFieldValue,
		checkConflicts,
	);

	setFieldValue("scheduleDurationMinutes", value);
};

// get localized time
export const localizedMoment = (m: string, currentLanguageCode: string) => {
	return moment(m).locale(currentLanguageCode);
};
