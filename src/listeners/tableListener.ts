import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { tableClosed, tableOpened, tableReloadRequested } from "../slices/tableSlice";
import { tableLoaders } from "../thunks/tableThunks";

/**
 * Keeps the data of the table in the main view up to date.
 *
 * Components only describe *what happened* by dispatching `tableOpened`, `tableClosed` or `tableReloadRequested`
 * (see tableSlice). When and how often resources are fetched, which request is allowed to win and when requests are
 * cancelled is decided here, in one place.
 */

// How long to wait between two automatic refreshes
const AUTO_REFRESH_INTERVAL_MS = 5000;

export const tableListenerMiddleware = createListenerMiddleware();

const startAppListening = tableListenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

startAppListening({
	matcher: isAnyOf(tableOpened, tableClosed, tableReloadRequested),
	effect: async (_action, api) => {
		// Only the most recent action counts ("take latest"). This cancels
		//  - the pending delay of an earlier refresh loop, which also resets the auto refresh timer, so that auto
		//    refreshes can neither overlap with nor directly follow a reload triggered by the user, and
		//  - a request that is still in flight, so an older response can never replace newer data.
		api.cancelActiveListeners();

		// The reducer already updated this, so it is the table that is mounted right now. `null` after `tableClosed`.
		const resource = api.getState().table.openResource;
		if (!resource) {
			return;
		}

		const { fetch, loadIntoTable } = tableLoaders[resource];

		// Cancelling this listener throws at the next `await api.*` call, ending the loop
		while (true) {
			const request = api.dispatch(fetch());
			const abortRequest = () => request.abort();
			api.signal.addEventListener("abort", abortRequest, { once: true });

			try {
				const result = await api.pause(request);

				if (fetch.fulfilled.match(result)) {
					api.dispatch(loadIntoTable());
				}
			} catch (error) {
				// Cancelled: end the loop
				if (api.signal.aborted) {
					throw error;
				}
				// Anything else must not stop the auto refresh
				console.error("Failed to refresh table", error);
			} finally {
				api.signal.removeEventListener("abort", abortRequest);
			}

			await api.delay(AUTO_REFRESH_INTERVAL_MS);
		}
	},
});
