import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

const calls: { id: number, signal: AbortSignal }[] = [];
const loaded: number[] = [];
let resolvers: Record<number, () => void> = {};
let failLoading = false;

vi.mock("../thunks/tableThunks", async () => {
	const { createAsyncThunk } = await import("@reduxjs/toolkit");
	const fetch = createAsyncThunk("test/fetch", (_: void, { signal }) => new Promise<number>((resolve, reject) => {
		const id = calls.length;
		calls.push({ id, signal });
		resolvers[id] = () => resolve(id);
		signal.addEventListener("abort", () => reject(new Error("aborted")));
	}));
	const loadIntoTable = () => (_dispatch: unknown, getState: () => { last: number }) => {
		if (failLoading) {
			throw new Error("broken response");
		}
		loaded.push(getState().last);
	};
	return { tableLoaders: new Proxy({}, { get: () => ({ fetch, loadIntoTable }) }) };
});

import table, { tableClosed, tableOpened, tableReloadRequested } from "../slices/tableSlice";
import { tableListenerMiddleware } from "./tableListener";

const makeStore = () => configureStore({
	reducer: combineReducers({
		table,
		last: (state: number = -1, action: { type: string, payload?: unknown }) =>
			action.type === "test/fetch/fulfilled" ? action.payload as number : state,
	}),
	middleware: gdm => gdm().prepend(tableListenerMiddleware.middleware),
});

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("table listener", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		calls.length = 0;
		loaded.length = 0;
		resolvers = {};
		failLoading = false;
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("loads on open and refreshes every 5s after the previous load finished", async () => {
		const store = makeStore();
		store.dispatch(tableOpened("events"));
		await flush();
		expect(calls).toHaveLength(1);
		resolvers[0]();
		await flush();
		expect(loaded).toEqual([0]);
		await vi.advanceTimersByTimeAsync(4999);
		expect(calls).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(calls).toHaveLength(2);
		store.dispatch(tableClosed());
	});

	it("a reload cancels the request in flight and only the newest result is loaded", async () => {
		const store = makeStore();
		store.dispatch(tableOpened("events"));
		await flush();
		store.dispatch(tableReloadRequested());
		await flush();
		expect(calls[0].signal.aborted).toBe(true);
		expect(calls).toHaveLength(2);
		resolvers[1]();
		await flush();
		expect(loaded).toEqual([1]);
		store.dispatch(tableClosed());
	});

	it("restarts the auto refresh timer on reload", async () => {
		const store = makeStore();
		store.dispatch(tableOpened("events"));
		await flush();
		resolvers[0]();
		await flush();
		await vi.advanceTimersByTimeAsync(4000);
		store.dispatch(tableReloadRequested());
		await flush();
		resolvers[1]();
		await flush();
		await vi.advanceTimersByTimeAsync(4999);
		expect(calls).toHaveLength(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(calls).toHaveLength(3);
		store.dispatch(tableClosed());
	});

	it("reloads the table that is currently open", async () => {
		const store = makeStore();
		store.dispatch(tableOpened("series"));
		await flush();
		store.dispatch(tableReloadRequested());
		await flush();
		expect(calls).toHaveLength(2);
		store.dispatch(tableClosed());
		await flush();
		store.dispatch(tableReloadRequested());
		await flush();
		expect(calls).toHaveLength(2);
	});

	it("keeps refreshing after loading into the table failed", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const store = makeStore();
		failLoading = true;
		store.dispatch(tableOpened("events"));
		await flush();
		resolvers[0]();
		await flush();
		expect(consoleError).toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(5000);
		expect(calls).toHaveLength(2);
		store.dispatch(tableClosed());
		consoleError.mockRestore();
	});

	it("stops everything and loads nothing after close", async () => {
		const store = makeStore();
		store.dispatch(tableOpened("events"));
		await flush();
		store.dispatch(tableClosed());
		await flush();
		expect(calls[0].signal.aborted).toBe(true);
		await vi.advanceTimersByTimeAsync(20000);
		expect(calls).toHaveLength(1);
		expect(loaded).toEqual([]);
	});
});
