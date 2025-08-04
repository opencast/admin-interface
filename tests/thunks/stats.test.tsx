import { createTestStore } from "./statsSetupStore";
import { waitFor } from "@testing-library/react";
import { createServer } from "../server";
import { fetchStats } from "../../src/slices/tableFilterSlice";
import { AppDispatch } from "../../src/store";

createServer([
  {
    method: "get",
    path: "/admin-ng/resources/STATS.json",
    res: (req, res, ctx) =>
      res(
        ctx.json({
          scheduled: JSON.stringify({
            filters: [{ filter: "status", name: "status", value: "SCHEDULED" }],
            description: "EVENTS.STATUS.SCHEDULED",
            order: 1,
          }),
          completed: JSON.stringify({
            filters: [{ filter: "status", name: "status", value: "COMPLETED" }],
            description: "EVENTS.STATUS.COMPLETED",
            order: 2,
          }),
        })
      ),
  },
  {
    method: "get",
    path: "/admin-ng/event/events.json",
    res: (req, res, ctx) =>
      res(
        ctx.json({
          total: 42,
          events: [],
        })
      ),
  },
]);

it("fetchStats updates stats in redux store", async () => {
  const store = createTestStore();
  const dispatch: AppDispatch = store.dispatch;

  await dispatch(fetchStats());

  await waitFor(() => {
    const stats = store.getState().tableFilters.stats;
    expect(stats.length).toBe(2);
    expect(stats[0].count).toBe(42);
    expect(stats[1].count).toBe(42);
  });
});
