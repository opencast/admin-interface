import userReducer from '../src/slices/userSlice';
import userInfoReducer from '../src/slices/userInfoSlice'; // your real userInfo reducer

import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {rootReducer} from "./tableSetupStore";

const userRootReducer = combineReducers({
  users: (state = {}) => state,
  userInfo: userInfoReducer,
  health: (state = {}) => state,
  notifications: (state = {}) => state,
  tableFilters: (state = {}) => state,
  tableFilterProfiles: (state = {}) => state,
  table: (state = {}) => state,
});

const defaultPreloadedState = {
  users: {
    results: [
      {
        provider: "system",
        manageable: true,
        name: "Test User",
        username: "testuser",
        email: "testuser@example.com",
        roles: [{ name: "ROLE_USER", type: "INTERNAL" }],
      },
    ],
    status: 'succeeded' as const,
    error: null,
    columns: [],
    total: 1,
    offset: 0,
    limit: 10,
    count: 1,
  },
  userInfo: {
    status: 'succeeded' as const,
    error: null,
    statusOcVersion: 'succeeded' as const,
    errorOcVersion: null,
    isAdmin: true,
    isOrgAdmin: true,
    org: {
      adminRole: "",
      anonymousRole: "",
      id: "",
      name: "",
      properties: {},
    },
    roles: ["ROLE_USER"],
    userRole: "",
    user: {
      email: "testuser@example.com",
      name: "Test User",
      provider: "system",
      username: "testuser",
    },
    ocVersion: {
      buildNumber: undefined,
      consistent: undefined,
      "last-modified": undefined,
      version: undefined,
    },
  },
  health: {},
  notifications: {notifications: []},
  tableFilters: {data: []},
  tableFilterProfiles: {profiles: []},
  table: rootReducer.table(),
};

export function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const testStore = configureStore({
    reducer: userRootReducer,
    preloadedState: {
      ...defaultPreloadedState,
      ...preloadedState,
    },
  });

  return render(
    <Provider store={testStore}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}
