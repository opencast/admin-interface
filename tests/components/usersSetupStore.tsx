import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "../../src/store"; // real root reducer
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { render } from "@testing-library/react";

export function renderWithStore(
  ui: React.ReactElement,
  preloadedState = {},
  route = "/users/",
) {
  const testStore = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  return render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
}
