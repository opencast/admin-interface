import { combineReducers } from "redux";

// Stub reducers returning default state (no action handling needed for tests)
const userInfoReducer = () => ({
  user: { name: "Test User" },
  roles: ["admin"],
  org: { id: "org1", properties: {} },
});

const eventsReducer = () => ({
  uploadSourceOptions: [],
  uploadAssetOptions: [],
  isFetchingAssetUploadOptions: false,
  metadata: { title: "event", flavor: "someFlavor", fields: [] },
  extendedMetadata: [],
  total: 0,
});

// Root reducer object with your test slices
export const rootReducer = {
  userInfo: userInfoReducer,
  events: eventsReducer,
};

export const combinedReducer = combineReducers(rootReducer);

export type TestRootState = ReturnType<typeof combinedReducer>;

export default rootReducer;
