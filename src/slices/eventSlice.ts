import { PayloadAction, SerializedError, createSlice } from "@reduxjs/toolkit";
import { eventsTableConfig } from "../configs/tableConfigs/eventsTableConfig";
import axios, { AxiosError, AxiosProgressEvent } from "axios";
import moment from "moment-timezone";
import {
	getURLParams,
	prepareAccessPolicyRulesForPost,
	prepareMetadataFieldsForPost,
	transformMetadataCollection,
	transformMetadataFields,
} from "../utils/resourceUtils";
import { makeTwoDigits } from "../utils/utils";
import { sourceMetadata } from "../configs/sourceConfig";
import {
	NOTIFICATION_CONTEXT,
	weekdays,
	WORKFLOW_UPLOAD_ASSETS_NON_TRACK,
} from "../configs/modalConfig";
import {
	removeNotification,
	addNotification,
} from "./notificationSlice";
import { getAssetUploadOptions, getSchedulingEditedEvents, getSourceUploadOptions } from "../selectors/eventSelectors";
import { fetchSeriesOptions } from "./seriesSlice";
import { AppDispatch, AppThunk } from "../store";
import { fetchAssetUploadOptions } from "../thunks/assetsThunks";
import { TransformedAcl } from "./aclDetailsSlice";
import { TableConfig } from "../configs/tableConfigs/aclsTableConfig";
import { Publication } from "./eventDetailsSlice";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { FormikErrors } from "formik";

/**
 * This file contains redux reducer for actions affecting the state of events
 */
type Comment = {
	reason: string,
	resolvedStatus: boolean,
	modificationDate: string,
	replies: {
		id: number,
		text: string,
		creationDate: string,
		modificationDate: string,
		author: {
			name: string,
			email?: string,
			username: string,
		}
	}[],
	author: {
		name: string,
		email?: string,
		username: string,
	},
	id: number,
	text: string,
	creationDate: string,
}

// Strings will be empty if there is no value
export type Event = {
	agent_id: string,
	comments?: Comment[],
	date: string,
	displayable_status: string,
	end_date: string,
	event_status: string,
	has_comments: boolean,
	has_open_comments: boolean,
	has_preview: boolean,
	id: string,
	location: string,
	managedAcl: string,
	needs_cutting: boolean,
	presenters: string[],
	publications: Publication[],
	selected?: boolean,
	series?: { id: string, title: string }
	source: string,
	start_date: string,
	technical_end: string,
	technical_presenters: string[],
	technical_start: string,
	title: string,
	workflow_state: string,
}

export type MetadataField = {
	delimiter?: string,
	differentValues?: boolean,
	collection?: {
		name: string,
		value: string,
		label?: string,
		order?: number,
		selectable?: boolean,
	 }[],
	id: string,
	label: string,
	readOnly: boolean,
	required: boolean,
	translatable?: boolean,
	type: string,
	value: string | string[],
}

export type MetadataFieldSelected = MetadataField & { selected: boolean }

export type MetadataCatalog = {
	title: string,
	flavor: string,
	fields: MetadataField[],
}

export type EditedEvents = {
	changedDeviceInputs: string[],
	changedEndTimeHour: string,
	changedEndTimeMinutes: string,
	changedLocation: string,
	changedSeries: string,
	changedStartTimeHour: string,
	changedStartTimeMinutes: string,
	changedTitle: string,
	changedWeekday: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU",
	deviceInputs: string,
	endTimeHour: string,
	endTimeMinutes: string,
	eventId: string,
	location: string,
	series: string,
	startTimeHour: string,
	startTimeMinutes: string,
	title: string,
	weekday: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU",
}

export type UploadOption = {
	accept: string,
	displayFallback?: string,
	"displayFallback.DETAIL"?: string,
	"displayFallback.SHORT"?: string,
	displayOrder: number,
	flavorSubType: string,
	flavorType: string,
	id: string,
	multiple: boolean,
	showAs: string,
	title: string,
	type: string,
	displayOverride?: string,
	"displayOverride.SHORT"?: string,
	"displayOverride.DETAIL"?: string,
	showForNewEvents?: boolean,
	showForExistingEvents?: boolean,
}

export type UploadAssetsTrack = UploadOption & {
	file?: FileList
}

export type Conflict = {
	conflicts: {
		end: string,
		start: string,
		title: string,
	}[],
	eventId: string,
}

type EventState = {
	status: "uninitialized" | "loading" | "succeeded" | "failed",
	error: SerializedError | null,
	statusMetadata: "uninitialized" | "loading" | "succeeded" | "failed",
	errorMetadata: SerializedError | null,
	statusSchedulingInfo: "uninitialized" | "loading" | "succeeded" | "failed",
	errorSchedulingInfo: SerializedError | null,
	statusAssetUploadOptions: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetUploadOptions: SerializedError | null,
	results: Event[],
	columns: TableConfig["columns"],
	total: number,
	count: number,
	offset: number,
	limit: number,
	showActions: boolean,
	metadata: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	isFetchingAssetUploadOptions: boolean,
	uploadAssetOptions: UploadOption[],
	uploadSourceOptions: UploadOption[],
	uploadAssetWorkflow: string | undefined,
	schedulingInfo: {
		editedEvents: EditedEvents[],
		seriesOptions: {
			name: string,
			value: string,
		}[],
	},
}

// Fill columns initially with columns defined in eventsTableConfig
const initialColumns = eventsTableConfig.columns.map(column => ({
	deactivated: false,
	...column,
}));

// Initial state of events in redux store
const initialState: EventState = {
	status: "uninitialized",
	error: null,
	statusMetadata: "uninitialized",
	errorMetadata: null,
	statusSchedulingInfo: "uninitialized",
	errorSchedulingInfo: null,
	statusAssetUploadOptions: "uninitialized",
	errorAssetUploadOptions: null,
  results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	limit: 0,
	offset: 0,
	showActions: false,
	metadata: {
		title: "",
		flavor: "",
		fields: [],
	},
	extendedMetadata: [],
	isFetchingAssetUploadOptions: false,
	uploadAssetOptions: [],
	uploadSourceOptions: [],
	uploadAssetWorkflow: "",
	schedulingInfo: {
		editedEvents: [],
		seriesOptions: [],
	},
};

export type FetchEvents = {
	total: number,
	count: number,
	offset: number,
	limit: number,
	results: EventState["results"],
};

// fetch events from server
export const fetchEvents = createAppAsyncThunk("events/fetchEvents", async (_, { getState }) => {
	const state = getState();
	let params: ReturnType<typeof getURLParams> & { getComments?: boolean } = getURLParams(state, "events");

	// Add a secondary filter to enforce order of events
	// (Elasticsearch does not guarantee ordering)
	params = {
		...params,
		sort: params.sort ? params.sort + ",uid:asc" : "uid:asc",
	};

	// Only if the notes column is enabled, fetch comment information for events
	if (state.events.columns.find(column => column.label === "EVENTS.EVENTS.TABLE.ADMINUI_NOTES" && !column.deactivated)) {
		params = {
			...params,
			getComments: true,
		};
	}

	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get<FetchEvents>("/admin-ng/event/events.json", { params: params });
	const response = res.data;

	for (let i = 0; response.results.length > i; i++) {
		// insert date property
		response.results[i] = {
			...response.results[i],
			date: response.results[i].start_date,
		};
	}
	const events = response;

	return events;
});

// fetch event metadata from server
export const fetchEventMetadata = createAppAsyncThunk("events/fetchEventMetadata", async (_, { rejectWithValue }) => {
	const data = await axios.get<MetadataCatalog[]>("/admin-ng/event/new/metadata");
	const response = data.data;

	const mainCatalog = "dublincore/episode";
	let metadata: EventState["metadata"] | undefined = undefined;
	const extendedMetadata = [];

	for (const metadataCatalog of response) {
		if (metadataCatalog.flavor === mainCatalog) {
			metadata = transformMetadataCollection({ ...metadataCatalog });
		} else {
			extendedMetadata.push(
				transformMetadataCollection({ ...metadataCatalog }),
			);
		}
	}

	if (!metadata) {
		console.error("Main metadata catalog is missing");
		return rejectWithValue("Main metadata catalog is missing");
	}

	return { metadata, extendedMetadata };
});

// get merged metadata for provided event ids
export const postEditMetadata = createAppAsyncThunk("events/postEditMetadata", async (ids: Event["id"][]) => {
	type PostEditMetadata = {
		metadata: MetadataField[],
		notFound: string[],
		merged: string[],
		runningWorkflow: string[],
	};
	const formData = new URLSearchParams();
	formData.append("eventIds", JSON.stringify(ids));

	const data = await axios.post<PostEditMetadata>(
		"/admin-ng/event/events/metadata.json",
		formData,
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		},
	);
	const response = data.data;

	// transform response
	const metadata = transformMetadataFields(response.metadata)
		.map(field => ({ ...field, selected: false }));
	return {
		mergedMetadata: metadata,
		notFound: response.notFound,
		merged: response.merged,
		runningWorkflow: response.runningWorkflow,
	};
});

export const updateBulkMetadata = (params: {
	metadataFields: {
		merged: string[],
		mergedMetadata: MetadataFieldSelected[],
		notFound?: string[],
		runningWorkflow?: string[],
	},
	values: { [key: string]: unknown }
}): AppThunk => dispatch => {
	const { metadataFields, values } = params;

	const formData = new URLSearchParams();
	formData.append("eventIds", JSON.stringify(metadataFields.merged));
	const metadata : { flavor: string, title: string, fields: any[]}[] = [
		{
			flavor: "dublincore/episode",
			title: "EVENTS.EVENTS.DETAILS.CATALOG.EPISODE",
			fields: [],
		},
	];

	metadataFields.mergedMetadata.forEach(field => {
		if (field.selected) {
			const value = values[field.id];
			metadata[0].fields.push({
				...field,
				value: value,
			});
		}
	});

	formData.append("metadata", JSON.stringify(metadata));

	axios
		.put("/admin-ng/event/events/metadata", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(res => {
			console.info(res);
			dispatch(
				addNotification({ type: "success", key: "BULK_METADATA_UPDATE.ALL_EVENTS_UPDATED" }),
			);
		})
		.catch(err => {
			console.error(err);
			if (axios.isAxiosError<{ updated: string[], updateFailures: string[], notFound: string[] }>(err) && err.response) {
				// if an internal server error occurred, then backend sends further information
				if (err.status === 500) {
					// backend should send data containing further information about occurred internal error
					// if this error data is undefined then an unexpected error occurred
					const data = err.response.data;
					if (!data) {
						dispatch(
							addNotification({ type: "error", key: "BULK_METADATA_UPDATE.UNEXPECTED_ERROR" }),
						);
					} else {
						if (data.updated && data.updated.length === 0) {
							dispatch(
								addNotification({ type: "error", key: "BULK_METADATA_UPDATE.NO_EVENTS_UPDATED" }),
							);
						}
						if (data.updateFailures && data.updateFailures.length > 0) {
							dispatch(
								addNotification({
									type: "warning",
									key: "BULK_METADATA_UPDATE.SOME_EVENTS_NOT_UPDATED",
								}),
							);
						}
						if (data.notFound && data.notFound.length > 0) {
							dispatch(
								addNotification({
									type: "warning",
									key: "BULK_ACTIONS.EDIT_EVENTS_METADATA.REQUEST_ERRORS.NOT_FOUND",
								}),
							);
						}
					}
				} else {
					dispatch(
						addNotification({ type: "error", key: "BULK_METADATA_UPDATE.UNEXPECTED_ERROR" }),
					);
				}
			}
		});
};

export const postNewEvent = (params: {
	values: {
		policies: TransformedAcl[],
		configuration: { [key: string]: unknown },
		inputs?: string[],
		processingWorkflow: string,
		repeatOn: string[],
		scheduleDurationHours: string,
		scheduleDurationMinutes: string,
		scheduleEndDate: string,
		scheduleEndHour: string,
		scheduleEndMinute: string,
		scheduleStartDate: string,
		scheduleStartHour: string,
		scheduleStartMinute: string,
		sourceMode: string,
		uploadAssetsTrack?: UploadAssetsTrack[],
		[key: string]: unknown,
	},
	metadataInfo: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
}): AppThunk => (dispatch, getState) => {
	const { values, metadataInfo, extendedMetadata } = params;
	// get asset upload options from redux store
	const state = getState();
	const uploadAssetOptions = getAssetUploadOptions(state);
	const uploadSourceOptions = getSourceUploadOptions(state);

	const formData = new FormData();
	let source: {
		type: string,
		metadata?: {
			start: Date,
			device: unknown,
			inputs: string,
			end: Date,
			duration: string,
			rrule?: string,
		}
	} | undefined = undefined;

	// prepare metadata provided by user
	const metadata = prepareMetadataFieldsForPost(
		[metadataInfo],
		values,
	);
	const extendedMetadataCatalogs = prepareMetadataFieldsForPost(
		extendedMetadata,
		values,
	);

	// if source mode is UPLOAD than also put metadata fields of that in metadataFields
	if (values.sourceMode === "UPLOAD") {
		// set source type UPLOAD
		source = {
			type: values.sourceMode,
		};
		if (sourceMetadata.UPLOAD) {
			for (const smetadata of sourceMetadata.UPLOAD.metadata) {
				metadata[0].fields = metadata[0].fields.concat({
					id: smetadata.id,
					value: values[smetadata.id],
					type: smetadata.type,
				});
			}
		}
	}

	// transform date data for post request if source mode is SCHEDULE_*
	if (
		values.sourceMode === "SCHEDULE_SINGLE" ||
		values.sourceMode === "SCHEDULE_MULTIPLE"
	) {
		// Get timezone offset
		// let offset = getTimezoneOffset();

		// Prepare start date of event for post
		const startDate = new Date(values.scheduleStartDate);
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		// startDate.setHours((values.scheduleStartHour - offset), values.scheduleStartMinute, 0, 0);
		startDate.setHours(
			parseInt(values.scheduleStartHour),
			parseInt(values.scheduleStartMinute),
			0,
			0,
		);

		let endDate;

		// Prepare end date of event for post
		if (values.sourceMode === "SCHEDULE_SINGLE") {
			endDate = new Date(values.scheduleStartDate);
		} else {
			endDate = new Date(values.scheduleEndDate);
		}
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		// endDate.setHours((values.scheduleEndHour - offset), values.scheduleEndMinute, 0, 0);
		endDate.setHours(parseInt(values.scheduleEndHour), parseInt(values.scheduleEndMinute), 0, 0);

		// transform duration into milliseconds
		const duration =
			parseInt(values.scheduleDurationHours) * 3600000 +
			parseInt(values.scheduleDurationMinutes) * 60000;

		// data about source for post request
		source = {
			type: values.sourceMode,
			metadata: {
				start: startDate,
				device: values.location,
				inputs: values.inputs ? values.inputs.join(",") : "",
				end: endDate,
				duration: duration.toString(),
			},
		};

		if (values.sourceMode === "SCHEDULE_MULTIPLE") {
			// assemble an iCalendar RRULE (repetition instruction) for the given user input
			const rRule =
				"FREQ=WEEKLY;BYDAY=" +
				values.repeatOn.join(",") +
				";BYHOUR=" +
				startDate.getUTCHours() +
				";BYMINUTE=" +
				startDate.getUTCMinutes();

			if (source.metadata) {
				source.metadata.rrule = rRule;
			}
		}
	}

	// information about upload assets options
	// need to provide all possible upload asset options independent of source mode/type
	const assets: {
		workflow: string,
		options: UploadOption[],
	} = {
		workflow: WORKFLOW_UPLOAD_ASSETS_NON_TRACK,
		options: [],
	};

	// iterate through possible upload asset options and put them in assets
	// if source mode/type is UPLOAD and a file for a asset is uploaded by user than append file to form data
	for (let i = 0; uploadSourceOptions.length > i; i++) {
		if (values.sourceMode === "UPLOAD") {
			const asset = values.uploadAssetsTrack?.find(
				asset => asset.id === uploadSourceOptions[i].id,
			);
			if (!!asset && !!asset.file) {
				if (asset.multiple) {
					for (let j = 0; asset.file.length > j; j++) {
						formData.append(asset.id + "." + j, asset.file[j]);
					}
				} else {
					formData.append(asset.id + ".0", asset.file[0]);
				}
			}
			assets.options = assets.options.concat(uploadSourceOptions[i]);
		}
	}
	for (let i = 0; uploadAssetOptions.length > i; i++) {
		if (
			!!values[uploadAssetOptions[i].id] &&
			values.sourceMode === "UPLOAD"
		) {
			formData.append(
				uploadAssetOptions[i].id + ".0",
				values[uploadAssetOptions[i].id] as File,
			);
			assets.options = assets.options.concat(uploadAssetOptions[i]);
		}
	}

	// prepare access rules provided by user
	const access = prepareAccessPolicyRulesForPost(values.policies);

	// prepare configurations for post
	const configurationPrepared: { [key: string]: string } = {};
	Object.keys(values.configuration).forEach(config => {
		configurationPrepared[config] = String(values.configuration[config]);
	});

	for (const entry of extendedMetadataCatalogs) {
		metadata.push(entry);
	}

	formData.append(
		"metadata",
		JSON.stringify({
			metadata: metadata,
			processing: {
				workflow: values.processingWorkflow,
				configuration: configurationPrepared,
			},
			access: access,
			source: source,
			assets: assets,
		}),
	);

	// Process bar notification
	const notificationId = Math.floor(Math.random() * -100000);
	const config = {
		onUploadProgress: function (progressEvent: AxiosProgressEvent) {
			const percentCompleted = progressEvent.total ? (progressEvent.loaded * 100) / progressEvent.total : undefined;
			if (percentCompleted) {
				dispatch(addNotification({
					id: notificationId,
					type: "success",
					key: "EVENTS_UPLOAD_STARTED",
					duration: -1,
					parameter: { "progress": percentCompleted.toFixed(2), "title": metadata[0].fields[0].value },
				}));
			}
			if (!percentCompleted || percentCompleted >= 100) {
				dispatch(removeNotification(notificationId));
			}
		},
		headers: {
			"Content-Type": "multipart/form-data",
		},
	};

	axios
		.post("/admin-ng/event/new", formData, config)
		.then(response => {
			console.info(response);
			dispatch(addNotification({ type: "success", key: "EVENTS_CREATED" }));
		})
		.catch(response => {
			console.error(response);
			dispatch(addNotification({ type: "error", key: "EVENTS_NOT_CREATED" }));
		});
};

// delete event with provided id
export const deleteEvent = (id: Event["id"]): AppThunk => dispatch => {
	// API call for deleting an event
	axios
		.delete(`/admin-ng/event/${id}`)
		.then(res => {
			// add success notification depending on status code
			if (res.status === 200) {
				dispatch(addNotification({ type: "success", key: "EVENT_DELETED" }));
			} else {
				dispatch(addNotification({ type: "success", key: "EVENT_WILL_BE_DELETED" }));
			}
		})
		.catch((error: AxiosError) => {
			// add error notification depending on status code
			if (error.status === 401) {
				dispatch(addNotification({ type: "error", key: "EVENTS_NOT_DELETED_NOT_AUTHORIZED" }));
			} else {
				dispatch(addNotification({ type: "error", key: "EVENTS_NOT_DELETED" }));
			}
		});
};

export const deleteMultipleEvent = (events: Event[]): AppThunk => dispatch => {
	const data = [];

	for (const event of events) {
		if (event.selected) {
			data.push(event.id);
		}
	}

	axios
		.post("/admin-ng/event/deleteEvents", data)
		.then(res => {
			console.info(res);
			// add success notification
			dispatch(addNotification({ type: "success", key: "EVENTS_DELETED" }));
		})
		.catch(res => {
			console.error(res);
			// add error notification
			dispatch(addNotification({ type: "error", key: "EVENTS_NOT_DELETED" }));
		});
};

export const fetchScheduling = createAppAsyncThunk("events/fetchScheduling", async (params: {
	events: Event[],
	fetchNewScheduling: boolean,
	setFormikValue: (field: string, value: EditedEvents[]) => Promise<void | FormikErrors<any>>
}, { getState }) => {
	type FetchScheduling = {
		eventId: string,
		agentConfiguration: {
			"event.title": string,
			"event.location": string,
			"capture.device.names": string,
			"event.series"?: string,
		},
		start: string, // Date string
		end: string, // Date string
	};
	const { events, fetchNewScheduling, setFormikValue } = params;

	let editedEvents = [];

	// Only load schedule info about event, when not loaded before
	if (fetchNewScheduling) {
		const formData = new FormData();

		for (const event of events) {
			if (event.selected) {
				formData.append("eventIds", event.id);
			}
		}

		formData.append("ignoreNonScheduled", JSON.stringify(true));

		const response = await axios.post<FetchScheduling[]>(
			"/admin-ng/event/scheduling.json",
			formData,
		);

		const data = response.data;

		// transform data for further use
		for (const d of data) {
			const startDate = new Date(d.start);
			const endDate = new Date(d.end);
			const event = {
				eventId: d.eventId,
				title: d.agentConfiguration["event.title"],
				changedTitle: d.agentConfiguration["event.title"],
				series: d.agentConfiguration["event.series"]
					? d.agentConfiguration["event.series"]
					: "",
				changedSeries: d.agentConfiguration["event.series"]
					? d.agentConfiguration["event.series"]
					: "",
				location: d.agentConfiguration["event.location"],
				changedLocation: d.agentConfiguration["event.location"],
				deviceInputs: d.agentConfiguration["capture.device.names"],
				changedDeviceInputs: d.agentConfiguration[
					"capture.device.names"
				].split(","),
				startTimeHour: makeTwoDigits(startDate.getHours()),
				changedStartTimeHour: makeTwoDigits(startDate.getHours()),
				startTimeMinutes: makeTwoDigits(startDate.getMinutes()),
				changedStartTimeMinutes: makeTwoDigits(startDate.getMinutes()),
				endTimeHour: makeTwoDigits(endDate.getHours()),
				changedEndTimeHour: makeTwoDigits(endDate.getHours()),
				endTimeMinutes: makeTwoDigits(endDate.getMinutes()),
				changedEndTimeMinutes: makeTwoDigits(endDate.getMinutes()),
				weekday: weekdays[(startDate.getDay() + 6) % 7].name,
				changedWeekday: weekdays[(startDate.getDay() + 6) % 7].name,
			};
			editedEvents.push(event);
		}
	} else {
		const state = getState();
		editedEvents = getSchedulingEditedEvents(state);
	}

	const responseSeriesOptions = await fetchSeriesOptions();

	setFormikValue("editedEvents", editedEvents);

	return { editedEvents, responseSeriesOptions };
});

// update multiple scheduled events at once
export const updateScheduledEventsBulk = (values: {
	changedEvents: string[],
	editedEvents: EditedEvents[],
	events: Event[],
}): AppThunk => dispatch => {
	const formData = new FormData();
	const update = [];
	const timezone = moment.tz.guess();

	for (const changedEvent of values.changedEvents) {
		const eventChanges = values.editedEvents.find(
			event => event.eventId === changedEvent,
		);
		const originalEvent = values.events.find(
			event => event.id === changedEvent,
		);

		if (!eventChanges || !originalEvent) {
			dispatch(
				addNotification({
					type: "error",
					key: "EVENTS_NOT_UPDATED_ID",
					duration: 10,
					parameter: { id: changedEvent },
				}),
			);
			return;
		}

		update.push({
			events: [eventChanges.eventId],
			metadata: {
				// flavor: originalEvent.flavor,
				title: "EVENTS.EVENTS.DETAILS.CATALOG.EPISODE",
				fields: [
					{
						id: "title",
						label: "EVENTS.EVENTS.DETAILS.METADATA.TITLE",
						readOnly: false,
						required: false,
						type: "text",
						value: eventChanges.changedTitle,
					},
					{
						id: "isPartOf",
						collection: {},
						label: "EVENTS.EVENTS.DETAILS.METADATA.SERIES",
						readOnly: false,
						required: false,
						translatable: false,
						type: "text",
						value: eventChanges.changedSeries,
					},
				],
			},
			scheduling: {
				timezone: timezone,
				start: {
					hour: parseInt(eventChanges.changedStartTimeHour),
					minute: parseInt(eventChanges.changedStartTimeMinutes),
				},
				end: {
					hour: parseInt(eventChanges.changedEndTimeHour),
					minute: parseInt(eventChanges.changedEndTimeMinutes),
				},
				weekday: eventChanges.changedWeekday,
				agentId: eventChanges.changedLocation,
				// the following two lines can be commented in, when the possibility of a selection of individual inputs is desired and the backend has been adapted to support it (the word inputs may have to be replaced accordingly)
				// ,
				// inputs: eventChanges.changedDeviceInputs.join(',')
			},
		});
	}

	formData.append("update", JSON.stringify(update));

	axios
		.put("/admin-ng/event/bulk/update", formData)
		.then(res => {
			console.info(res);
			dispatch(addNotification({ type: "success", key: "EVENTS_UPDATED_ALL" }));
		})
		.catch(res => {
			console.error(res);
			dispatch(addNotification({ type: "error", key: "EVENTS_NOT_UPDATED_ALL" }));
		});
};

// check provided date range for conflicts

export const checkConflicts = (values: {
	location: string,
	repeatOn: string[],
	scheduleDurationHours: string,
	scheduleDurationMinutes: string,
	scheduleEndDate: string,
	scheduleEndHour: string,
	scheduleEndMinute: string,
	scheduleStartDate: string,
	scheduleStartHour: string,
	scheduleStartMinute: string,
	sourceMode: string,
}) => async (dispatch: AppDispatch) => {
	let check = true;

	// Only perform checks if source mode is SCHEDULE_SINGLE or SCHEDULE_MULTIPLE
	if (
		values.sourceMode === "SCHEDULE_SINGLE" ||
		values.sourceMode === "SCHEDULE_MULTIPLE"
	) {
			if (values.sourceMode === "SCHEDULE_MULTIPLE") {
				const isRepeatOnValid = validateRepeatOnInRange(values);
				if (!isRepeatOnValid) {
					dispatch(
						addNotification({
						type: "error",
						key: "CONFLICT_RANGE_DAYS",
						duration: -1,
						context: NOTIFICATION_CONTEXT,
						}),
					);
				return false; // Exit early if repeatOn is invalid
			}
		}
		// Get timezone offset; Checks should be performed on UTC times
		// let offset = getTimezoneOffset();

		// Prepare start date of event for check
		const startDate = new Date(values.scheduleStartDate);
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		startDate.setHours(
			parseInt(values.scheduleStartHour),
			parseInt(values.scheduleStartMinute),
			0,
			0,
		);

		// If start date of event is smaller than today --> Event is in past
		if ((values.sourceMode === "SCHEDULE_SINGLE" && startDate < new Date()) || (values.sourceMode === "SCHEDULE_MULTIPLE" && startDate < new Date())) {
			dispatch(
				addNotification({
					type: "error",
					key: "CONFLICT_ALREADY_ENDED",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			check = false;
		}

		const endDate = new Date(values.scheduleEndDate);
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		endDate.setHours(parseInt(values.scheduleEndHour), parseInt(values.scheduleEndMinute), 0, 0);

		// if start date is higher than end date --> end date is before start date
		if (startDate > endDate) {
			dispatch(
				addNotification({
					type: "error",
					key: "CONFLICT_END_BEFORE_START",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			check = false;
		}

		// transform duration into milliseconds (needed for API request)
		const duration =
			parseInt(values.scheduleDurationHours) * 3600000 +
			parseInt(values.scheduleDurationMinutes) * 60000;

		// Check for conflicts with other already scheduled events
		const conflicts =
			values.sourceMode === "SCHEDULE_SINGLE"
				? await checkForConflicts(startDate, endDate, duration, values.location)
				: await checkForConflicts(
						startDate,
						endDate,
						duration,
						values.location,
						values.repeatOn,
				  );

		// If conflicts with already scheduled events detected --> need to change times/date
		if (conflicts && conflicts.length > 0) {
			dispatch(
				addNotification({
					type: "error",
					key: "CONFLICT_DETECTED",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			check = false;
			return conflicts;
		}
	}
	return check;
};

// Check for conflicts with already scheduled events
export const checkForConflicts = async (
	startDate: Date,
	endDate: Date,
	duration: number,
	device: string,
	repeatOn: string[] | undefined = undefined,
) => {
	const metadata = repeatOn
		? {
				start: startDate,
				device: device,
				duration: duration.toString(),
				end: endDate,
				rrule: `FREQ=WEEKLY;BYDAY=${repeatOn.join()};BYHOUR=${startDate.getUTCHours()};BYMINUTE=${startDate.getUTCMinutes()}`,
			}
		: {
				start: startDate,
				device: device,
				duration: duration.toString(),
				end: endDate,
			};
	let status = 0;

	const formData = new URLSearchParams();
	formData.append("metadata", JSON.stringify(metadata));

	return await axios
		.post<{ title: string, start: string, end: string }[]>("/admin-ng/event/new/conflicts", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then(response => {
			status = response.status;
			const conflicts = [];
			if (status === 409) {
				const conflictsResponse = response.data;

				for (const conflict of conflictsResponse) {
					conflicts.push({
						title: conflict.title,
						start: conflict.start,
						end: conflict.end,
					});
				}
			}
			return conflicts;
		})
		.catch(reason => {
			if (axios.isAxiosError<{ title: string, start: string, end: string }[]>(reason) && reason.response) {
				status = reason.response.status;
				const conflicts = [];
				if (status === 409) {
					const conflictsResponse = reason.response.data;

					for (const conflict of conflictsResponse) {
						conflicts.push({
							title: conflict.title,
							start: conflict.start,
							end: conflict.end,
						});
					}
				}
				return conflicts;
			}
		});
};

// check if there are any scheduling conflicts with other events
export const checkForSchedulingConflicts = (events: EditedEvents[]) => (dispatch: AppDispatch) => {
	const formData = new FormData();
	const update = [];
	const timezone = moment.tz.guess();
	for (const event of events) {
		update.push({
			events: [event.eventId],
			scheduling: {
				timezone: timezone,
				start: {
					hour: parseInt(event.changedStartTimeHour),
					minute: parseInt(event.changedStartTimeMinutes),
				},
				end: {
					hour: parseInt(event.changedEndTimeHour),
					minutes: parseInt(event.changedEndTimeMinutes),
				},
				weekday: event.changedWeekday,
				agentId: event.changedLocation,
			},
		});
	}

	formData.append("update", JSON.stringify(update));

	let data: Conflict[] = [];

	axios
		.post("/admin-ng/event/bulk/conflicts", formData)
		.then(res => console.info(res))
		.catch(error => {
			if (axios.isAxiosError<{ eventId: string, conflicts: { title: string, start: string, end: string }[] }[]>(error) && error.response) {
				if (error.response.status === 409) {
					dispatch(
						addNotification({
							type: "error",
							key: "CONFLICT_BULK_DETECTED",
							duration: -1,
							context: NOTIFICATION_CONTEXT,
						}),
					);
					data = error.response.data;
				}
				console.error(error);
			}
		});

	return data;
};

export const validateRepeatOnInRange = (values: {
	repeatOn: string[],           // e.g. ["MO", "TU"]
	scheduleStartDate: string,    // e.g. "2025-08-11"
	scheduleEndDate: string       // e.g. "2025-08-13"
}) => {
	if (!values.repeatOn || values.repeatOn.length === 0) {
		return true;
	}

	const start = new Date(values.scheduleStartDate);
	const end = new Date(values.scheduleEndDate);

	// Map day codes to numbers: Sunday=0, Monday=1, ..., Saturday=6
	const dayMap: Record<string, number> = {
		SU: 0,
		MO: 1,
		TU: 2,
		WE: 3,
		TH: 4,
		FR: 5,
		SA: 6,
	};
	const repeatDays = values.repeatOn.map(day => dayMap[day]);
	// Check if **at least one** date in the [start..end] range matches repeatOn days
	const current = new Date(start);
	while (current <= end) {
		if (repeatDays.includes(current.getDay())) {
			return true;  // Valid because this repeat day is in range
		}
		current.setDate(current.getDate() + 1); // next day
	}

	// If no repeat days fall within the range, return false
	return false;
};

const eventSlice = createSlice({
	name: "events",
	initialState,
	reducers: {
		setEventColumns(state, action: PayloadAction<
			EventState["columns"]
		>) {
			state.columns = action.payload;
		},
		setShowActions(state, action: PayloadAction<
			EventState["showActions"]
		>) {
			state.showActions = action.payload;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchEvents.pending, state => {
				state.status = "loading";
			})
			.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<{
				total: EventState["total"],
				count: EventState["count"],
				limit: EventState["limit"],
				offset: EventState["offset"],
				results: EventState["results"],
			}>) => {
				state.status = "succeeded";
				const events = action.payload;
				state.total = events.total;
				state.count = events.count;
				state.limit = events.limit;
				state.offset = events.offset;
				state.results = events.results;
			})
			.addCase(fetchEvents.rejected, (state, action) => {
				state.status = "failed";
				state.results = [];
				state.error = action.error;
			})
			.addCase(fetchEventMetadata.pending, state => {
				state.statusMetadata = "loading";
			})
			.addCase(fetchEventMetadata.fulfilled, (state, action: PayloadAction<{
				metadata: EventState["metadata"],
				extendedMetadata: EventState["extendedMetadata"],
			}>) => {
				state.statusMetadata = "succeeded";
				const eventMetadata = action.payload;
				state.metadata = eventMetadata.metadata;
				state.extendedMetadata = eventMetadata.extendedMetadata;
			})
			.addCase(fetchEventMetadata.rejected, (state, action) => {
				state.statusMetadata = "failed";
				state.extendedMetadata = [];
				state.errorMetadata = action.error;
			})
			.addCase(fetchScheduling.pending, state => {
				state.statusSchedulingInfo = "loading";
			})
			.addCase(fetchScheduling.fulfilled, (state, action: PayloadAction<{
				editedEvents: EventState["schedulingInfo"]["editedEvents"],
				responseSeriesOptions: EventState["schedulingInfo"]["seriesOptions"],
			}>) => {
				state.statusSchedulingInfo = "succeeded";
				const schedulingInfo = action.payload;
				state.schedulingInfo.editedEvents = schedulingInfo.editedEvents;
				state.schedulingInfo.seriesOptions = schedulingInfo.responseSeriesOptions;
			})
			.addCase(fetchScheduling.rejected, (state, action) => {
				state.statusSchedulingInfo = "failed";
				state.schedulingInfo.editedEvents = [];
				state.errorSchedulingInfo = action.error;
			})
			.addCase(fetchAssetUploadOptions.pending, state => {
				state.statusAssetUploadOptions = "loading";
			})
			.addCase(fetchAssetUploadOptions.fulfilled, (state, action: PayloadAction<{
				workflow: EventState["uploadAssetWorkflow"],
				newAssetUploadOptions: EventState["uploadAssetOptions"],
				newSourceUploadOptions: EventState["uploadSourceOptions"],
			} | undefined>) => {
				state.statusAssetUploadOptions = "succeeded";
				const assetUpload = action.payload;
				if (assetUpload) {
					state.uploadAssetWorkflow = assetUpload.workflow;
					state.uploadAssetOptions = assetUpload.newAssetUploadOptions;
					state.uploadSourceOptions = assetUpload.newSourceUploadOptions;
				}
			})
			.addCase(fetchAssetUploadOptions.rejected, (state, action) => {
				state.statusAssetUploadOptions = "failed";
				state.schedulingInfo.editedEvents = [];
				state.errorAssetUploadOptions = action.error;
			});
	},
});

export const {
	setEventColumns,
	setShowActions,
} = eventSlice.actions;

// Export the slice reducer as the default export
export default eventSlice.reducer;
