import { describe, expect, it } from "vitest";
// Importing the store first mirrors the real start-up order and exercises the module cycle
// store -> tableListener -> tableThunks -> slices
import "../store";
import { tableLoaders } from "../thunks/tableThunks";

describe("tableLoaders", () => {
	it("are fully defined with the real store and slices", () => {
		for (const [resource, { fetch, loadIntoTable }] of Object.entries(tableLoaders)) {
			expect(typeof fetch, resource).toBe("function");
			expect(typeof fetch.fulfilled, resource).toBe("function");
			expect(typeof loadIntoTable, resource).toBe("function");
		}
	});
});
