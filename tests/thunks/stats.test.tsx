import { createTestStore } from "./statsSetupStore";
import { waitFor } from "@testing-library/react";
import {createServer} from '../server';
import { fetchStats } from "../../src/slices/tableFilterSlice";
import { AppDispatch } from "../../src/store";

const fakeStatsResponse = {
  scheduled: JSON.stringify({
    count: 0,
    description: "EVENTS.STATUS.SCHEDULED",
    filters: [{ filter: "status", name: "status", value: "SCHEDULED" }],
    name: "scheduled",
    order: 1,
  }),
  completed: JSON.stringify({
    count: 0,
    description: "EVENTS.STATUS.COMPLETED",
    filters: [{ filter: "status", name: "status", value: "COMPLETED" }],
    name: "completed",
    order: 2,
  }),
};

createServer([
  {
    method: "get",
    path: "/admin-ng/resources/STATS.json",
    res: () => fakeStatsResponse,
  },
  {
    method: "get",
    path: "/admin-ng/event/events.json",
    res: () => ({ total: 42, events: [] }),
  },
]);

test("fetchStats updates stats in redux store", async () => {
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
