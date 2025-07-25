import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderWithProviders from './tableFiltersSetupStore';
import TableFilters from '../../../src/components/shared/TableFilters';
import { createAsyncThunk } from '@reduxjs/toolkit';

const mockLoadResource = createAsyncThunk('resource/load', async () => Promise.resolve());
const mockLoadResourceIntoTable = () => (dispatch:any) => {}; // dummy thunk does nothing
const mockResource = "events";

describe('TableFilterText', () => {
  it('dispatches editTextFilter action when input changes', async () => {
    const user = userEvent.setup();

    // initial preloaded state with empty textFilter
    const preloadedState = {
      tableFilters: {
        data: [],
        stats: [],
        textFilter: [],
        selectedFilter: "",
        secondFilter: "",
        currentResource: mockResource,
      },
    tableFilterProfiles: {
    profiles: [],
  },
    };

    const { store } = renderWithProviders(
      <TableFilters
        loadResource={mockLoadResource}
        loadResourceIntoTable={mockLoadResourceIntoTable}
        resource={mockResource}
      />,
      { preloadedState }
    );

    const input = screen.getByPlaceholderText(/Search/i);

    // Simulate typing "hello"
    await user.clear(input);
    await user.type(input, 'hello');

    // Check Redux store textFilter value updated
    expect(store.getState().tableFilters.textFilter).toEqual(
    expect.arrayContaining([
    expect.objectContaining({ resource: mockResource, text: 'hello' }),
  ])
);
  });
});
