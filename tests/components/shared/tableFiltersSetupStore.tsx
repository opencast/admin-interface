import React, { ReactNode, ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { RenderOptions } from "@testing-library/react";

import tableFilterReducer from "../../../src/slices/tableFilterSlice";
import tableFilterProfilesReducer from "../../../src/slices/tableFilterProfilesSlice";

// root reducer combining actual reducers
export const rootReducer = {
  tableFilters: tableFilterReducer,
  tableFilterProfiles: tableFilterProfilesReducer,
};

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

function renderWithProviders(
  ui: ReactElement,
  {
    storeInstance,
    preloadedState,
    ...renderOptions
  }: {
    storeInstance?: EnhancedStore;
    preloadedState?: any;
  } & RenderOptions = {}
) {
  const store = storeInstance ?? createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export default renderWithProviders;
