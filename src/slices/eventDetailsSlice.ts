import { PayloadAction, SerializedError, createSlice, unwrapResult } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { addNotification, removeNotificationWizardForm } from "./notificationSlice";
import {
	getHttpHeaders,
	transformMetadataCollection,
	transformMetadataForUpdate,
} from "../utils/resourceUtils";
import { NOTIFICATION_CONTEXT } from "../configs/modalConfig";
import { fetchWorkflowDef, Workflow as WorkflowDefinitions } from "./workflowSlice";
import {
	getExtendedMetadata,
	getSchedulingSource,
	getWorkflows,
	getStatistics,
} from "../selectors/eventDetailsSelectors";
import { getWorkflowDef } from "../selectors/workflowSelectors";
import {
	getAssetUploadOptions,
	getAssetUploadWorkflow,
} from "../selectors/eventSelectors";
import { calculateDuration } from "../utils/dateUtils";
import { fetchRecordings } from "./recordingSlice";
import { getRecordings } from "../selectors/recordingSelectors";
import { createAppAsyncThunk } from "../createAsyncThunkWithTypes";
import { DataResolution, Statistics, TimeMode, fetchStatistics, fetchStatisticsValueUpdate } from "./statisticsSlice";
import { enrichPublications } from "../thunks/assetsThunks";
import { TransformedAcl } from "./aclDetailsSlice";
import { MetadataCatalog, UploadOption } from "./eventSlice";
import { Event } from "./eventSlice";
import {
	AssetTabHierarchy,
	EventDetailsPage,
	WorkflowTabHierarchy,
} from "../components/events/partials/modals/EventDetails";
import { AppDispatch, AppThunk } from "../store";
import { Ace } from "./aclSlice";
import { setTobiraTabHierarchy, TobiraData } from "./seriesDetailsSlice";
import { handleTobiraError } from "./shared/tobiraErrors";
import camelcaseKeys from "camelcase-keys";

// Contains the navigation logic for the modal
type EventDetailsModal = {
	show: boolean,
	page: EventDetailsPage,
	event: Event | null,
	workflowTabHierarchy: WorkflowTabHierarchy,
	assetsTabHierarchy: AssetTabHierarchy,
	workflowId: string,
}

interface Assets {
	id: string,
	mimetype: string,
	tags: string[],
	url: string,
}

type AssetDetails = {
	id: string,
	type: string,
	mimetype: string,
	size: number,
	tags: string[],
	url: string,
	checksum: string | undefined,
	reference: string,
}

type CommentAuthor = {
	email: string | undefined,
	name: string,
	username: string,
}

type WorkflowEntry = {
			id: string,
		status: string,  // translation key
		submitted: string,  // date
		submitter: string,
		submitterEmail: string,
		submitterName: string,
		title: string
}

type Workflow = {
	scheduling: boolean,
	entries: WorkflowEntry[],
	// TODO: This looks like really bad practice. Rewrite.
	workflow: { // The type when looking at the list of workflows
		workflowId: string,
		description?: string,
		configuration?: { [key: string]: unknown }
	} | { // The type when looking at the details of a particular workflow
		configuration: { [key: string]: unknown }
		creator: string
		description: string
		executionTime: number
		status: string // translation string
		submittedAt: string // date string
		title: string
		wdid: string
		wiid: number
	}
}

export type WorkflowOperation = {
	configuration: { [key: string]: string },
	description: string,
	id: number,
	status: string,  // translation key, ending on INSTANTIATED, RUNNING, PAUSED, SUCCEEDED, FAILED, SKIPPED, RETRY
	title: string,
}

type Device = {
	id: string,
	inputs: { id: string, value: string }[],
	inputMethods: string[],
	name: string,
	// Fields we add to "device" from recordings but don't actually care about?
	// removable: boolean,
	// roomId: string,
	// status: string,
	// type: string,
	// updated: string,
	// url: string,
}

export type Publication = {
	enabled: boolean,
	icon?: string,
	id: string,
	label?: string,
	hide?: boolean,
	name: string, // translation key
	order: number,
	url: string,
	description?: string,
}

export type Comment = {
	author: CommentAuthor,
	creationDate: string,
	id: number,
	modificationDate: string,
	reason: string,  // translation key
	replies: CommentReply[],
	resolvedStatus: boolean,
	text: string,
}

export type CommentReply = {
	author: CommentAuthor,
	creationDate: string,
	id: number,
	modificationDate: string,
	text: string,
}

type EventDetailsState = {
	statusMetadata: "uninitialized" | "loading" | "succeeded" | "failed",
	errorMetadata: SerializedError | null,
	statusAssets: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssets: SerializedError | null,
	statusAssetAttachments: "uninitialized" | "loading" | "succeeded" | "failed",  // These were previously all just statusAssets
	errorAssetAttachments: SerializedError | null,
	statusAssetAttachmentDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetAttachmentDetails: SerializedError | null,
	statusAssetCatalogs: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetCatalogs: SerializedError | null,
	statusAssetCatalogDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetCatalogDetails: SerializedError | null,
	statusAssetMedia: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetMedia: SerializedError | null,
	statusAssetMediaDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetMediaDetails: SerializedError | null,
	statusAssetPublications: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetPublications: SerializedError | null,
	statusAssetPublicationDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorAssetPublicationDetails: SerializedError | null,
	statusPolicies: "uninitialized" | "loading" | "succeeded" | "failed",
	errorPolicies: SerializedError | null,
	statusComments: "uninitialized" | "loading" | "succeeded" | "failed",
	errorComments: SerializedError | null,
	statusPublications: "uninitialized" | "loading" | "succeeded" | "failed",
	errorPublications: SerializedError | null,
	statusSaveComment: "uninitialized" | "loading" | "succeeded" | "failed",
	errorSaveComment: SerializedError | null,
	statusSaveCommentReply: "uninitialized" | "loading" | "succeeded" | "failed",
	errorSaveCommentReply: SerializedError | null,
	statusUpdateComment: "uninitialized" | "loading" | "succeeded" | "failed",
	errorUpdateComment: SerializedError | null,
	statusScheduling: "uninitialized" | "loading" | "succeeded" | "failed",
	errorScheduling: SerializedError | null,
	statusSaveScheduling: "uninitialized" | "loading" | "succeeded" | "failed",
	errorSaveScheduling: SerializedError | null,
	statusCheckConflicts: "uninitialized" | "loading" | "succeeded" | "failed",
	errorCheckConflicts: SerializedError | null,
	statusWorkflows: "uninitialized" | "loading" | "succeeded" | "failed",
	errorWorkflows: SerializedError | null,
	statusWorkflowDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorWorkflowDetails: SerializedError | null,
	statusDoWorkflowAction: "uninitialized" | "loading" | "succeeded" | "failed",
	errorDoWorkflowAction: SerializedError | null,
	statusDeleteWorkflow: "uninitialized" | "loading" | "succeeded" | "failed",
	errorDeleteWorkflow: SerializedError | null,
	statusWorkflowOperations: "uninitialized" | "loading" | "succeeded" | "failed",
	errorWorkflowOperations: SerializedError | null,
	statusWorkflowOperationDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorWorkflowOperationDetails: SerializedError | null,
	statusWorkflowErrors: "uninitialized" | "loading" | "succeeded" | "failed",
	errorWorkflowErrors: SerializedError | null,
	statusWorkflowErrorDetails: "uninitialized" | "loading" | "succeeded" | "failed",
	errorWorkflowErrorDetails: SerializedError | null,
	statusStatistics: "uninitialized" | "loading" | "succeeded" | "failed",
	errorStatistics: SerializedError | null,
	statusStatisticsValue: "uninitialized" | "loading" | "succeeded" | "failed",
	errorStatisticsValue: SerializedError | null,
	statusTobiraData: "uninitialized" | "loading" | "succeeded" | "failed",
	errorTobiraData: SerializedError | null,
	eventId: string,
	modal: EventDetailsModal,
	metadata: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	assets: {
		attachments: number,
		catalogs: number,
		media: number,
		publications: number,
	},
	transactionsReadOnly: boolean,
	uploadSourceOptions: UploadOption[] | undefined,
	uploadAssetOptions: UploadOption[] | undefined,
	assetAttachments: Array< Assets & {
		type: string,
	}>,
	assetAttachmentDetails: AssetDetails,
	assetCatalogs: Array< Assets & {
		type: string,
	}>,
	assetCatalogDetails: AssetDetails,
	assetMedia: Array< Assets & {
		type: string,
		mediaFileName: string,
	}>,
	assetMediaDetails: AssetDetails & {
		duration: number,
		hasAudio: boolean,
		hasSubtitle: boolean,
		hasVideo: boolean,
		streams: {
			audio: {
				bitdepth: string,
				bitrate: number,
				channels: number,
				framecount: number,
				id: string,
				peakleveldb: string,
				rmsleveldb: string,
				rmspeakdb: "",
				samplingrate: number,
				type: string,
			}[],
			video: {
				bitrate: number,
				framecount: number,
				framerate: number,
				id: string,
				resolution: string,
				scanorder: string,
				scantype: string,
				type: string,
			}[],
		},
		video: {
			video: {
				previews: {
					uri: string,
				}[]
			},
			url: string,
		} | undefined,
	},
	assetPublications: Array< Assets & {
		channel: string,
	}>,
	assetPublicationDetails: AssetDetails & {
		channel: string,
	},
	policies: TransformedAcl[],
	policyTemplateId: number,
	comments: Comment[],
	commentReasons: { [key: string]: string },
	scheduling: {
		hasProperties: boolean,
	},
	schedulingSource: {
		start: {
			date: string,
			hour: number | undefined,
			minute: number | undefined,
		},
		duration: {
			hour: number | undefined,
			minute: number | undefined,
		},
		end: {
			date: string,
			hour: number | undefined,
			minute: number | undefined,
		},
		device: Device,
		agentId: string | undefined,
		agentConfiguration: { [key: string]: string },
	},
	hasSchedulingConflicts: boolean,
	schedulingConflicts: {
		title: string,
		start: string,
		end: string,
	}[],
	workflows: Workflow,
	workflowConfiguration: {
		workflowId: string,
		description?: string,
	},
	workflowDefinitions: WorkflowDefinitions[],
	baseWorkflow: {
		workflowId: string,
		description?: string,
		configuration?: {[key: string]: unknown}
	},
	workflowOperations: {
		entries: WorkflowOperation[]
	},
	workflowOperationDetails: {
		completed: string,  // date
		description: string,
		exceptionHandlerWorkflow: string,
		executionHost: string,
		failOnError: boolean,
		failedAttempts: number,
		job: number,
		maxAttempts: number,
		name: string,
		retryStrategy: string,
		started: string,  // date
		state: string,  // translation key
		timeInQueue: number,
	},
	workflowErrors: {
		entries: {
			description: string,
			id: number,
			severity: string,
			timestamp: string,  // date
			title: string,
		}[]
	},
	workflowErrorDetails: {
		description: string,
		details: {
			name: string,
			value: string,
		}[],
		id: number,
		jobId: number,
		rootJobId?: number,
		processingHost: string,
		serviceType: string,
		severity: string,
		technicalDetails: string,
		timestamp: string,  // date
		title: string,
	},
	publications: Publication[],
	statistics: Statistics[],
	hasStatisticsError: boolean,
	tobiraData: TobiraData,
}

// Initial state of event details in redux store
const initialState: EventDetailsState = {
	statusMetadata: "uninitialized",
	errorMetadata: null,
	statusAssets: "uninitialized",
	errorAssets: null,
	statusAssetAttachments: "uninitialized",
	errorAssetAttachments: null,
	statusAssetAttachmentDetails: "uninitialized",
	errorAssetAttachmentDetails: null,
	statusAssetCatalogs: "uninitialized",
	errorAssetCatalogs: null,
	statusAssetCatalogDetails: "uninitialized",
	errorAssetCatalogDetails: null,
	statusAssetMedia: "uninitialized",
	errorAssetMedia: null,
	statusAssetMediaDetails: "uninitialized",
	errorAssetMediaDetails: null,
	statusAssetPublications: "uninitialized",
	errorAssetPublications: null,
	statusAssetPublicationDetails: "uninitialized",
	errorAssetPublicationDetails: null,
	statusPolicies: "uninitialized",
	errorPolicies: null,
	statusComments: "uninitialized",
	errorComments: null,
	statusPublications: "uninitialized",
	errorPublications: null,
	statusSaveComment: "uninitialized",
	errorSaveComment: null,
	statusSaveCommentReply: "uninitialized",
	errorSaveCommentReply: null,
	statusUpdateComment: "uninitialized",
	errorUpdateComment: null,
	statusScheduling: "uninitialized",
	errorScheduling: null,
	statusSaveScheduling: "uninitialized",
	errorSaveScheduling: null,
	statusCheckConflicts: "uninitialized",
	errorCheckConflicts: null,
	statusWorkflows: "uninitialized",
	errorWorkflows: null,
	statusWorkflowDetails: "uninitialized",
	errorWorkflowDetails: null,
	statusDoWorkflowAction: "uninitialized",
	errorDoWorkflowAction: null,
	statusDeleteWorkflow: "uninitialized",
	errorDeleteWorkflow: null,
	statusWorkflowOperations: "uninitialized",
	errorWorkflowOperations: null,
	statusWorkflowOperationDetails: "uninitialized",
	errorWorkflowOperationDetails: null,
	statusWorkflowErrors: "uninitialized",
	errorWorkflowErrors: null,
	statusWorkflowErrorDetails: "uninitialized",
	errorWorkflowErrorDetails: null,
	statusStatistics: "uninitialized",
	errorStatistics: null,
	statusStatisticsValue: "uninitialized",
	errorStatisticsValue: null,
	statusTobiraData: "uninitialized",
	errorTobiraData: null,
	eventId: "",
	modal: {
		show: false,
		page: EventDetailsPage.Metadata,
		event: null,
		workflowTabHierarchy: "workflow-details",
		assetsTabHierarchy: "entry",
		workflowId: "",
	},
	metadata: {
		title: "",
		flavor: "",
		fields: [],
	},
	extendedMetadata: [],
	assets: {
		attachments: 0,
		catalogs: 0,
		media: 0,
		publications: 0,
	},
	transactionsReadOnly: false,
	uploadSourceOptions: [],
	uploadAssetOptions: [],
	assetAttachments: [],
	assetAttachmentDetails: {
		id: "",
		type: "",
		mimetype: "",
		size: 0,
		checksum: undefined,
		reference: "",
		tags: [],
		url: "",
	},
	assetCatalogs: [],
	assetCatalogDetails: {
		id: "",
		type: "",
		mimetype: "",
		size: 0,
		checksum: undefined,
		reference: "",
		tags: [],
		url: "",
	},
	assetMedia: [],
	assetMediaDetails: {
		id: "",
		type: "",
		mimetype: "",
		tags: [],
		duration: 0,
		size: 0,
		checksum: undefined,
		reference: "",
		hasAudio: false,
		hasSubtitle: false,
		hasVideo: false,
		url: "",
		streams: {
			audio: [],
			video: [],
		},
		video: undefined,
	},
	assetPublications: [],
	assetPublicationDetails: {
		id: "",
		type: "",
		mimetype: "",
		size: 0,
		channel: "",
		checksum: undefined,
		reference: "",
		tags: [],
		url: "",
	},
	policies: [],
	policyTemplateId: 0,
	comments: [],
	commentReasons: {},
	scheduling: {
		hasProperties: false,
	},
	schedulingSource: {
		start: {
			date: "",
			hour: undefined,
			minute: undefined,
		},
		duration: {
			hour: undefined,
			minute: undefined,
		},
		end: {
			date: "",
			hour: undefined,
			minute: undefined,
		},
		device: {
			id: "",
			name: "",
			inputs: [],
			inputMethods: [],
		},
		agentId: undefined,
		agentConfiguration: {},
	},
	hasSchedulingConflicts: false,
	schedulingConflicts: [],
	workflows: {
		scheduling: false,
		entries: [],
		workflow: {
			workflowId: "",
			description: "",
		},
	},
	workflowConfiguration: {
		workflowId: "",
		description: "",
	},
	workflowDefinitions: [],
	baseWorkflow: {
		workflowId: "",
	},
	workflowOperations: {
		entries: [],
	},
	workflowOperationDetails: {
		completed: "",
		description: "",
		exceptionHandlerWorkflow: "",
		executionHost: "",
		failOnError: false,
		failedAttempts: 0,
		job: 0,
		maxAttempts: 0,
		name: "",
		retryStrategy: "",
		started: "",
		state: "",
		timeInQueue: 0,
	},
	workflowErrors: {
		entries: [],
	},
	workflowErrorDetails: {
		description: "",
		details: [],
		id: 0,
		jobId: 0,
		processingHost: "",
		serviceType: "",
		severity: "",
		technicalDetails: "",
		timestamp: "",
		title: "",
	},
	publications: [],
	statistics: [],
	hasStatisticsError: false,
	tobiraData: {
		baseURL: "",
		id: "",
		hostPages: [],
	},
};


export const fetchMetadata = createAppAsyncThunk("eventDetails/fetchMetadata", async (eventId: Event["id"]) => {
	const metadataRequest = await axios.get<(MetadataCatalog & { locked?: string})[]>(`/admin-ng/event/${eventId}/metadata.json`);
	const metadataResponse = metadataRequest.data;

	const mainCatalog = "dublincore/episode";
	let metadata: MetadataCatalog = {
		title: "",
		flavor: "",
		fields: [],
	};
	const extendedMetadata = [];

	for (const catalog of metadataResponse) {
		let transformedCatalog = { ...catalog };

		if (catalog.locked !== undefined) {
			const fields = [];

			for (const field of catalog.fields) {
				const adaptedField = {
					...field,
					locked: catalog.locked,
					readOnly: true,
				};

				fields.push(adaptedField);
			}
			transformedCatalog = {
				...catalog,
				fields: fields,
			};
		}
		if (catalog.flavor === mainCatalog) {
			metadata = transformMetadataCollection({ ...transformedCatalog });
		} else {
			extendedMetadata.push(
				transformMetadataCollection({ ...transformedCatalog }),
			);
		}
	}

	return { metadata, extendedMetadata };
});

export const fetchAssets = createAppAsyncThunk("eventDetails/fetchAssets", async (eventId: Event["id"], { dispatch }) => {
	const assetsRequest = await axios.get<EventDetailsState["assets"]>(
		`/admin-ng/event/${eventId}/asset/assets.json`,
	);
	const assets = assetsRequest.data;

	let transactionsReadOnly = true;
	const fetchTransactionResult = await dispatch(fetchHasActiveTransactions(eventId))
		.then(unwrapResult);
	if (fetchTransactionResult.active !== undefined) {
		transactionsReadOnly = fetchTransactionResult.active;
	}

	const resourceOptionsListRequest = await axios.get<{ [key: string]: string}>(
		"/admin-ng/resources/eventUploadAssetOptions.json",
	);
	const resourceOptionsListResponse = resourceOptionsListRequest.data;

	const optionsData = formatUploadAssetOptions(resourceOptionsListResponse);

	if (transactionsReadOnly) {
		dispatch(
			addNotification({
				type: "warning",
				key: "ACTIVE_TRANSACTION",
				duration: -1,
				context: NOTIFICATION_CONTEXT,
			}),
		);
	}

	return {
		assets,
		transactionsReadOnly,
		uploadAssetOptions: optionsData.assetOptions,
		uploadSourceOptions: optionsData.sourceOptions,
	};
});

const formatUploadAssetOptions = (optionsData: { [key: string]: string }) => {
	const optionPrefixSource = "EVENTS.EVENTS.NEW.SOURCE.UPLOAD";
	const optionPrefixAsset = "EVENTS.EVENTS.NEW.UPLOAD_ASSET.OPTION";
	const workflowPrefix = "EVENTS.EVENTS.NEW.UPLOAD_ASSET.WORKFLOWDEFID";

	const optionsResult: {
		assetOptions: UploadOption[],
		sourceOptions: UploadOption[],
		workflow?: string,
	} = {
		assetOptions: [],
		sourceOptions: [],
		workflow: "",
	};

	const uploadAssets: UploadOption[] = [];
	const uploadSource: UploadOption[] = [];

	for (const [key, value] of Object.entries(optionsData)) {
		if (key.charAt(0) !== "$") {
			if (
				key.indexOf(optionPrefixAsset) >= 0 ||
				key.indexOf(optionPrefixSource) >= 0
			) {
				// parse upload asset options
				// TODO: Handle JSON parsing errors
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const options: UploadOption = JSON.parse(value);
				if (!options["title"]) {
					options["title"] = key;
				}
				if ((options["showForExistingEvents"] !== undefined && (key.indexOf(optionPrefixAsset) >= 0 && options["showForExistingEvents"]))
					|| (options["showForExistingEvents"] === undefined && (key.indexOf(optionPrefixAsset) >= 0))) {
						uploadAssets.push({ ...options });
				}
				if ((options["showForExistingEvents"] !== undefined && (key.indexOf(optionPrefixSource) >= 0 && options["showForExistingEvents"]))
					|| (options["showForExistingEvents"] === undefined && (key.indexOf(optionPrefixSource) >= 0))) {
						uploadSource.push({ ...options });
				}
			} else if (key.indexOf(workflowPrefix) >= 0) {
				// parse upload workflow definition id
				optionsResult.workflow = value;
			}
		}
	}
	optionsResult.assetOptions = uploadAssets;
	optionsResult.sourceOptions = uploadSource;

	return optionsResult;
};

export const fetchAssetAttachments = createAppAsyncThunk("eventDetails/fetchAssetAttachments", async (eventId: Event["id"]) => {
	const params = new URLSearchParams();
	params.append("id1", "attachment");

	const attachmentsRequest = await axios.get<EventDetailsState["assetAttachments"]>(
		`/admin-ng/event/${eventId}/asset/attachment/attachments.json`,
		{ params },
	);
	return attachmentsRequest.data;
});

export const fetchAssetAttachmentDetails = createAppAsyncThunk("eventDetails/fetchAssetAttachmentDetails", async (params: {
	eventId: Event["id"],
	attachmentId: EventDetailsState["assetAttachments"][0]["id"]
}) => {
	const { eventId, attachmentId } = params;
	const searchParams = new URLSearchParams();
	searchParams.append("id1", "attachment");

	const attachmentDetailsRequest = await axios.get<EventDetailsState["assetAttachmentDetails"]>(
		`/admin-ng/event/${eventId}/asset/attachment/${attachmentId}.json`,
		{ params },
	);
	return attachmentDetailsRequest.data;
});

export const fetchAssetCatalogs = createAppAsyncThunk("eventDetails/fetchAssetCatalogs", async (eventId: Event["id"]) => {
	const params = new URLSearchParams();
	params.append("id1", "catalog");

	const catalogsRequest = await axios.get<EventDetailsState["assetCatalogs"]>(
		`/admin-ng/event/${eventId}/asset/catalog/catalogs.json`,
		{ params },
	);
	return catalogsRequest.data;
});

export const fetchAssetCatalogDetails = createAppAsyncThunk("eventDetails/fetchAssetCatalogDetails", async (params: {
	eventId: Event["id"],
	catalogId: EventDetailsState["assetCatalogs"][0]["id"]
}) => {
	const { eventId, catalogId } = params;
	const searchParams = new URLSearchParams();
	searchParams.append("id1", "catalog");

	const catalogDetailsRequest = await axios.get<EventDetailsState["assetCatalogDetails"]>(
		`/admin-ng/event/${eventId}/asset/catalog/${catalogId}.json`,
		{ params },
	);
	return catalogDetailsRequest.data;
});

export const fetchAssetMedia = createAppAsyncThunk("eventDetails/fetchAssetMedia", async (eventId: Event["id"]) => {
	type FetchAssetMedia = {
		mimetype: string,
		id: string,
		type: string,
		url: string,
		tags: string[],
	};
	const params = new URLSearchParams();
	params.append("id1", "media");

	const mediaRequest = await axios.get<FetchAssetMedia[]>(
		`/admin-ng/event/${eventId}/asset/media/media.json`,
		{ params },
	);
	const mediaResponse = mediaRequest.data;

	const media: EventDetailsState["assetMedia"] = [];

	// for every media file item we define the filename
	for (let i = 0; i < mediaResponse.length; i++) {
		const url = mediaResponse[i].url;
		const mediaFileName = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
		const item = {
			...mediaResponse[i],
			url,
			mediaFileName,
		};
		media.push(item);
	}

	return media;
});

export const fetchAssetMediaDetails = createAppAsyncThunk("eventDetails/fetchAssetMediaDetails", async (params: {
	eventId: Event["id"],
	mediaId: EventDetailsState["assetMedia"][0]["id"]
}) => {
	const { eventId, mediaId } = params;
	const searchParams = new URLSearchParams();
	searchParams.append("id1", "media");

	const mediaDetailsRequest = await axios.get<Omit<EventDetailsState["assetMediaDetails"], "video">>(
		`/admin-ng/event/${eventId}/asset/media/${mediaId}.json`,
		{ params },
	);
	const mediaDetailsResponse = mediaDetailsRequest.data;

	let mediaDetails: EventDetailsState["assetMediaDetails"];

	if (typeof mediaDetailsResponse === "string") {
		// TODO: Handle JSON parsing errors
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		mediaDetails = JSON.parse(mediaDetailsResponse);
	} else {
		mediaDetails = {
			...mediaDetailsResponse,
			video: undefined,
		};
	}

	mediaDetails.video = {
		video: {
			previews: [{ uri: mediaDetails.url }],
		},
		url: mediaDetails.url.split("?")[0],
	};

	return mediaDetails;
});

export const fetchAssetPublications = createAppAsyncThunk("eventDetails/fetchAssetPublications", async (eventId: Event["id"]) => {
	const params = new URLSearchParams();
	params.append("id1", "publication");

	const publicationsRequest = await axios.get<EventDetailsState["assetPublications"]>(
		`/admin-ng/event/${eventId}/asset/publication/publications.json`,
		{ params },
	);
	return publicationsRequest.data;
});

export const fetchAssetPublicationDetails = createAppAsyncThunk("eventDetails/fetchAssetPublicationDetails", async (params: {
	eventId: Event["id"],
	publicationId: EventDetailsState["publications"][0]["id"]
}) => {
	const { eventId, publicationId } = params;
	const searchParams = new URLSearchParams();
	searchParams.append("id1", "publication");

	const publicationDetailsRequest = await axios.get<EventDetailsState["assetPublicationDetails"]>(
		`/admin-ng/event/${eventId}/asset/publication/${publicationId}.json`,
		{ params },
	);
	return publicationDetailsRequest.data;
});

export const fetchAccessPolicies = createAppAsyncThunk("eventDetails/fetchAccessPolicies", async (id: Event["id"]) => {
	type FetchAccessPolicies = {
		episode_access: {
			acl: TransformedAcl[],
			current_acl: number,
		}
	};
	const policyData = await axios.get<FetchAccessPolicies>(
		`/admin-ng/event/${id}/access.json`,
	);
	const accessPolicies = policyData.data;

	let policies: TransformedAcl[] = [];
	let currentAclTemplateId = 0;

	if (accessPolicies !== undefined && accessPolicies.episode_access) {
		policies = accessPolicies.episode_access.acl;
		currentAclTemplateId = accessPolicies.episode_access.current_acl;
	}

	return { policies, currentAclTemplateId };
});

export const fetchComments = createAppAsyncThunk("eventDetails/fetchComments", async (eventId: Event["id"]) => {
	const commentsData = await axios.get<Comment[]>(`/admin-ng/event/${eventId}/comments`);
	const comments = commentsData.data;

	const commentReasonsData = await axios.get<{ eventCommentReasons: { [key: string]: string }}>(
		"/admin-ng/resources/components.json",
	);
	const commentReasons = (commentReasonsData.data).eventCommentReasons;

	return { comments, commentReasons };
});

export const fetchEventPublications = createAppAsyncThunk("eventDetails/fetchEventPublications", async (eventId: Event["id"], { dispatch }) => {
	type FetchEventPublications = {
		publications: {
			id: string,
			name: string,
			url: string,
		}[],
		"start-date": string,
		"end-date": string,
	};
	const data = await axios.get<FetchEventPublications>(`/admin-ng/event/${eventId}/publications.json`);

	const publications = data.data;

	return await dispatch(enrichPublications(publications)).unwrap();
});

// fetch Tobira data of certain series from server
export const fetchEventDetailsTobira = createAppAsyncThunk("eventDetails/fetchEventDetailsTobira", async (
	id: string,
	{ dispatch },
) => {
	const res = await axios.get<EventDetailsState["tobiraData"]>(`/admin-ng/event/${id}/tobira/pages`)
		.catch((error: AxiosError) => handleTobiraError(error, dispatch));

	if (!res) {
		throw new Error();
	}

	const data = res.data;
	return data;
});

export const saveComment = createAppAsyncThunk("eventDetails/saveComment", async (params: {
	eventId: Event["id"],
	commentText: Comment["text"],
	commentReason: Comment["reason"]
}) => {
	const { eventId, commentText, commentReason } = params;
	const headers = getHttpHeaders();

	const data = new URLSearchParams();
	data.append("text", commentText);
	data.append("reason", commentReason);

	const commentSaved = await axios.post(
		`/admin-ng/event/${eventId}/comment`,
		data.toString(),
		headers,
	);
	await commentSaved.data;

	return true;
});

export const saveCommentReply = createAppAsyncThunk("eventDetails/saveCommentReply", async (params: {
	eventId: Event["id"],
	commentId: Comment["id"],
	replyText: CommentReply["text"],
	commentResolved: Comment["resolvedStatus"]
}) => {
	const { eventId, commentId, replyText, commentResolved } = params;
	const headers = getHttpHeaders();

	const data = new URLSearchParams();
	data.append("text", replyText);
	data.append("resolved", String(commentResolved));

	const commentReply = await axios.post(
		`/admin-ng/event/${eventId}/comment/${commentId}/reply`,
		data.toString(),
		headers,
	);

	await commentReply.data;

	return true;
});

export const fetchSchedulingInfo = createAppAsyncThunk("eventDetails/fetchSchedulingInfo", async (eventId: Event["id"], { dispatch, getState }) => {
		type FetchSchedulingInfo = {
			agentId: string,
			agentConfiguration: {
				"capture.device.names": string,
			},
			presenters: string[],
			start: string,
			end: string,
		};
		// get data from API about event scheduling
		const schedulingRequest = await axios.get<FetchSchedulingInfo>(
			`/admin-ng/event/${eventId}/scheduling.json`,
		);
		const schedulingResponse = schedulingRequest.data;

		// get data from API about capture agents
		await dispatch(fetchRecordings("inputs"));

		const state = getState();
		const captureAgents = getRecordings(state);

		const startDate = new Date(schedulingResponse.start);
		const endDate = new Date(schedulingResponse.end);
		const { durationHours, durationMinutes } = calculateDuration(
			startDate,
			endDate,
		);

		let device: Device = {
			id: "",
			name: "",
			inputs: [],
			inputMethods: [],
		};

		const agent = captureAgents.find(
			agent => agent.id === schedulingResponse.agentId,
		);
		if (agent) {
			const inputMethods = [];

			if (
				schedulingResponse.agentConfiguration["capture.device.names"] !==
				undefined
			) {
				const inputs = schedulingResponse.agentConfiguration[
					"capture.device.names"
				].split(",");
				for (const input of inputs) {
					inputMethods.push(input);
				}
			}
			device = {
				...agent,
				inputMethods: inputMethods,
			};
		}

		const source = {
			...schedulingResponse,
			start: {
				date: schedulingResponse.start,
				hour: startDate.getHours(),
				minute: startDate.getMinutes(),
			},
			end: {
				date: schedulingResponse.end,
				hour: endDate.getHours(),
				minute: endDate.getMinutes(),
			},
			duration: {
				hour: durationHours,
				minute: durationMinutes,
			},
			presenters: schedulingResponse.presenters.join(", "),
			device: { ...device },
		};

		return source;
});

export type SchedulingInfo = {
	captureAgent: string,
	inputs: string[],
	scheduleDurationHours: string,
	scheduleDurationMinutes: string,
	scheduleEndDate: string,
	scheduleEndHour: string,
	scheduleEndMinute: string,
	scheduleStartDate: string,
	scheduleStartHour: string,
	scheduleStartMinute: string,
}

export const saveSchedulingInfo = createAppAsyncThunk("eventDetails/saveSchedulingInfo", async (params: {
	eventId: Event["id"],
	values: SchedulingInfo,
	startDate: Date,
	endDate: Date
}, { dispatch, getState }) => {
	const { eventId, values, startDate, endDate } = params;

	const state = getState();
	const oldSource = getSchedulingSource(state);
	const captureAgents = getRecordings(state);
	let device: Device = {
		id: "",
		name: "",
		inputs: [],
		inputMethods: [],
	};

	const agent = captureAgents.find(agent => agent.id === values.captureAgent);
	if (agent) {
		device = {
			...agent,
			inputMethods: values.inputs,
		};
	}

	const source = {
		...oldSource,
		agentId: device.id,
		start: {
			date: startDate.toISOString(),
			hour: parseInt(values.scheduleStartHour),
			minute: parseInt(values.scheduleStartMinute),
		},
		end: {
			date: endDate.toISOString(),
			hour: parseInt(values.scheduleEndHour),
			minute: parseInt(values.scheduleEndMinute),
		},
		duration: {
			hour: parseInt(values.scheduleDurationHours),
			minute: parseInt(values.scheduleDurationMinutes),
		},
		device: { ...device },
		agentConfiguration: {
			...oldSource.agentConfiguration,
			"capture.device.names": values.inputs.join(","),
			"event.location": device.id,
		},
	};

	const start = startDate.toISOString();
	const end = endDate.toISOString();

	const headers = getHttpHeaders();
	const data = new URLSearchParams();
	data.append(
		"scheduling",
		JSON.stringify({
			agentId: source.agentId,
			start: start,
			end: end,
			agentConfiguration: source.agentConfiguration,
		}),
	);

	// save new scheduling information
	await axios
		.put(`/admin-ng/event/${eventId}/scheduling`, data, headers)
		.then(() => {
			dispatch(removeNotificationWizardForm());
			dispatch(fetchSchedulingInfo(eventId));
		})
		.catch(response => {
			dispatch(
				addNotification({
					type: "error",
					key: "EVENTS_NOT_UPDATED",
					context: NOTIFICATION_CONTEXT,
				}),
			);
			throw (response);
		});

	return source;
});

// TODO: This does not return a boolean anymore. Fix this in usage, make users
// get their info from the state
export const checkConflicts = createAppAsyncThunk("eventDetails/checkConflicts", async (params: {
	eventId: Event["id"],
	startDate: Date,
	endDate: Date,
	deviceId: EventDetailsState["schedulingSource"]["device"]["id"]
}, { dispatch }) => {
const { eventId, startDate, endDate, deviceId } = params;
const conflicts: EventDetailsState["schedulingConflicts"] = [];
let hasSchedulingConflicts = false;

const now = new Date();
if (endDate < now) {
	dispatch(removeNotificationWizardForm());
	dispatch(
		addNotification({
			type: "error",
			key: "CONFLICT_IN_THE_PAST",
			duration: -1,
			context: NOTIFICATION_CONTEXT,
		}),
	);
	hasSchedulingConflicts = true;
} else {
	dispatch(removeNotificationWizardForm());
	const headers = getHttpHeaders();

	const conflictTimeFrame = {
		id: eventId,
		start: startDate.toISOString(),
		duration: endDate.getTime() - startDate.getTime(),
		device: deviceId,
		end: endDate.toISOString(),
	};

	const data = new URLSearchParams();
	data.append("metadata", JSON.stringify(conflictTimeFrame));

	await axios
		.post<EventDetailsState["schedulingConflicts"]>("/admin-ng/event/new/conflicts", data, headers)
		.then(response => {
			const responseStatus = response.status;
			if (responseStatus === 409) {
				// conflict detected, add notification and get conflict specifics
				dispatch(
					addNotification({
						type: "error",
						key: "CONFLICT_DETECTED",
						duration: -1,
						context: NOTIFICATION_CONTEXT,
					}),
				);
				const conflictsResponse = response.data;

				for (const conflict of conflictsResponse) {
					conflicts.push({
						title: conflict.title,
						start: conflict.start,
						end: conflict.end,
					});
				}

				hasSchedulingConflicts = true;
			} else if (responseStatus === 204) {
				// no conflicts detected
				hasSchedulingConflicts = false;
			} else {
				hasSchedulingConflicts = true;
			}
		})
		.catch(error => {
			if (axios.isAxiosError<{ title: string, start: string, end: string }[]>(error) && error.response) {
				const responseStatus = error.response.status;
				if (responseStatus === 409) {
					// conflict detected, add notification and get conflict specifics
					dispatch(
						addNotification({
							type: "error",
							key: "CONFLICT_DETECTED",
							duration: -1,
							context: NOTIFICATION_CONTEXT,
						}),
					);
					const conflictsResponse = error.response.data;

					for (const conflict of conflictsResponse) {
						conflicts.push({
							title: conflict.title,
							start: conflict.start,
							end: conflict.end,
						});
					}

					hasSchedulingConflicts = true;
				} else {
					hasSchedulingConflicts = true;
				}
			} else {
				console.error("Unexpected error", error);
				hasSchedulingConflicts = true;
			}
		});
	}

	return { conflicts, hasSchedulingConflicts };
});

export const fetchWorkflows = createAppAsyncThunk("eventDetails/fetchWorkflows", async (eventId: Event["id"], { dispatch, getState }) => {
	type FetchWorkflows = {
		results: WorkflowEntry[]
	} | {
		configuration: {
			straightToPublishing: string
		},
		workflowId: string
	}
	const data = await axios.get<FetchWorkflows>(`/admin-ng/event/${eventId}/workflows.json`);
	const workflowsData = data.data;
	let workflows: Workflow;

	if ("results" in workflowsData) {
		workflows = {
			entries: workflowsData.results,
			scheduling: false,
			workflow: {
				workflowId: "",
				description: undefined,
				configuration: undefined,
			},
		};

	} else {
		workflows = {
			workflow: {
				workflowId: workflowsData.workflowId,
				description: undefined,
				configuration: workflowsData.configuration,
			},
			scheduling: true,
			entries: [],
		};

		await dispatch(fetchWorkflowDef("event-details"));

		const state = getState();

		const workflowDefinitions = getWorkflowDef(state);

		dispatch(setEventWorkflowDefinitions({ workflows, workflowDefinitions }));
	}

	return workflows;
});

export const fetchWorkflowDetails = createAppAsyncThunk("eventDetails/fetchWorkflowDetails", async (params: {
	eventId: Event["id"],
	workflowId: string
}) => {
	const { eventId, workflowId } = params;
	const data = await axios.get<EventDetailsState["workflows"]["workflow"]>(
		`/admin-ng/event/${eventId}/workflows/${workflowId}.json`,
	);
	return data.data;
});

export const performWorkflowAction = createAppAsyncThunk("eventDetails/performWorkflowAction", async (params: {
	eventId: Event["id"],
	workflowId: string,
	action: string,
	close?: () => void,
}, { dispatch }) => {
	const { eventId, workflowId, action, close } = params;
	const headers = {
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	};

	const data = {
		action: action,
		id: eventId,
		wfId: workflowId,
	};

	await axios
		.put(
			`/admin-ng/event/${eventId}/workflows/${workflowId}/action/${action}`,
			data,
			headers,
		)
		.then(() => {
			dispatch(
				addNotification({
					type: "success",
					key: "EVENTS_PROCESSING_ACTION_" + action,
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			if (close) {
				close();
			}
		})
		.catch(response => {
			dispatch(
				addNotification({
					type: "error",
					key: "EVENTS_PROCESSING_ACTION_NOT_" + action,
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			throw (response);
		});
});

export const deleteWorkflow = createAppAsyncThunk("eventDetails/deleteWorkflow", async (params: {
	eventId: Event["id"],
	workflowId: string
}, { dispatch, getState }) => {
	const { eventId, workflowId } = params;

	const workflowEntries = await axios
		.delete(`/admin-ng/event/${eventId}/workflows/${workflowId}`)
		.then(() => {
			dispatch(
				addNotification({
					type: "success",
					key: "EVENTS_PROCESSING_DELETE_WORKFLOW",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);

			const state = getState();
			const workflows = getWorkflows(state);

			if (workflows.entries) {
				return workflows.entries.filter(wf => wf.id !== workflowId);
			} else {
				return workflows.entries;
			}
		})
		.catch(response => {
			dispatch(
				addNotification({
					type: "error",
					key: "EVENTS_PROCESSING_DELETE_WORKFLOW_FAILED",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			throw (response);
		});

	return workflowEntries;
});

export const fetchWorkflowOperations = createAppAsyncThunk("eventDetails/fetchWorkflowOperations", async (params: {
	eventId: Event["id"],
	workflowId: string
}) => {
	const { eventId, workflowId } = params;
	const data = await axios.get<EventDetailsState["workflowOperations"]["entries"]>(
		`/admin-ng/event/${eventId}/workflows/${workflowId}/operations.json`,
	);
	const workflowOperationsData = data.data;
	return { entries: workflowOperationsData };
});

/**
 * Open event details modal externally
 *
 * @param page modal page
 * @param event event to show
 * @param workflowTab workflow tab
 * @param assetsTab assets tab
 * @param workflowId workflow id required for workflow sub tabs
 */
export const openModal = (
	page: EventDetailsPage,
	event: Event,
	workflowTab: WorkflowTabHierarchy = "workflow-details",
	assetsTab: AssetTabHierarchy = "entry",
	workflowId: string = "",
) => (dispatch: AppDispatch) => {
	dispatch(setModalEvent(event));
	dispatch(setModalWorkflowId(workflowId));
	dispatch(openModalTab(page, workflowTab, assetsTab));
	dispatch(setShowModal(true));
};

export const openModalTab = (
	page: EventDetailsPage,
	workflowTab: WorkflowTabHierarchy,
	assetsTab: AssetTabHierarchy,
) => (dispatch: AppDispatch) => {
	dispatch(setModalPage(page));
	dispatch(setTobiraTabHierarchy("main"));
	dispatch(setModalWorkflowTabHierarchy(workflowTab));
	dispatch(setModalAssetsTabHierarchy(assetsTab));
};

export const fetchWorkflowOperationDetails = createAppAsyncThunk("eventDetails/fetchWorkflowOperationDetails", async (params: {
	eventId: Event["id"],
	workflowId: string,
	operationId?: number
}) => {
	const { eventId, workflowId, operationId } = params;
	const data = await axios.get<EventDetailsState["workflowOperationDetails"]>(
		`/admin-ng/event/${eventId}/workflows/${workflowId}/operations/${operationId}`,
	);
	return data.data;
});

export const fetchWorkflowErrors = createAppAsyncThunk("eventDetails/fetchWorkflowErrors", async (params: {
	eventId: Event["id"],
	workflowId: string
}) => {
	const { eventId, workflowId } = params;
	const data = await axios.get<EventDetailsState["workflowErrors"]["entries"]>(
		`/admin-ng/event/${eventId}/workflows/${workflowId}/errors.json`,
	);
	const workflowErrorsData = data.data;
	return { entries: workflowErrorsData };
});

export const fetchWorkflowErrorDetails = createAppAsyncThunk("eventDetails/fetchWorkflowErrorDetails", async (params: {
	eventId: Event["id"],
	workflowId: number,
	errorId?: number
}) => {
	const { eventId, workflowId, errorId } = params;
	const data = await axios.get<EventDetailsState["workflowErrorDetails"]>(
		`/admin-ng/event/${eventId}/workflows/${workflowId}/errors/${errorId}.json`,
	);
	return data.data;
});

// TODO: Fix this after the modernization of statisticsThunks happened
export const fetchEventStatistics = createAppAsyncThunk("eventDetails/fetchEventStatistics", async (eventId: Event["id"], { getState }) => {
	// get prior statistics
	const state = getState();
	const statistics = getStatistics(state);

	return await (
		fetchStatistics(
			eventId,
			"episode",
			statistics,
		)
	);
});

// TODO: Fix this after the modernization of statisticsThunks happened
export const fetchEventStatisticsValueUpdate = createAppAsyncThunk("eventDetails/fetchEventStatisticsValueUpdate", async (params: {
	id: Event["id"],
	providerId: string,
	from: string | Date,
	to: string | Date,
	dataResolution: DataResolution,
	timeMode: TimeMode
}, { getState }) => {
	const { id, providerId, from, to, dataResolution, timeMode } = params;
	// get prior statistics
	const state = getState();
	const statistics = getStatistics(state);

	return await (
		fetchStatisticsValueUpdate(
			id,
			"episode",
			providerId,
			from,
			to,
			dataResolution,
			timeMode,
			statistics,
		)
	);
});

export const updateMetadata = createAppAsyncThunk("eventDetails/updateMetadata", async (params: {
	id: Event["id"],
	values: { [key: string]: MetadataCatalog["fields"][0]["value"] }
	catalog: MetadataCatalog
}, { dispatch }) => {
	const { id, values, catalog } = params;

	const { fields, data, headers } = transformMetadataForUpdate(
		catalog,
		values,
	);

	await axios.put(`/admin-ng/event/${id}/metadata`, data, headers);

	// updated metadata in event details redux store
	const eventMetadata = {
		flavor: catalog.flavor,
		title: catalog.title,
		fields: fields,
	};
	dispatch(setEventMetadata(eventMetadata));
});

export const updateExtendedMetadata = createAppAsyncThunk("eventDetails/updateExtendedMetadata", async (params: {
	id: Event["id"],
	values: { [key: string]: MetadataCatalog["fields"][0]["value"] }
	catalog: MetadataCatalog
}, { dispatch, getState }) => {
	const { id, values, catalog } = params;

	const { fields, data, headers } = transformMetadataForUpdate(
		catalog,
		values,
	);

	await axios.put(`/admin-ng/event/${id}/metadata`, data, headers);

	// updated extended metadata in event details redux store
	const eventMetadata = {
		...catalog,
		fields: fields,
	};

	const oldExtendedMetadata = getExtendedMetadata(getState());
	const newExtendedMetadata = [];

	for (const catalog of oldExtendedMetadata) {
		if (
			catalog.flavor === eventMetadata.flavor &&
			catalog.title === eventMetadata.title
		) {
			newExtendedMetadata.push(eventMetadata);
		} else {
			newExtendedMetadata.push(catalog);
		}
	}

	dispatch(setExtendedEventMetadata(newExtendedMetadata));
});

export const fetchHasActiveTransactions = createAppAsyncThunk("eventDetails/fetchHasActiveTransactions", async (eventId: Event["id"]) => {
	const transactionsData = await axios.get<{ active: boolean }>(
		`/admin-ng/event/${eventId}/hasActiveTransaction`,
	);
	const hasActiveTransactions = transactionsData.data;
	return hasActiveTransactions;
});

export const updateAssets = (params: {
	values: { [key: string]: File },
	eventId: Event["id"]
}): AppThunk => (dispatch, getState) => {
	const { values, eventId } = params;
	// get asset upload options from redux store
	const state = getState();
	const uploadAssetOptions = getAssetUploadOptions(state);
	const uploadAssetWorkflow = getAssetUploadWorkflow(state);

	const formData = new FormData();

	const assets: {
		options: UploadOption[],
	} = {
		options: [],
	};

	let assetFlavors = "";

	uploadAssetOptions.forEach(option => {
		if (values[option.id]) {
			formData.append(option.id + ".0", values[option.id]);
			assets.options = assets.options.concat(option);
			const uploadAssetFlavor = [option.flavorType, option.flavorSubType].join("/");
			if (assetFlavors.length > 0) {
				assetFlavors = [assetFlavors, uploadAssetFlavor].join(",");
			} else {
				assetFlavors = uploadAssetFlavor;
			}
		}
	});

	const uploadAssetWorkflowConfiguration: {
		"downloadSourceflavorsExist": string,
		"download-source-flavors": string,
	} = {
		"downloadSourceflavorsExist": String(assetFlavors.length > 0),
		"download-source-flavors": assetFlavors,
	};

	const processing: {
		workflow: string | undefined,
		configuration: typeof uploadAssetWorkflowConfiguration,
	} = {
		workflow: uploadAssetWorkflow,
		configuration: uploadAssetWorkflowConfiguration,
	};

	formData.append(
		"metadata",
		JSON.stringify({
			assets: assets,
			processing: processing,
		}),
	);

	axios
		.post(`/admin-ng/event/${eventId}/assets`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then(response => {
			console.info(response);
			dispatch(
				addNotification({
					type: "success",
					key: "EVENTS_UPDATED",
					context: NOTIFICATION_CONTEXT,
				}),
			);
		})
		.catch(response => {
			console.error(response);
			dispatch(
				addNotification({
					type: "error",
					key: "EVENTS_NOT_UPDATED",
					context: NOTIFICATION_CONTEXT,
				}),
			);
		});
};

export const saveAccessPolicies = createAppAsyncThunk("eventDetails/saveAccessPolicies", async (
	params: {
		id: Event["id"],
		policies: { acl: { ace: Ace[] }},
	}, { dispatch }) => {
	const { id, policies } = params;
	const headers = getHttpHeaders();

	const data = new URLSearchParams();
	data.append("acl", JSON.stringify(policies));

	return axios
		.post(`/admin-ng/event/${id}/access`, data.toString(), headers)
		.then(response => {
			console.info(response);
			dispatch(fetchAccessPolicies(id));
			dispatch(
				addNotification({
					type: "info",
					key: "SAVED_ACL_RULES",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			return true;
		})
		.catch(response => {
			console.error(response);
			dispatch(
				addNotification({
					type: "error",
					key: "ACL_NOT_SAVED",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
			return false;
		});
});

export const updateComment = createAppAsyncThunk("eventDetails/updateComment", async (params: {
	eventId: Event["id"],
	commentId: Comment["id"],
	commentText: Comment["text"],
	commentReason: Comment["reason"]
}) => {
	const { eventId, commentId, commentText, commentReason } = params;
	const headers = getHttpHeaders();

	const data = new URLSearchParams();
	data.append("text", commentText);
	data.append("reason", commentReason);

	const commentUpdated = await axios.put(
		`/admin-ng/event/${eventId}/comment/${commentId}`,
		data.toString(),
		headers,
	);
	await commentUpdated.data;
	return true;
});

export const deleteComment = createAppAsyncThunk("eventDetails/deleteComment", async (params: {
	eventId: Event["id"],
	commentId: Comment["id"]
}) => {
	const { eventId, commentId } = params;
	const commentDeleted = await axios.delete(
		`/admin-ng/event/${eventId}/comment/${commentId}`,
	);
	await commentDeleted.data;
	return true;
});

export const deleteCommentReply = createAppAsyncThunk("eventDetails/deleteCommentReply", async (params: {
	eventId: Event["id"],
	commentId: Comment["id"],
	replyId: CommentReply["id"]
}) => {
	const { eventId, commentId, replyId } = params;
	const commentReplyDeleted = await axios.delete(
		`/admin-ng/event/${eventId}/comment/${commentId}/${replyId}`,
	);
	await commentReplyDeleted.data;

	return true;
});

export const saveWorkflowConfig = (params: {
	values: {
		workflowDefinition: string,
		configuration: { [key: string]: unknown } | undefined
	},
	eventId: Event["id"]
}): AppThunk => dispatch => {
// export const saveWorkflowConfig = createAppAsyncThunk("eventDetails/saveWorkflowConfig", async (params: {
// 	values: {
// 		workflowDefinition: string,
// 		configuration: { [key: string]: unknown } | undefined
// 	},
// 	eventId: Event["id"]
// }, { dispatch }) => {
	const { values, eventId } = params;
	const jsonData = {
		id: values.workflowDefinition,
		configuration: values.configuration,
	};

	const header = getHttpHeaders();
	const data = new URLSearchParams();
	// Scheduler service in Opencast expects values to be strings, so we convert them here
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	data.append("configuration", JSON.stringify(jsonData, (_k, v) => v && typeof v === "object" ? v : "" + v));

	axios
		.put(`/admin-ng/event/${eventId}/workflows`, data, header)
		.then(response => {
			console.info(response);
			dispatch(removeNotificationWizardForm());
			dispatch(fetchWorkflows(eventId));
		})
		.catch(response => {
			console.error(response);
			dispatch(
				addNotification({
					type: "error",
					key: "EVENTS_NOT_UPDATED",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}),
			);
		});
};

const eventDetailsSlice = createSlice({
	name: "eventDetails",
	initialState,
	reducers: {
		setShowModal(state, action: PayloadAction<
			EventDetailsState["modal"]["show"]
		>) {
			state.modal.show = action.payload;
		},
		setModalPage(state, action: PayloadAction<
			EventDetailsState["modal"]["page"]
		>) {
			state.modal.page = action.payload;
		},
		setModalEvent(state, action: PayloadAction<
			EventDetailsState["modal"]["event"]
		>) {
			state.modal.event = action.payload;
		},
		setModalWorkflowId(state, action: PayloadAction<
			EventDetailsState["modal"]["workflowId"]
		>) {
			state.modal.workflowId = action.payload;
		},
		setModalWorkflowTabHierarchy(state, action: PayloadAction<
			EventDetailsState["modal"]["workflowTabHierarchy"]
		>) {
			state.modal.workflowTabHierarchy = action.payload;
		},
		setModalAssetsTabHierarchy(state, action: PayloadAction<
			EventDetailsState["modal"]["assetsTabHierarchy"]
		>) {
			state.modal.assetsTabHierarchy = action.payload;
		},
		setEventMetadata(state, action: PayloadAction<
			EventDetailsState["metadata"]
		>) {
			state.metadata = action.payload;
		},
		setExtendedEventMetadata(state, action: PayloadAction<
			EventDetailsState["extendedMetadata"]
		>) {
			state.extendedMetadata = action.payload;
		},
		setEventWorkflow(state, action: PayloadAction<
			EventDetailsState["workflows"]["workflow"]
		>) {
			state.workflows.workflow = action.payload;
		},
		setEventWorkflowDefinitions(state, action: PayloadAction<{
			workflows: EventDetailsState["workflows"],
			workflowDefinitions: EventDetailsState["workflowDefinitions"],
		}>) {
			if ("workflowId" in action.payload.workflows.workflow) {
				state.baseWorkflow = { ...action.payload.workflows.workflow };
			}
			state.workflows = action.payload.workflows;
			state.workflowDefinitions = action.payload.workflowDefinitions;
		},
		setEventWorkflowConfiguration(state, action: PayloadAction<{
			workflowConfiguration: EventDetailsState["workflowConfiguration"],
		}>) {
			state.workflowConfiguration = action.payload.workflowConfiguration;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			// fetchMetadata
			.addCase(fetchMetadata.pending, state => {
				state.statusMetadata = "loading";
			})
			.addCase(fetchMetadata.fulfilled, (state, action: PayloadAction<{
				metadata: EventDetailsState["metadata"],
				extendedMetadata: EventDetailsState["extendedMetadata"],
			}>) => {
				state.statusMetadata = "succeeded";
				const eventDetails = action.payload;
				state.metadata = eventDetails.metadata;
				state.extendedMetadata = eventDetails.extendedMetadata;
			})
			.addCase(fetchMetadata.rejected, (state, action) => {
				state.statusMetadata = "failed";
				state.metadata = {
					title: "",
					flavor: "",
					fields: [],
				};
				state.extendedMetadata = [];
				state.errorMetadata = action.error;
				console.error(action.error);
			})
			// fetchAssets
			.addCase(fetchAssets.pending, state => {
				state.statusAssets = "loading";
			})
			.addCase(fetchAssets.fulfilled, (state, action: PayloadAction<{
				assets: EventDetailsState["assets"],
				transactionsReadOnly: EventDetailsState["transactionsReadOnly"],
				uploadAssetOptions: EventDetailsState["uploadAssetOptions"],
				uploadSourceOptions: EventDetailsState["uploadSourceOptions"],
			}>) => {
				state.statusAssets = "succeeded";
				const eventDetails = action.payload;
				state.assets = eventDetails.assets;
				state.transactionsReadOnly = eventDetails.transactionsReadOnly;
				state.uploadAssetOptions = eventDetails.uploadAssetOptions;
				state.uploadSourceOptions = eventDetails.uploadSourceOptions;
			})
			.addCase(fetchAssets.rejected, (state, action) => {
				state.statusAssets = "failed";
				const emptyAssets = {
					attachments: 0,
					catalogs: 0,
					media: 0,
					publications: 0,
				};
				state.assets = emptyAssets;
				state.transactionsReadOnly = false;
				state.uploadAssetOptions = [];
				state.errorAssets = action.error;
				console.error(action.error);
			})
			// fetchAssetAttachments
			.addCase(fetchAssetAttachments.pending, state => {
				state.statusAssetAttachments = "loading";
			})
			.addCase(fetchAssetAttachments.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetAttachments"]
			>) => {
				state.statusAssetAttachments = "succeeded";
				state.assetAttachments = action.payload;
			})
			.addCase(fetchAssetAttachments.rejected, (state, action) => {
				state.statusAssetAttachments = "failed";
				state.assetAttachments = [];
				state.errorAssetAttachments = action.error;
				console.error(action.error);
			})
			// fetchAssetAttachmentDetails
			.addCase(fetchAssetAttachmentDetails.pending, state => {
				state.statusAssetAttachments = "loading";
			})
			.addCase(fetchAssetAttachmentDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetAttachmentDetails"]
			>) => {
				state.statusAssetAttachments = "succeeded";
				state.assetAttachmentDetails = action.payload;
			})
			.addCase(fetchAssetAttachmentDetails.rejected, (state, action) => {
				state.statusAssetAttachments = "failed";
				const emptyAssetAttachmentDetails = {
					id: "",
					type: "",
					mimetype: "",
					size: 0,
					checksum: undefined,
					reference: "",
					tags: [],
					url: "",
				};
				state.assetAttachmentDetails = emptyAssetAttachmentDetails;
				state.errorAssetAttachments = action.error;
				console.error(action.error);
			})
			// fetchAssetCatalogs
			.addCase(fetchAssetCatalogs.pending, state => {
				state.statusAssetCatalogs = "loading";
			})
			.addCase(fetchAssetCatalogs.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetCatalogs"]
			>) => {
				state.statusAssetCatalogs = "succeeded";
				state.assetCatalogs = action.payload;
			})
			.addCase(fetchAssetCatalogs.rejected, (state, action) => {
				state.statusAssetCatalogs = "failed";
				state.assetCatalogs = [];
				state.errorAssetCatalogs = action.error;
				console.error(action.error);
			})
			// fetchAssetCatalogDetails
			.addCase(fetchAssetCatalogDetails.pending, state => {
				state.statusAssetCatalogDetails = "loading";
			})
			.addCase(fetchAssetCatalogDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetCatalogDetails"]
			>) => {
				state.statusAssetCatalogDetails = "succeeded";
				state.assetCatalogDetails = action.payload;
			})
			.addCase(fetchAssetCatalogDetails.rejected, (state, action) => {
				state.statusAssetCatalogDetails = "failed";
				const emptyAssetCatalogDetails = {
					id: "",
					type: "",
					mimetype: "",
					size: 0,
					checksum: undefined,
					reference: "",
					tags: [],
					url: "",
				};
				state.assetCatalogDetails = emptyAssetCatalogDetails;
				state.errorAssetCatalogDetails = action.error;
				console.error(action.error);
			})
			// fetchAssetMedia
			.addCase(fetchAssetMedia.pending, state => {
				state.statusAssetMedia = "loading";
			})
			.addCase(fetchAssetMedia.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetMedia"]
			>) => {
				state.statusAssetMedia = "succeeded";
				state.assetMedia = action.payload;
			})
			.addCase(fetchAssetMedia.rejected, (state, action) => {
				state.statusAssetMedia = "failed";
				state.assetMedia = [];
				state.errorAssetMedia = action.error;
				console.error(action.error);
			})
			// fetchAssetMediaDetails
			.addCase(fetchAssetMediaDetails.pending, state => {
				state.statusAssetMediaDetails = "loading";
			})
			.addCase(fetchAssetMediaDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetMediaDetails"]
			>) => {
				state.statusAssetMediaDetails = "succeeded";
				state.assetMediaDetails = camelcaseKeys(action.payload);
			})
			.addCase(fetchAssetMediaDetails.rejected, (state, action) => {
				state.statusAssetMediaDetails = "failed";
				const emptyAssetMediaDetails = {
					id: "",
					type: "",
					mimetype: "",
					tags: [],
					duration: 0,
					size: 0,
					checksum: undefined,
					reference: "",
					hasAudio: false,
					hasSubtitle: false,
					hasVideo: false,
					url: "",
					streams: {
						audio: [],
						video: [],
					},
					video: undefined,
				};
				state.assetMediaDetails = emptyAssetMediaDetails;
				state.errorAssetMediaDetails = action.error;
				console.error(action.error);
			})
			// fetchAssetPublications
			.addCase(fetchAssetPublications.pending, state => {
				state.statusAssetPublications = "loading";
			})
			.addCase(fetchAssetPublications.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetPublications"]
			>) => {
				state.statusAssetPublications = "succeeded";
				state.assetPublications = action.payload;
			})
			.addCase(fetchAssetPublications.rejected, (state, action) => {
				state.statusAssetPublications = "failed";
				state.assetPublications = [];
				state.errorAssetPublications = action.error;
				console.error(action.error);
			})
			// fetchAssetPublicationDetails
			.addCase(fetchAssetPublicationDetails.pending, state => {
				state.statusAssetPublicationDetails = "loading";
			})
			.addCase(fetchAssetPublicationDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["assetPublicationDetails"]
			>) => {
				state.statusAssetPublicationDetails = "succeeded";
				state.assetPublicationDetails = action.payload;
			})
			.addCase(fetchAssetPublicationDetails.rejected, (state, action) => {
				state.statusAssetPublicationDetails = "failed";
				const emptyAssetPublicationDetails = {
					id: "",
					type: "",
					mimetype: "",
					size: 0,
					checksum: undefined,
					channel: "",
					reference: "",
					tags: [],
					url: "",
				};
				state.assetPublicationDetails = emptyAssetPublicationDetails;
				state.errorAssetPublicationDetails = action.error;
				console.error(action.error);
			})
			// fetchAccessPolicies
			.addCase(fetchAccessPolicies.pending, state => {
				state.statusPolicies = "loading";
			})
			.addCase(fetchAccessPolicies.fulfilled, (state, action: PayloadAction<{
				policies: EventDetailsState["policies"],
				currentAclTemplateId: EventDetailsState["policyTemplateId"],
			}>) => {
				state.statusPolicies = "succeeded";
				state.policies = action.payload.policies;
				state.policyTemplateId = action.payload.currentAclTemplateId;
			})
			.addCase(fetchAccessPolicies.rejected, (state, action) => {
				state.statusPolicies = "failed";
				state.errorPolicies = action.error;
				console.error(action.error);
			})
			// fetchComments
			.addCase(fetchComments.pending, state => {
				state.statusComments = "loading";
			})
			.addCase(fetchComments.fulfilled, (state, action: PayloadAction<{
				comments: EventDetailsState["comments"],
				commentReasons: EventDetailsState["commentReasons"],
			}>) => {
				state.statusComments = "succeeded";
				const eventDetails = action.payload;
				state.comments = eventDetails.comments;
				state.commentReasons = eventDetails.commentReasons;
			})
			.addCase(fetchComments.rejected, (state, action) => {
				state.statusComments = "failed";
				state.errorComments = action.error;
				console.error(action.error);
			})
			// fetchEventPublications
			.addCase(fetchEventPublications.pending, state => {
				state.statusPublications = "loading";
			})
			.addCase(fetchEventPublications.fulfilled, (state, action: PayloadAction<
				EventDetailsState["publications"]
			>) => {
				state.statusPublications = "succeeded";
				state.publications = action.payload;
			})
			.addCase(fetchEventPublications.rejected, (state, action) => {
				state.statusPublications = "failed";
				state.errorPublications = action.error;
				console.error(action.error);
			})
			// saveComment
			.addCase(saveComment.pending, state => {
				state.statusSaveComment = "loading";
			})
			.addCase(saveComment.fulfilled, state => {
				state.statusSaveComment = "succeeded";
			})
			.addCase(saveComment.rejected, (state, action) => {
				state.statusSaveComment = "failed";
				state.errorSaveComment = action.error;
				console.error(action.error);
			})
			// saveCommentReply
			.addCase(saveCommentReply.pending, state => {
				state.statusSaveCommentReply = "loading";
			})
			.addCase(saveCommentReply.fulfilled, state => {
				state.statusSaveCommentReply = "succeeded";
			})
			.addCase(saveCommentReply.rejected, (state, action) => {
				state.statusSaveCommentReply = "failed";
				state.errorSaveCommentReply = action.error;
				console.error(action.error);
			})
			// updateComment
			.addCase(updateComment.pending, state => {
				state.statusUpdateComment = "loading";
			})
			.addCase(updateComment.fulfilled, state => {
				state.statusUpdateComment = "succeeded";
			})
			.addCase(updateComment.rejected, (state, action) => {
				state.statusUpdateComment = "failed";
				state.errorUpdateComment = action.error;
				console.error(action.error);
			})
			// fetchSchedulingInfo
			.addCase(fetchSchedulingInfo.pending, state => {
				state.statusScheduling = "loading";
			})
			.addCase(fetchSchedulingInfo.fulfilled, (state, action: PayloadAction<
				EventDetailsState["schedulingSource"]
			>) => {
				state.statusScheduling = "succeeded";
				state.schedulingSource = action.payload;
				state.scheduling.hasProperties = true;
			})
			.addCase(fetchSchedulingInfo.rejected, (state, action) => {
				// This usually means we have a non-scheduled event
				state.statusScheduling = "failed";
				const emptySchedulingSource = {
					start: {
						date: "",
						hour: undefined,
						minute: undefined,
					},
					duration: {
						hour: undefined,
						minute: undefined,
					},
					end: {
						date: "",
						hour: undefined,
						minute: undefined,
					},
					device: {
						id: "",
						name: "",
						inputs: [],
						inputMethods: [],
					},
					agentId: undefined,
					agentConfiguration: {},
				};
				state.schedulingSource = emptySchedulingSource;
				state.scheduling.hasProperties = false;
				state.errorScheduling = action.error;
				console.debug(action.error);
			})
			// saveSchedulingInfo
			.addCase(saveSchedulingInfo.pending, state => {
				state.statusSaveScheduling = "loading";
			})
			.addCase(saveSchedulingInfo.fulfilled, (state, action: PayloadAction<
				EventDetailsState["schedulingSource"]
			>) => {
				state.statusSaveScheduling = "succeeded";
				state.schedulingSource = action.payload;
			})
			.addCase(saveSchedulingInfo.rejected, (state, action) => {
				state.statusSaveScheduling = "failed";
				state.errorSaveScheduling = action.error;
				console.error(action.error);
			})
			// checkConflicts
			.addCase(checkConflicts.pending, state => {
				state.statusCheckConflicts = "loading";
			})
			.addCase(checkConflicts.fulfilled, (state, action: PayloadAction<{
				conflicts: EventDetailsState["schedulingConflicts"],
				hasSchedulingConflicts: EventDetailsState["hasSchedulingConflicts"],
			}>) => {
				state.statusCheckConflicts = "succeeded";
				const eventDetails = action.payload;
				state.schedulingConflicts = eventDetails.conflicts;
				state.hasSchedulingConflicts = eventDetails.hasSchedulingConflicts;
			})
			.addCase(checkConflicts.rejected, (state, action) => {
				state.statusCheckConflicts = "failed";
				state.errorCheckConflicts = action.error;
				console.error(action.error);
			})
			// fetchWorkflows
			.addCase(fetchWorkflows.pending, state => {
				state.statusWorkflows = "loading";
			})
			.addCase(fetchWorkflows.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflows"]
			>) => {
				state.statusWorkflows = "succeeded";
				state.workflows = action.payload;
				if ("workflowId" in state.workflows.workflow && !!state.workflows.workflow.workflowId) {
					state.workflowConfiguration = state.workflows.workflow;
				} else {
					state.workflowConfiguration = state.baseWorkflow;
				}
			})
			.addCase(fetchWorkflows.rejected, (state, action) => {
				state.statusWorkflows = "failed";
				state.workflows = {
					scheduling: false,
					entries: [],
					workflow: {
						workflowId: "",
						description: "",
					},
				};
				state.workflowConfiguration = {
					workflowId: "",
					description: "",
				};
				state.errorWorkflows = action.error;
				console.error(action.error);
			})
			// fetchWorkflowDetails
			.addCase(fetchWorkflowDetails.pending, state => {
				state.statusWorkflowDetails = "loading";
			})
			.addCase(fetchWorkflowDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflows"]["workflow"]
			>) => {
				state.statusWorkflowDetails = "succeeded";
				state.workflows.workflow = action.payload;
			})
			.addCase(fetchWorkflowDetails.rejected, (state, action) => {
				state.statusWorkflowDetails = "failed";
				// This is the empty workflow data from the original reducer
				// TODO: Figure out why it is so vastly different from our initial state
				// and maybe fix our initial state if this is actually correct
				const emptyWorkflowData = {
					workflowId: "",
					description: "",
				};
				state.workflows.workflow = emptyWorkflowData;
				state.errorWorkflowDetails = action.error;
			})
			// performWorkflowAction
			.addCase(performWorkflowAction.pending, state => {
				state.statusDoWorkflowAction = "loading";
			})
			.addCase(performWorkflowAction.fulfilled, state => {
				state.statusDoWorkflowAction = "succeeded";
			})
			.addCase(performWorkflowAction.rejected, (state, action) => {
				state.statusDoWorkflowAction = "failed";
				state.errorDoWorkflowAction = action.error;
				console.error(action.error);
			})
			// deleteWorkflow
			.addCase(deleteWorkflow.pending, state => {
				state.statusDeleteWorkflow = "loading";
			})
			.addCase(deleteWorkflow.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflows"]["entries"]
			>) => {
				state.statusDeleteWorkflow = "succeeded";
				state.workflows.entries = action.payload;
			})
			.addCase(deleteWorkflow.rejected, (state, action) => {
				state.statusDeleteWorkflow = "failed";
				state.errorDeleteWorkflow = action.error;
				console.error(action.error);
			})
			// fetchWorkflowOperations
			.addCase(fetchWorkflowOperations.pending, state => {
				state.statusWorkflowOperations = "loading";
			})
			.addCase(fetchWorkflowOperations.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflowOperations"]
			>) => {
				state.statusWorkflowOperations = "succeeded";
				state.workflowOperations = action.payload;
			})
			.addCase(fetchWorkflowOperations.rejected, (state, action) => {
				state.statusWorkflowOperations = "failed";
				state.workflowOperations = { entries: [] };
				state.errorWorkflowOperations = action.error;
			})
			// fetchWorkflowOperationDetails
			.addCase(fetchWorkflowOperationDetails.pending, state => {
				state.statusWorkflowOperationDetails = "loading";
			})
			.addCase(fetchWorkflowOperationDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflowOperationDetails"]
			>) => {
				state.statusWorkflowOperationDetails = "succeeded";
				state.workflowOperationDetails = camelcaseKeys(action.payload);
			})
			.addCase(fetchWorkflowOperationDetails.rejected, (state, action) => {
				state.statusWorkflowOperationDetails = "failed";
				const emptyOperationDetails = {
					completed: "",
					description: "",
					exceptionHandlerWorkflow: "",
					executionHost: "",
					failOnError: false,
					failedAttempts: 0,
					job: 0,
					maxAttempts: 0,
					name: "",
					retryStrategy: "",
					started: "",
					state: "",
					timeInQueue: 0,
				};
				state.workflowOperationDetails = emptyOperationDetails;
				state.errorWorkflowOperationDetails = action.error;
			})
			// fetchWorkflowErrors
			.addCase(fetchWorkflowErrors.pending, state => {
				state.statusWorkflowErrors = "loading";
			})
			.addCase(fetchWorkflowErrors.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflowErrors"]
			>) => {
				state.statusWorkflowErrors = "succeeded";
				state.workflowErrors = action.payload;
			})
			.addCase(fetchWorkflowErrors.rejected, (state, action) => {
				state.statusWorkflowErrors = "failed";
				state.workflowErrors = { entries: [] };
				state.errorWorkflowOperations = action.error;
			})
			// fetchWorkflowErrorDetails
			.addCase(fetchWorkflowErrorDetails.pending, state => {
				state.statusWorkflowErrorDetails = "loading";
			})
			.addCase(fetchWorkflowErrorDetails.fulfilled, (state, action: PayloadAction<
				EventDetailsState["workflowErrorDetails"]
			>) => {
				state.statusWorkflowErrorDetails = "succeeded";
				state.workflowErrorDetails = camelcaseKeys(action.payload);
			})
			.addCase(fetchWorkflowErrorDetails.rejected, (state, action) => {
				state.statusWorkflowErrorDetails = "failed";
				state.workflowErrorDetails = {
					description: "",
					details: [],
					id: 0,
					jobId: 0,
					processingHost: "",
					serviceType: "",
					severity: "",
					technicalDetails: "",
					timestamp: "",
					title: "",
				};
				state.errorWorkflowOperationDetails = action.error;
			})
			// fetchEventStatistics
			.addCase(fetchEventStatistics.pending, state => {
				state.statusStatistics = "loading";
			})
			.addCase(fetchEventStatistics.fulfilled, (state, action: PayloadAction<{
				statistics: EventDetailsState["statistics"],
				hasError: EventDetailsState["hasStatisticsError"],
			}>) => {
				state.statusStatistics = "succeeded";
				const eventDetails = action.payload;
				state.statistics = eventDetails.statistics;
				state.hasStatisticsError = eventDetails.hasError;
			})
			.addCase(fetchEventStatistics.rejected, (state, action) => {
				state.statusStatistics = "failed";
				state.statistics = [];
				state.hasStatisticsError = true;
				state.errorStatistics = action.error;
				console.error(action.error);
			})
			// fetchEventStatisticsValueUpdate
			.addCase(fetchEventStatisticsValueUpdate.pending, state => {
				state.statusStatisticsValue = "loading";
			})
			.addCase(fetchEventStatisticsValueUpdate.fulfilled, (state, action: PayloadAction<
				EventDetailsState["statistics"]
			>) => {
				state.statusStatisticsValue = "succeeded";
				state.statistics = action.payload;
			})
			.addCase(fetchEventStatisticsValueUpdate.rejected, (state, action) => {
				state.statusStatisticsValue = "failed";
				state.statistics = [];
				state.errorStatisticsValue = action.error;
				console.error(action.error);
			})
			.addCase(fetchHasActiveTransactions.rejected, (_state, action) => {
				console.error(action.error);
			})
			.addCase(deleteComment.rejected, (_state, action) => {
				console.error(action.error);
			})
			// fetch Tobira data
			.addCase(fetchEventDetailsTobira.pending, state => {
				state.statusTobiraData = "loading";
			})
			.addCase(fetchEventDetailsTobira.fulfilled, (state, action: PayloadAction<
				EventDetailsState["tobiraData"]
			>) => {
				state.statusTobiraData = "succeeded";
				state.tobiraData = action.payload;
				state.errorTobiraData = null;
			})
			.addCase(fetchEventDetailsTobira.rejected, (state, action) => {
				state.statusTobiraData = "failed";
				state.errorTobiraData = action.error;
			});
	},
});

export const {
	setShowModal,
	setModalPage,
	setModalEvent,
	setModalWorkflowId,
	setModalWorkflowTabHierarchy,
	setModalAssetsTabHierarchy,
	setEventMetadata,
	setExtendedEventMetadata,
	setEventWorkflow,
	setEventWorkflowDefinitions,
	setEventWorkflowConfiguration,
} = eventDetailsSlice.actions;

// Export the slice reducer as the default export
export default eventDetailsSlice.reducer;
