import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { UnknownAction, combineReducers } from "redux";
import tableFilters from "./slices/tableFilterSlice";
import tableFilterProfiles from "./slices/tableFilterProfilesSlice";
import events from "./slices/eventSlice";
import table from "./slices/tableSlice";
import series from "./slices/seriesSlice";
import recordings from "./slices/recordingSlice";
import jobs from "./slices/jobSlice";
import servers from "./slices/serverSlice";
import services from "./slices/serviceSlice";
import users from "./slices/userSlice";
import groups from "./slices/groupSlice";
import acls from "./slices/aclSlice";
import themes from "./slices/themeSlice";
import health from "./slices/healthSlice";
import notifications from "./slices/notificationSlice";
import workflows from "./slices/workflowSlice";
import eventDetails from "./slices/eventDetailsSlice";
import seriesDetails from "./slices/seriesDetailsSlice";
import userDetails from "./slices/userDetailsSlice";
import recordingDetails from "./slices/recordingDetailsSlice";
import groupDetails from "./slices/groupDetailsSlice";
import aclDetails from "./slices/aclDetailsSlice";
import themeDetails from "./slices/themeDetailsSlice";
import userInfo from "./slices/userInfoSlice";
import statistics from "./slices/statisticsSlice";
import { ThunkAction, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

/**
 * This File contains the configuration for the store used by the reducers all over the app
 */

// Configuration for persisting states in store
const tableFilterProfilesPersistConfig = { key: "tableFilterProfiles", storage, whitelist: ["profiles"] };
const eventsPersistConfig = { key: "events", storage, whitelist: ["columns"] };
const seriesPersistConfig = { key: "series", storage, whitelist: ["columns"] };
const tablePersistConfig = { key: "table", storage, whitelist: ["pagination", "sortBy", "reverse"] };
const recordingsPersistConfig = { key: "recordings", storage, whitelist: ["columns"] };
const jobsPersistConfig = { key: "jobs", storage, whitelist: ["columns"] };
const serversPersistConfig = { key: "servers", storage, whitelist: ["columns"] };
const servicesPersistConfig = { key: "services", storage, whitelist: ["columns"] };
const usersPersistConfig = { key: "users", storage, whitelist: ["columns"] };
const groupsPersistConfig = { key: "groups", storage, whitelist: ["columns"] };
const aclsPersistConfig = { key: "acls", storage, whitelist: ["columns"] };
const themesPersistConfig = { key: "themes", storage, whitelist: ["columns"] };

// form reducer and all other reducers used in this app
const reducers = combineReducers({
	tableFilters,
	tableFilterProfiles: persistReducer(tableFilterProfilesPersistConfig, tableFilterProfiles),
	events: persistReducer(eventsPersistConfig, events),
	series: persistReducer(seriesPersistConfig, series),
	table: persistReducer(tablePersistConfig, table),
	recordings: persistReducer(recordingsPersistConfig, recordings),
	jobs: persistReducer(jobsPersistConfig, jobs),
	servers: persistReducer(serversPersistConfig, servers),
	services: persistReducer(servicesPersistConfig, services),
	users: persistReducer(usersPersistConfig, users),
	groups: persistReducer(groupsPersistConfig, groups),
	acls: persistReducer(aclsPersistConfig, acls),
	themes: persistReducer(themesPersistConfig, themes),
	health,
	notifications,
	workflows,
	eventDetails,
	themeDetails,
	seriesDetails,
	recordingDetails,
	userDetails,
	groupDetails,
	aclDetails,
	userInfo,
	statistics,
});

// Configuration for persisting store
const persistConfig = {
	key: "root",
	storage,
	stateReconciler: autoMergeLevel2,
	whitelist: ["tableFilters"],
};

const persistedReducer = persistReducer<ReturnType<typeof reducers>>(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Initialize typescript type inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>

export default store;
