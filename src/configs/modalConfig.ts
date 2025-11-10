// All fields for new event form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
import { TransformedAcl } from "../slices/aclDetailsSlice";
import { TobiraPage } from "../slices/seriesSlice";
import { initArray } from "../utils/utils";
import { EditedEvents, Event, UploadAssetsTrack } from "../slices/eventSlice";
import { Role } from "../slices/aclSlice";
import { ParseKeys } from "i18next";
import { UserRole } from "../slices/userSlice";

// Context for notifications shown in modals
export const NOTIFICATION_CONTEXT = "modal-form";

// Context for notifications shown in wizard access page
export const NOTIFICATION_CONTEXT_ACCESS = "wizard-access";

// Context for notifications shown in tobira tabs.
export const NOTIFICATION_CONTEXT_TOBIRA = "tobira";

export const initialFormValuesNewEvents: {
	sourceMode: string,
	scheduleStartDate: string,
	scheduleEndDate: string,
	scheduleStartHour: string,
	scheduleStartMinute: string,
	scheduleDurationHours: string,
	scheduleDurationMinutes: string,
	scheduleEndHour: string,
	scheduleEndMinute: string,
	repeatOn: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[],
	location: string,
	processingWorkflow: string,
	configuration: { [key: string]: string },
	aclTemplate: string,
	policies: TransformedAcl[],
	uploadAssetsTrack?: UploadAssetsTrack[]
	[key: string]: unknown,  // Metadata fields that are getting added later
} = {
	sourceMode: "UPLOAD",
	scheduleStartDate: new Date().toISOString(),
	scheduleEndDate: new Date().toISOString(),
	scheduleStartHour: "",
	scheduleStartMinute: "",
	scheduleDurationHours: "",
	scheduleDurationMinutes: "",
	scheduleEndHour: "",
	scheduleEndMinute: "",
	repeatOn: [],
	location: "",
	// deviceInputs: [],
	processingWorkflow: "",
	configuration: {},
	aclTemplate: "",
	policies: [],
};

// constants for hours and minutes (used in selection for start/end time and duration)
export const hours = initArray(24);
export const minutes = initArray(60);

// sorted weekdays and their translation key
export const weekdays: {
	name: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU"
	label: ParseKeys
}[] = [
	{
		name: "MO",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.MO",
	},
	{
		name: "TU",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.TU",
	},
	{
		name: "WE",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.WE",
	},
	{
		name: "TH",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.TH",
	},
	{
		name: "FR",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.FR",
	},
	{
		name: "SA",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.SA",
	},
	{
		name: "SU",
		label: "EVENTS.EVENTS.NEW.WEEKDAYS.SU",
	},
];

// Workflow applied to upload assets that are not tracks
export const WORKFLOW_UPLOAD_ASSETS_NON_TRACK = "publish-uploaded-assets";

// All fields for new series form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewSeries: {
	policies: TransformedAcl[],
	theme: string,

	breadcrumbs: TobiraPage[],
	selectedPage?: TobiraPage,
	[key: string]: unknown,  // Metadata fields that are getting added later
} = {
	policies: [
		{
			role: "ROLE_USER_ADMIN",
			read: true,
			write: true,
			actions: [],
		},
	],
	theme: "",
	breadcrumbs: [],
	selectedPage: undefined,
};

// All fields for new theme form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewThemes = {
	name: "",
	description: "",
	bumperActive: false,
	bumperFile: "",
	bumperFileName: "",
	trailerActive: false,
	trailerFile: "",
	trailerFileName: "",
	titleSlideActive: false,
	titleSlideMode: "extract",
	titleSlideBackground: "",
	titleSlideBackgroundName: "",
	licenseSlideActive: false,
	watermarkActive: false,
	watermarkFile: "",
	watermarkFileName: "",
	watermarkPosition: "topRight",

	// Don't care about these, but they are required by type
	creationDate: "",
	creator: "",
	default: false,
	id: 0,
	licenseSlideBackground: "",
	licenseSlideDescription: "",
	titleSlideMetadata: "",
};

// All fields for new acl form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewAcl: {
	name: string,
	policies: TransformedAcl[],
} = {
	name: "",
	policies: [],
};

// All fields for new group form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewGroup: {
	name: string,
	description: string,
	roles: { name: string }[],
	users: { id: string, name: string }[],
} = {
	name: "",
	description: "",
	roles: [],
	users: [],
};

// All fields for new user form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewUser: {
	username: string,
	name: string,
	email: string,
	password: string,
	passwordConfirmation: string,
	roles: Role[],
	assignedRoles: UserRole[],
	manageable: boolean,
} = {
	username: "",
	name: "",
	email: "",
	password: "",
	passwordConfirmation: "",
	roles: [],
	assignedRoles: [],
	manageable: true,
};

// All fields for start task form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesStartTask: {
	events: Event[],
	workflow: string,
	configuration: { [key: string]: string },
} = {
	events: [],
	workflow: "",
	configuration: {},
};

export const initialFormValuesEditScheduledEvents: {
	events: Event[],
	editedEvents: EditedEvents[],
	changedEvents: string[],
} = {
	events: [],
	editedEvents: [],
	changedEvents: [],
};
