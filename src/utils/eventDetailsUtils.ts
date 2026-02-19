import { Event } from "../slices/eventSlice";

/**
 * This file contains functions and constants that are needed in the event details modal
 */
export const formatDuration = (durationInMS: number) => {
	const totalSeconds = Math.floor(durationInMS / 1000);

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const pad = (n: number) => n.toString().padStart(2, "0");

	if (hours > 0) {
		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	}

	return `${pad(minutes)}:${pad(seconds)}`;
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
