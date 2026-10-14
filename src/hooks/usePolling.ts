import { DependencyList, useEffect, useRef } from "react";

/**
 * Calls `callback` on mount and then repeatedly, waiting `intervalMs` after
 * each call has finished before starting the next one. Unlike `setInterval`,
 * this never runs overlapping calls if the callback is slower than the interval.
 *
 * Polling restarts whenever `deps` change and stops on unmount. The passed
 * `signal` is aborted at that point, so the callback can check
 * `signal.aborted` after awaiting to skip work that is no longer wanted.
 *
 * The latest `callback` is always used, so it does not need to be memoized.
 */
export const usePolling = (
	callback: (signal: AbortSignal) => Promise<unknown> | void,
	intervalMs: number,
	deps: DependencyList = [],
) => {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	});

	useEffect(() => {
		const controller = new AbortController();
		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		const poll = async () => {
			try {
				await callbackRef.current(controller.signal);
			} finally {
				// Only schedule the next call if polling was not stopped
				// while this one was running
				if (!controller.signal.aborted) {
					timeoutId = setTimeout(() => { poll(); }, intervalMs);
				}
			}
		};
		poll();

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [intervalMs, ...deps]);
};
