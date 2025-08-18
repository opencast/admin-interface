import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
	NOTIFICATION_CONTEXT,
	NOTIFICATION_CONTEXT_ACCESS,
	NOTIFICATION_CONTEXT_TOBIRA,
} from "../configs/modalConfig";
import {
	ADMIN_NOTIFICATION_DURATION_ERROR,
	ADMIN_NOTIFICATION_DURATION_GLOBAL,
	ADMIN_NOTIFICATION_DURATION_SUCCESS,
	ADMIN_NOTIFICATION_DURATION_WARNING,
} from "../configs/generalConfig";
import { getLastAddedNotification } from "../selectors/notificationSelector";
import { ParseKeys } from "i18next";
import { AppThunk } from "../store";

/**
 * This file contains redux reducer for actions affecting the state of table
 */
// Calling this "OurNotification" because "Notification" is reserved by the Notifications Web API
export type OurNotification = {
	message: ParseKeys,
	id: number,
	hidden: boolean,
	duration: number,  // in milliseconds. -1 means stay forever
	type: "error" | "success" | "warning" | "info",
	parameter?: { [key: string]: unknown },
	key: string,
	context: string
}

type NotificationState = {
	notificationPositionGlobal: string,
	notifications: OurNotification[]
}

// Initial state of notifications in store
// If you want to change the position of notification, here it can be done
const initialState: NotificationState = {
	notificationPositionGlobal: "bottom-right",
	notifications: [],
};

// Counter for id of notifications
let nextNotificationId = 0;

export const addNotification = (params: {
	type: OurNotification["type"],
	key: OurNotification["key"],
	duration?: OurNotification["duration"],
	parameter?: OurNotification["parameter"],
	context?: OurNotification["context"],
	id?: OurNotification["id"]
	noDuplicates?: boolean,   // Do not add this notification if one with the same key already exists (in the same context)
}): AppThunk => (dispatch, getState) => {
	let { duration, parameter, context } = params;
	const { type, key, id, noDuplicates } = params;

	if (noDuplicates) {
		const state = getState();
		for (const notif of state.notifications.notifications) {
			if (notif.key === key && notif.context === context) {
				console.log("Did not add notification with key " + key + " because a notification with that key already exists.");
				return;
			}
		}
	}

	if (!duration) {
		// fall back to defaults
		switch (type) {
			case "error":
				duration = ADMIN_NOTIFICATION_DURATION_ERROR;
				break;
			case "success":
				duration = ADMIN_NOTIFICATION_DURATION_SUCCESS;
				break;
			case "warning":
				duration = ADMIN_NOTIFICATION_DURATION_WARNING;
				break;
			default:
				duration = ADMIN_NOTIFICATION_DURATION_GLOBAL;
				break;
		}
	}
	// default durations are in seconds. duration needs to be in milliseconds
	if (duration > 0) {
		duration *= 1000;
	}

	if (!context) {
		context = "global";
	}

	if (!parameter) {
		parameter = {};
	}

	// Create new notification
	const notification = {
		id: 0,  // value does not matter, id is set in action
		type: type,
		key: key,
		message: "NOTIFICATIONS." + key as ParseKeys,
		parameter: parameter,
		duration: duration,
		hidden: false,
		context: context,
	};
	let dispatchedNotification;
	if (!id) {
		dispatchedNotification = dispatch(createNotification({ notification: notification, id: nextNotificationId++ }));
	} else {
		dispatchedNotification = dispatch(createNotification({ notification: notification, id: id }));
	}

	// Get newly created notification and its id
	const latestNotification = getLastAddedNotification(getState());

	// Fade out notification if it is not -1 -> -1 means 'stay forever'
	// Start timeout for fading out after time in duration is over
	if (
		latestNotification.duration &&
		latestNotification.duration !== -1
	) {
		setTimeout(
			() => dispatch(removeNotification(latestNotification.id)),
			latestNotification.duration,
		);
	}

	return dispatchedNotification.payload.id;
};

// Reducer for notifications
const notificationSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		createNotification(state, action: PayloadAction<{
			notification: OurNotification,
			id: OurNotification["id"],
		}>) {
			const { notification, id } = action.payload;
			if (state.notifications.filter(e => e.id === id).length > 0) {
				console.log("Notification with id: " + id + " already exists.");
				state.notifications = state.notifications.map(oldNotification => {
					if (oldNotification.id === id) {
						return {
							...notification,
							id: id,
						};
					}
					return oldNotification;
				});
			} else {
				state.notifications = [
					...state.notifications,
					{
						id: id,
						key: notification.key,
						message: notification.message,
						type: notification.type,
						hidden: notification.hidden,
						duration: notification.duration,
						parameter: notification.parameter,
						context: notification.context,
					},
				];
			}
		},
		removeNotification(state, action: PayloadAction<
			OurNotification["id"]
		>) {
			const idToRemove = action.payload;
			state.notifications = state.notifications.filter(
				notification => notification.id !== idToRemove,
			);
		},
		removeNotificationByKey(state, action: PayloadAction<{
			key: OurNotification["key"],
			context: OurNotification["context"],
		}>) {
			const { key, context } = action.payload;
			state.notifications = state.notifications.filter(
				notification => notification.key !== key || notification.context !== context,
			);
		},
		removeNotificationWizardForm(state) {
			state.notifications = state.notifications.filter(
				notification => notification.context !== NOTIFICATION_CONTEXT,
			);
		},
		removeNotificationWizardAccess(state) {
			state.notifications = state.notifications.filter(
				notification => notification.context !== NOTIFICATION_CONTEXT_ACCESS,
			);
		},
		removeNotificationWizardTobira(state) {
			state.notifications = state.notifications.filter(
				notification => notification.context !== NOTIFICATION_CONTEXT_TOBIRA,
			);
		},
		setHidden(state, action: PayloadAction<{
			id: OurNotification["id"],
			isHidden: OurNotification["hidden"],
		}>) {
			const { id: idToUpdate, isHidden } = action.payload;
			state.notifications = state.notifications.map(notification => {
				if (notification.id === idToUpdate) {
					return {
						...notification,
						hidden: isHidden,
					};
				}
				return notification;
			});
		},
	},
});

export const {
	createNotification,
	removeNotification,
	removeNotificationByKey,
	removeNotificationWizardForm,
	removeNotificationWizardAccess,
	removeNotificationWizardTobira,
	setHidden,
} = notificationSlice.actions;

// Export the slice reducer as the default export
export default notificationSlice.reducer;
