import React, { ReactNode, ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { RenderOptions } from "@testing-library/react";

export const rootReducer = {
  table: () => ({
    rows: [],
    columns: [],
    pagination: {
      offset: 0,
      limit: 10,
      totalItems: 20,
      directAccessibleNo: 5,
    },
    pages: [
      { number: 0, label: "1", active: true },
      { number: 1, label: "2", active: false },
    ],
    resource: "default",
    sortBy: {},
    reverse: {},
    multiSelect: {},
    status: "idle",
  }),
  notifications: () => ({
    notifications: [],
  }),
};

export const store = configureStore({
  reducer: rootReducer,
});

function renderWithProviders(
  ui: ReactElement,
  {
    storeInstance = store,
    ...renderOptions
  }: { storeInstance?: EnhancedStore } & RenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={storeInstance}>{children}</Provider>;
  }

  return {
    store: storeInstance,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export default renderWithProviders;
