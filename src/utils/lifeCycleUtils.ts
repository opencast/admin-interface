import { TargetFilter } from "../slices/lifeCycleSlice";

export function parseTargetFiltersForSubmit(
  transformed: { [key: string]: (TargetFilter & { filter: string })[] },
): { [key: string]: { [key: string]: TargetFilter } } {
  const result: { [key: string]: { [key: string]: TargetFilter } } = {};

  for (const outerKey in transformed) {
    const list = transformed[outerKey];
    const innerMap: { [key: string]: TargetFilter } = {};

    for (const item of list) {
      const { filter, ...rest } = item;
      innerMap[filter] = rest;
    }

    result[outerKey] = innerMap;
  }

  return result;
}

export function parseTargetFiltersForEditing(
	targetFilters: { [key: string]: { [key: string]: TargetFilter } },
): { [key: string]: (TargetFilter & { filter: string })[] } {
	const result: { [key: string]: (TargetFilter & { filter: string })[] } = {};

	for (const outerKey in targetFilters) {
		const innerMap = targetFilters[outerKey];

		result[outerKey] = Object.entries(innerMap).map(([innerKey, filterObj]) => ({
			...filterObj,
			filter: innerKey,
		}));
	}

	return result;
};
