import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import {
	getFilters,
	getSecondFilter,
	getSelectedFilter,
	getTextFilter,
} from "../../selectors/tableFilterSelectors";
import {
	FilterData,
	editFilterValue,
	editSelectedFilter,
	editTextFilter,
	removeSecondFilter,
	removeSelectedFilter,
	removeTextFilter,
	resetFilterValues,
} from "../../slices/tableFilterSlice";
import {
	goToPage,
} from "../../thunks/tableThunks";
import TableFilterProfiles from "./TableFilterProfiles";
import { availableHotkeys } from "../../configs/hotkeysConfig";
import { useHotkeys } from "react-hotkeys-hook";
import moment from "moment";
import { AppThunk, useAppDispatch, useAppSelector } from "../../store";
import { renderValidDate } from "../../utils/dateUtils";
import { getCurrentLanguageInformation } from "../../utils/utils";
import DropDown from "./DropDown";
import { AsyncThunk } from "@reduxjs/toolkit";
import ButtonLikeAnchor from "./ButtonLikeAnchor";
import { ParseKeys } from "i18next";
import SearchContainer from "./SearchContainer";
import { Resource } from "../../slices/tableSlice";
import { HiFunnel } from "react-icons/hi2";
import { LuSettings, LuX } from "react-icons/lu";

/**
 * This component renders the table filters in the upper right corner of the table
 */
const TableFilters = ({
	loadResource,
	loadResourceIntoTable,
	resource,
}: {
	loadResource: AsyncThunk<any, void, any>,
	loadResourceIntoTable: () => AppThunk,
	resource: Resource,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const filterMap = useAppSelector(state => getFilters(state, resource));
	const secondFilter = useAppSelector(state => getSecondFilter(state));
	const selectedFilter = useAppSelector(state => getSelectedFilter(state));
	const textFilter = useAppSelector(state => getTextFilter(state, resource));

	// Variables for showing different dialogs depending on what was clicked
	const [showFilterSelector, setFilterSelector] = useState(false);
	const [showFilterSettings, setFilterSettings] = useState(false);
	const [itemValue, setItemValue] = React.useState("");
	const [openSecondFilterMenu, setOpenSecondFilterMenu] = useState(false);

	// Variables containing selected start date and end date for date filter
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	const filter = filterMap.find(({ name }) => name === selectedFilter);

	// Remove all selected filters, no filter should be "active" anymore
	const removeFilters = async () => {
		// Clear state
		setStartDate(undefined);
		setEndDate(undefined);
		setFilterSelector(false);

		dispatch(removeTextFilter(resource));
		dispatch(removeSelectedFilter());
		dispatch(removeSelectedFilter());

		// Set all values of the filters in filterMap back to ""
		dispatch(resetFilterValues());

		// Reload resources when filters are removed
		await dispatch(loadResource());
		dispatch(loadResourceIntoTable());
	};

	// Remove a certain filter
	const removeFilter = async (filter: FilterData) => {
		if (filter.name === "startDate") {
			// Clear state
			setStartDate(undefined);
			setEndDate(undefined);
		}

		dispatch(editFilterValue({ filterName: filter.name, value: "", resource }));

		// Reload resources when filter is removed
		await dispatch(loadResource());
		dispatch(loadResourceIntoTable());
	};

	const handleSearchChange = (value: string) => {
		handleChange("textFilter", value);
	};

	const clearSearchField = () => {
		dispatch(removeTextFilter(resource));
	};

	// Handle changes when an item of the component is changed
	const handleChange = (name: string, value: string) => {
		let mustApplyChanges = false;
		if (name === "textFilter") {
			dispatch(editTextFilter({ text: value, resource: resource }));
			mustApplyChanges = true;
		}

		if (name === "selectedFilter") {
			dispatch(editSelectedFilter(value));
			setOpenSecondFilterMenu(true);
		}

		// If the change is in secondFilter (filter is picked) then the selected value is saved in filterMap
		// and the filter selections are cleared
		if (name === "secondFilter") {
			const filter = filterMap.find(({ name }) => name === selectedFilter);
			if (filter) {
				dispatch(editFilterValue({ filterName: filter.name, value: value, resource }));
				setFilterSelector(false);
				dispatch(removeSelectedFilter());
				dispatch(removeSecondFilter());
				setOpenSecondFilterMenu(false);
				mustApplyChanges = true;
			}
		}

		if (mustApplyChanges) {
			setItemValue(value);
		}
	};

	// Apply the filter changes (in debounced) accomulated in handleChange,
	// simply by going to first page and then load resources.
	// This helps increase performance by reducing the number of calls to load resources.
	const applyFilterChangesDebounced = async () => {
		// No matter what, we go to page one.
		dispatch(goToPage(0));
		// Reload of resource
		await dispatch(loadResource());
		dispatch(loadResourceIntoTable());
	};

	useEffect(() => {
		if (itemValue) {
			// Call to apply filter changes with 500MS debounce!
			const applyFilterChangesDebouncedTimeoutId = setTimeout(applyFilterChangesDebounced, 500);

			return () => clearTimeout(applyFilterChangesDebouncedTimeoutId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemValue]);

	const handleDatepicker = (dates?: [Date | undefined | null, Date | undefined | null]) => {
		if (dates != null) {
			const [start, end] = dates;

			start?.setHours(0);
			start?.setMinutes(0);
			start?.setSeconds(0);
			end?.setHours(23);
			end?.setMinutes(59);
			end?.setSeconds(59);

			submitDateFilter(start, end);

			if (start) {
				setStartDate(start);
			}
			if (end) {
				setEndDate(end);
			}
		}
	};

	// Workaround for entering a date range by only entering one date
	// (e.g. 01/01/2025 results in a range of 01/01/2025 - 01/01/2025)
	const handleDatePickerOnKeyDown = (keyEvent: React.KeyboardEvent<HTMLElement>) => {
		if (keyEvent.key === "Enter") {
			const end = endDate ?? (startDate ? new Date(startDate) : undefined);
			end?.setHours(23);
			end?.setMinutes(59);
			end?.setSeconds(59);

			submitDateFilter(
				startDate,
				end,
			);
		}
	};

	const submitDateFilter = async (start: Date | undefined | null, end: Date | undefined | null) => {
		if (start && end && moment(start).isValid() && moment(end).isValid()) {
			const filter = filterMap.find(({ name }) => name === selectedFilter);
			if (filter) {
				dispatch(editFilterValue({
					filterName: filter.name,
					value: start.toISOString() + "/" + end.toISOString(),
					resource,
				}));
				setFilterSelector(false);
				dispatch(removeSelectedFilter());
				// Reload of resource after going to very first page.
				dispatch(goToPage(0));
				await dispatch(loadResource());
				dispatch(loadResourceIntoTable());
			}
		}
	};

	useHotkeys(
    availableHotkeys.general.REMOVE_FILTERS.sequence,
    () => removeFilters(),
		{ description: t(availableHotkeys.general.REMOVE_FILTERS.description) ?? undefined },
    [removeFilters],
  );

	const renderBlueBox = (filter: FilterData) => {
		const valueLabel = filter.options?.find(opt => opt.value === filter.value)
			?.label || filter.value;
		return (
			<span className="table-filter-blue-box">
				{t(filter.label as ParseKeys)}:
				{filter.translatable ? t(valueLabel as ParseKeys) : valueLabel}
			</span>
		);
	};

	const getSelectedFilterText = () => {
		return filter?.label ? t(filter.label as ParseKeys) : selectedFilter;
	};

	return (
		<>
			<div className="filters-container">
				{/* Text filter - Search Query */}
				<SearchContainer
					value={textFilter}
					handleChange={handleSearchChange}
					clearSearchField={clearSearchField}
					isExpand={true}
				/>

				{/* Selection of filters and management of filter profiles*/}
				{/* show only if filters.filters contains filters*/}
				{!!filterMap && (
					<div className="table-filter">
						<div className="filters">
							<ButtonLikeAnchor
								onClick={() => setFilterSelector(!showFilterSelector)}
								tooltipText="TABLE_FILTERS.ADD"
								style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
							>
								<HiFunnel style={{ fontSize: "13px", color: "#666" }}/>
							</ButtonLikeAnchor>

							{/* show if icon is clicked*/}
							{showFilterSelector && (
								/* Show all filtersMap as selectable options*/
								<DropDown
									value={selectedFilter}
									text={getSelectedFilterText()}
									options={
										!!filterMap && filterMap.length > 0
											? filterMap.filter(
													filter => filter.name !== "presentersBibliographic",
												)
												.sort((a, b) => t(a.label as ParseKeys).localeCompare(t(b.label as ParseKeys))) // Sort alphabetically
												.map(filter => {
													return {
														value: filter.name,
														label: t(filter.label as ParseKeys).substr(0, 40),
													};
												})
											: []
									}
									required={true}
									handleChange={element => handleChange("selectedFilter", element!.value)}
									placeholder={
										!!filterMap && filterMap.length > 0
											? t(
												"TABLE_FILTERS.FILTER_SELECTION.PLACEHOLDER",
												)
											: t(
												"TABLE_FILTERS.FILTER_SELECTION.NO_OPTIONS",
												)
									}
									defaultOpen
									autoFocus
									openMenuOnFocus
									customCSS={{ width: 200, optionPaddingTop: 5 }}
								/>
							)}

							{/* Show selection of secondary filter if a main filter is chosen*/}
							{!!selectedFilter && (
								<div>
									{/* Show the secondary filter depending on the type of main filter chosen (select or period)*/}
									<FilterSwitch
										filter={filter}
										secondFilter={secondFilter}
										startDate={startDate}
										endDate={endDate}
										handleDate={handleDatepicker}
										handleDatePickerOnKeyDown={handleDatePickerOnKeyDown}
										handleChange={handleChange}
										openSecondFilterMenu={openSecondFilterMenu}
										setOpenSecondFilterMenu={setOpenSecondFilterMenu}
									/>
								</div>
							)}

							{/* Show for each selected filter a blue label containing its name and option */}
							{filterMap.map((filter, key) => {
								return filter.value && (
									<span className="ng-multi-value" key={key}>
										{
											// Use different representation of name and value depending on type of filter
											filter.type === "period" ? (
												<span className="table-filter-blue-box">
													{t(filter.label as ParseKeys)}:
													{t("dateFormats.date.short", {
														date: renderValidDate(filter.value.split("/")[0]),
													})}
													-
													{t("dateFormats.date.short", {
														date: renderValidDate(filter.value.split("/")[1]),
													})}
												</span>
											) : (
												renderBlueBox(filter)
											)
										}
										{/* Remove icon in blue area around filter */}
										<ButtonLikeAnchor
											onClick={() => removeFilter(filter)}
											tooltipText="TABLE_FILTERS.REMOVE"
											style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
										>
											<LuX />
										</ButtonLikeAnchor>
									</span>
								);
							})}
						</div>

						{/* Remove icon to clear all filters */}
						{filterMap.some(e => e.value) &&
							<ButtonLikeAnchor
								onClick={removeFilters}
								tooltipText="TABLE_FILTERS.CLEAR"
								style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px 0 0" }}
							>
								<LuX style={{ color: "#666" }}/>
							</ButtonLikeAnchor>
						}
						{/* Settings icon to open filters profile dialog (save and editing filter profiles)*/}
						<ButtonLikeAnchor
							onClick={() => setFilterSettings(!showFilterSettings)}
							tooltipText="TABLE_FILTERS.PROFILES.FILTERS_HEADER"
							style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px 0 0" }}
						>
							<LuSettings className="settings" style={{ color: "#666" }}/>
						</ButtonLikeAnchor>

						{/* Filter profile dialog for saving and editing filter profiles */}
						<TableFilterProfiles
							showFilterSettings={showFilterSettings}
							setFilterSettings={setFilterSettings}
							resource={resource}
							loadResource={loadResource}
							loadResourceIntoTable={loadResourceIntoTable}
						/>
					</div>
				)}
			</div>
		</>
	);
};

/*
 * Component for rendering the selection of options for the secondary filter
 * depending on the the type of the main filter. These types can be select or period.
 * In case of select, a second selection is shown. In case of period, datepicker are shown.
 */
const FilterSwitch = ({
	filter,
	handleChange,
	handleDatePickerOnKeyDown,
	startDate,
	endDate,
	handleDate,
	secondFilter,
	openSecondFilterMenu,
	setOpenSecondFilterMenu,
} : {
	filter: FilterData | undefined,
	handleChange: (name: string, value: string) => void,
	handleDatePickerOnKeyDown: (keyEvent: React.KeyboardEvent<HTMLElement>) => void,
	startDate: Date | undefined,
	endDate: Date | undefined,
	handleDate: (dates: [Date | undefined | null, Date | undefined | null]) => void,
	secondFilter: string,
	openSecondFilterMenu: boolean,
	setOpenSecondFilterMenu: (open: boolean) => void,
}) => {
	const { t } = useTranslation();

	if (!filter) {
		return null;
	}

	switch (filter.type) {
		case "select":
			return (
				<div>
					{/* Show further options for a secondary filter */}
					<DropDown
						value={secondFilter}
						text={secondFilter}
						options={
							!!filter.options && filter.options.length > 0
								? filter.options.map(option => {
									if (!filter.translatable) {
										return {
											...option,
											label: option.label.substr(0, 40),
										};
									} else {
										return {
											...option,
											label: t(option.label as ParseKeys).substr(0, 40),
										};
									}
								})
								: []
						}
						required={true}
						handleChange={element => handleChange("secondFilter", element!.value)}
						placeholder={
							!!filter.options && filter.options.length > 0
								? t(
									"TABLE_FILTERS.FILTER_VALUE_SELECTION.PLACEHOLDER",
									)
								: t(
									"TABLE_FILTERS.FILTER_SELECTION.NO_OPTIONS",
									)
						}
						autoFocus
						defaultOpen
						openMenuOnFocus
						menuIsOpen={openSecondFilterMenu}
						handleMenuIsOpen={setOpenSecondFilterMenu}
						skipTranslate={!filter.translatable}
						customCSS={{ width: 200, optionPaddingTop: 5 }}
					/>
				</div>
			);
		case "period":
			return (
				<div>
					<DatePicker
						startOpen
						autoFocus
						selected={startDate}
						onChange={dates => handleDate(dates)}
						onKeyDown={key => handleDatePickerOnKeyDown(key)}
						startDate={startDate}
						endDate={endDate}
						selectsRange
						showYearDropdown
						showMonthDropdown
						yearDropdownItemNumber={2}
						swapRange
						allowSameDay
						dateFormat="P"
						popperPlacement="bottom"
						popperClassName="datepicker-custom"
						className="datepicker-custom-input"
						locale={getCurrentLanguageInformation()?.dateLocale}
						strictParsing
					/>
				</div>
			);
    // This should never happen
    default:
      return null;
	}
};

export default TableFilters;
