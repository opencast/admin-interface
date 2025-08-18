import tableReducer from "../../../src/slices/tableSlice";
import notificationsReducer from "../../../src/slices/notificationSlice";
import usersReducer from "../../../src/slices/userSlice";
import { combineReducers } from "redux";


export const rootReducer = {
  table: tableReducer,
  notifications: notificationsReducer,
  users: usersReducer,
};

export const dummyResourceState = {
  events: "",
  series: "",
  recordings: "",
  jobs: "",
  servers: "",
  services: "",
  users: "",
  groups: "",
  acls: "",
  themes: "",
};

export const dummyReverseState = {
  events: "ASC" as const,
  series: "ASC" as const,
  recordings: "ASC" as const,
  jobs: "ASC" as const,
  servers: "ASC" as const,
  services: "ASC" as const,
  users: "ASC" as const,
  groups: "ASC" as const,
  acls: "ASC" as const,
  themes: "ASC" as const,
};

export const dummyMultiSelect = {
  events: false,
  series: false,
  recordings: false,
  jobs: false,
  servers: false,
  services: false,
  users: false,
  groups: false,
  acls: false,
  themes: false,
};

// Combined reducer function
export const combinedReducer = combineReducers(rootReducer);

// Type of the root state for tests
export type TestRootState = ReturnType<typeof combinedReducer>;

export default rootReducer;
