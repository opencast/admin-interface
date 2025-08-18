import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TableFilters from "../../../src/components/shared/TableFilters";
import { createAsyncThunk, Dispatch } from "@reduxjs/toolkit";
import { rootReducer, TestRootState } from "./tableFiltersSetupStore";
import { DeepPartial, renderWithProviders } from "../../utils/setUpStore";

const mockLoadResource = createAsyncThunk("resource/load", async () =>
  Promise.resolve(),
);
const mockLoadResourceIntoTable = () => (dispatch: Dispatch) => {}; // dummy thunk does nothing
const mockResource = "events";

describe("TableFilterText", () => {
  it("dispatches editTextFilter action when input changes", async () => {
    const user = userEvent.setup();

    // initial preloaded state with empty textFilter
    const preloadedState = {
      tableFilters: {
        data: [],
        stats: [],
        textFilter: [],
        currentResource: mockResource,
      },
    };

    const { store } = renderWithProviders<TestRootState>(
      <TableFilters
        loadResource={mockLoadResource}
        loadResourceIntoTable={mockLoadResourceIntoTable}
        resource={mockResource}
      />,
      {
        reducers: rootReducer,
        preloadedState,
      },
    );

    const input = screen.getByPlaceholderText(/Search/i);

    // Simulate typing "hello"
    await user.clear(input);
    await user.type(input, "hello");

    // Check Redux store textFilter value updated
    expect(store.getState().tableFilters.textFilter).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resource: mockResource, text: "hello" }),
      ]),
    );
  });
});
