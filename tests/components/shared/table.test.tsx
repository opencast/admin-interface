import "@testing-library/jest-dom";
import type { TemplateMap } from "../../../src/components/shared/Table";
import Table from "../../../src/components/shared/Table";
import {
  rootReducer,
  dummyResourceState,
  dummyReverseState,
  dummyMultiSelect,
  TestRootState,
} from "./tableSetupStore";
import { DeepPartial, renderWithProviders } from "../../utils/setUpStore";
import type { Row, TableState } from "../../../src/slices/tableSlice";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";
import { User } from "../../../src/slices/userSlice";

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

      vi.mock("../../../src/thunks/tableThunks.ts", () => ({
        calculatePages: vi.fn(() => []), // existing
        changeAllSelected: vi.fn((value: boolean) => ({ type: "table/changeAllSelected", payload: value })), // existing
        updatePages: vi.fn(() => ({ type: "table/updatePages" })), // add this
      }));

      const sortingState : DeepPartial<TestRootState> = {
        table: {
          columns: [{ name: "name", sortable: true, label: "USERS.ACLS.TABLE.NAME" }],
          rows: [
            { selected: false, name: "Charlie" } as Row,
            { selected: false, name: "Alice" } as Row,
            { selected: false, name: "Bob" } as Row,
          ],
          resource: "users",
          sortBy: { users: "name" },
          reverse: { users: "ASC" },
          pagination: {
            offset: 0,
            limit: 10,
            totalItems: 3,
            directAccessibleNo: 5,
          },
         pages: [
            { number: 0, label: "1", active: true },
            { number: 1, label: "2", active: false },
          ],
          multiSelect: { users: false },
        },
        users: {
          results: [
            {
              name: "Charlie",
              manageable: false,
              provider: "",
              roles: [],
              username: "",
            },
            {
              name: "Alice",
              manageable: false,
              provider: "",
              roles: [],
              username: "",
            },
            {
              name: "Bob",
              manageable: false,
              provider: "",
              roles: [],
              username: "",
            },
          ],
        },
      };
      it("sorts table rows ascending then descending by clicking header", async () => {
          const templateMap: TemplateMap = {
         Name: ({ row }: { row: Row }) => <>{(row as User).name}</>,
        };

        const { getByText, container } = renderWithProviders(
          <Table templateMap={templateMap} />,
          {
            reducers: rootReducer,
            preloadedState: sortingState, // contains Alice, Bob, Charlie
          },
        );

        const nameHeader = getByText("Name");

        // Click header → ascending
        await userEvent.click(nameHeader);

        await waitFor(() => {
          const rowsAfterAsc = container.querySelectorAll("tbody tr");
          const rowTextsAsc = Array.from(rowsAfterAsc)
            .map(r => r.textContent)
            .join();
          expect(rowTextsAsc).toContain("Alice");
          expect(rowTextsAsc).toContain("Bob");
          expect(rowTextsAsc).toContain("Charlie");
        });

        // Click again → descending
        await userEvent.click(nameHeader);

        await waitFor(() => {
          const rowsAfterDesc = container.querySelectorAll("tbody tr");
          const rowTextsDesc = Array.from(rowsAfterDesc)
            .map(r => r.textContent)
            .join();
          expect(rowTextsDesc).toContain("Charlie");
          expect(rowTextsDesc).toContain("Bob");
          expect(rowTextsDesc).toContain("Alice");
        });
      });
