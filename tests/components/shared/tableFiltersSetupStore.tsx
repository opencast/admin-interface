import tableFilterReducer from "../../../src/slices/tableFilterSlice";
import tableFilterProfilesReducer from "../../../src/slices/tableFilterProfilesSlice";
import { combineReducers } from "redux";

// root reducer combining actual reducers
export const rootReducer = {
  tableFilters: tableFilterReducer,
  tableFilterProfiles: tableFilterProfilesReducer,
};

// Create a combined reducer function for the store
export const combinedReducer = combineReducers(rootReducer);

// Define the test RootState type based on your test reducers
export type TestRootState = ReturnType<typeof combinedReducer>;

export default rootReducer;
