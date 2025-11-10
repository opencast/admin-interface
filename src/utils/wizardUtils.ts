/* This method checks if the summary page is reachable.
 * If the clicked page is some other page than summary then no check is needed.
 * If the clicked page is summary then it only should be clickable/reachable if all other
 * visible pages of the wizard are valid.
 */

export const isSummaryReachable = (
	key: number,
	steps: {
		name: string,
	}[],
	completed: Record<number, boolean>,
) => {
	if (steps[key].name === "summary") {
		return Object.keys(completed).length >= steps.length - 2;
	}

	return true;
};
