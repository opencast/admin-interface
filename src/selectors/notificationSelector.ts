import { createSelector } from "reselect";
import { RootState } from "../store";
import { OurNotification } from "../slices/notificationSlice";

export const getNotifications = (state: RootState) => state.notifications.notifications;
export const getGlobalPositions = (state: RootState) =>
  state.notifications.notificationPositionGlobal;


export const getNotificationById = (id: OurNotification["id"]) =>
	createSelector(getNotifications, notifications =>
		notifications.filter(notification => notification.id === id),
	);

export const getLastAddedNotification = createSelector(
	getNotifications,
	notifications =>
		notifications.reduce((prev, current) =>
			prev.id > current.id ? prev : current,
		),
);
