import moment from "moment";
import { Event } from "../slices/eventSlice";

/**
 * This file contains functions and constants that are needed in the event details modal
 */

export const styleNav = {
	borderBottom: "1px solid #d6d6d6",
	lineHeight: "35px",
};

export const styleNavHierarchyInactive = {
	marginLeft: "30px",
	color: "#92a0ab",
};

export const styleNavHierarchy = {
	marginLeft: "30px",
	marginRight: "30px",
	fontWeight: "600",
	color: "#5d7589",
};

export const styleButtonSpacing = {
	marginTop: "13px",
	marginLeft: "15px",
	marginRight: "15px",
};

export const errorDetailStyle = {
	overflow: "auto",
	width: "750px",
};

export const formatDuration = (durationInMS: number) => {
	const duration = moment.duration(durationInMS);
	if (duration.asHours() > 1) {
		return moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
	} else {
		return moment.utc(duration.asMilliseconds()).format("mm:ss");
	}
};

export const humanReadableBytesFilter = (bytesValue: string | number) => {
	// best effort, independent on type
	let bytes = bytesValue;
	if (typeof bytes === "string") {
		return bytesValue;
	}

	// from http://stackoverflow.com/a/14919494
	const thresh = 1000;
	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}
	const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	let u = -1;
	do {
		bytes /= thresh;
		++u;
	} while (Math.abs(bytes) >= thresh && u < units.length - 1);

	return bytes.toFixed(1) + " " + units[u];
};

export const hasScheduledStatus = (event: Event) => {
	return event.event_status.toUpperCase().indexOf("SCHEDULED") > -1 ||
		event.event_status.toUpperCase().indexOf("RECORDING") > -1;
};
