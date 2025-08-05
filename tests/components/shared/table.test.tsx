import "@testing-library/jest-dom";
import Table from "../../../src/components/shared/Table";
import {
  rootReducer,
  dummyResourceState,
  dummyReverseState,
  dummyMultiSelect,
} from "./tableSetupStore";
import { renderWithProviders } from "../../utils/setUpStore";
import type { TableState } from "../../../src/slices/tableSlice";

describe("Pagination in Table Component", () => {
  const firstPageState: { table: TableState } = {
    table: {
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
      resource: "events",
      sortBy: dummyResourceState,
      reverse: dummyReverseState,
      multiSelect: dummyMultiSelect,
      status: "loading",
      error: null,
      predicate: "",
      maxLabel: "",
    },
  };

  const secondPageState = {
    table: {
      ...firstPageState.table,
      pagination: { ...firstPageState.table.pagination, offset: 1 },
      pages: [
        { number: 0, label: "1", active: false },
        { number: 1, label: "2", active: true },
      ],
    },
  };

  it("Previous button is disabled on first page", () => {
    const { container } = renderWithProviders(<Table templateMap={{}} />, {
      reducers: rootReducer,
      preloadedState: firstPageState,
    });

    const prevButton = container.querySelector(".prev");
    const nextButton = container.querySelector(".next");

    expect(prevButton).toHaveClass("disabled");
    expect(nextButton).not.toHaveClass("disabled");
  });

  it("Next button is disabled on last page", () => {
    const { container } = renderWithProviders(<Table templateMap={{}} />, {
      reducers: rootReducer,
      preloadedState: secondPageState,
    });
    const prevButton = container.querySelector(".prev");
    const nextButton = container.querySelector(".next");

    expect(nextButton).toHaveClass("disabled");
    expect(prevButton).not.toHaveClass("disabled");
  });
});
