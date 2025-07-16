import { combineReducers } from "redux";

import tableFilterReducer from "../../src/slices/tableFilterSlice";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";


const statsRootReducer = combineReducers({
 tableFilters: tableFilterReducer,
 eventReducer: (state = {}) => state,

}
)


export const createTestStore = (preloadedState = {}) => configureStore({
  reducer: statsRootReducer,
  preloadedState,
});

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
