import React from "react";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {render} from "@testing-library/react"
import { BrowserRouter } from "react-router";


const userInfoReducer = (state = {
  user: { name: "Test User" },
  roles: ["admin"],
  org: { id: "org1", properties: {} }
}, action: any) => state;

const eventsReducer = (state = {
  uploadSourceOptions: [],
  uploadAssetOptions: [],
  isFetchingAssetUploadOptions: false,
  metadata: { title: "event", flavor: "someFlavor", fields: []},
  extendedMetadata: [],
  total: 0,
}, action: any) => state;

const rootReducer = combineReducers({
  userInfo: userInfoReducer,
  events: eventsReducer,
});

export default function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = configureStore({ reducer: rootReducer, preloadedState });
  console.log("Store state on render:", store.getState());
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}
