import { combineReducers } from "redux";
import tableFilterReducer from "../../src/slices/tableFilterSlice";
import { configureStore } from "@reduxjs/toolkit";

const statsRootReducer = combineReducers({
  tableFilters: tableFilterReducer,
  eventReducer: (state = {}) => state,
});

export const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: statsRootReducer,
    preloadedState,
  });
