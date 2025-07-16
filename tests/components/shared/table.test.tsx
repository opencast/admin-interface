import "@testing-library/jest-dom";
import Table from "../../../src/components/shared/Table";
import renderWithProviders, {store, rootReducer} from "./tableSetupStore";
import { combineReducers } from "@reduxjs/toolkit";

describe('Pagination in Table Component', () => {

it("Previous button is disabled on first page", () => {
  const { container } = renderWithProviders(
  <Table templateMap={{}} />
  );

  const prevButton = container.querySelector(".prev");
  const nextButton = container.querySelector(".next");

  expect(prevButton).toHaveClass("disabled");
  expect(nextButton).not.toHaveClass("disabled");
});


  it("Next button is disabled on last page", () => {
  store.replaceReducer(
    combineReducers({
    ...rootReducer,
    table: () => ({
      ...rootReducer.table(),
      pagination: {
        ...rootReducer.table().pagination,
        offset: 1,
      },
      pages: [
        { number: 0, label: "1", active: false },
        { number: 1, label: "2", active: true },
      ],
    }),
  })
);

    const { container } = renderWithProviders(<Table templateMap={{}} />, { storeInstance: store });
    const prevButton = container.querySelector(".prev");
    const nextButton = container.querySelector(".next");

    expect(nextButton).toHaveClass("disabled");
    expect(prevButton).not.toHaveClass("disabled");
  });
})

