import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { FilterData } from "./tableFilterSlice";

/**
 * This file contains redux reducer for actions affecting the state of table filter profiles
 */

export type FilterProfile = {
	name: string,
	description: string,
	resource: string,
	filterMap: FilterData[]
}

type TableFilterProfilesState = {
	profiles: FilterProfile[]
}

// Initial state of filter profiles in redux store
const initialState: TableFilterProfilesState = {
	profiles: [],
};

const tableFilterProfileSlice = createSlice({
	name: "tableFilterProfiles",
	initialState,
	reducers: {
		createFilterProfile(state, action: PayloadAction<
			FilterProfile
		>) {
			const filterProfile = action.payload;
			state.profiles = state.profiles.concat(filterProfile);
		},
		editFilterProfile(state, action: PayloadAction<
			FilterProfile
		>) {
			const updatedFilterProfile = action.payload;
			state.profiles = state.profiles.map(filterProfile => {
				if (filterProfile.name === updatedFilterProfile.name) {
					return updatedFilterProfile;
				}
				return filterProfile;
			});
		},
		removeFilterProfile(state, action: PayloadAction<
			FilterProfile
		>) {
			const filterProfileToRemove = action.payload;
			state.profiles = state.profiles.filter(
									filterProfile => filterProfile.name !== filterProfileToRemove.name,
								);
		},
	},
});

export const {
	createFilterProfile,
	editFilterProfile,
	removeFilterProfile,
} = tableFilterProfileSlice.actions;

// Export the slice reducer as the default export
export default tableFilterProfileSlice.reducer;
