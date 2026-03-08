import React, { useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	dropDownSpacingTheme,
	dropDownStyle,
} from "../../utils/componentStyles";
import { GroupBase, MenuListProps, Props, SelectInstance } from "react-select";
import { isJson } from "../../utils/utils";
import { ParseKeys } from "i18next";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import Select from "react-select";

export type DropDownOption = {
	label: string,
	value: string | number,
	order?: number
}

/**
 * This component renders a dropdown menu using react-select
 */
const DropDown = <T, >({
	ref = React.createRef<SelectInstance<any, boolean, GroupBase<any>>>(),
	value,
	text,
	options,
	required,
	handleChange,
	placeholder,
	tabIndex = 0,
	autoFocus = false,
	defaultOpen = false,
	openMenuOnFocus = false,
	creatable = false,
	disabled = false,
	menuIsOpen = undefined,
	menuPlacement = "auto",
	handleMenuIsOpen = undefined,
	skipTranslate = false,
	optionHeight = 25,
	customCSS,
	fetchOptions,
}: {
	ref?: React.RefObject<SelectInstance<any, boolean, GroupBase<any>> | null>
	value: T
	text: string,
	options?: DropDownOption[],
	required: boolean,
	handleChange: (option: {value: T, label: string} | null) => void
	placeholder: string
	tabIndex?: number,
	autoFocus?: boolean,
	defaultOpen?: boolean,
	openMenuOnFocus?: boolean,
	creatable?: boolean,
	disabled?: boolean,
	menuIsOpen?: boolean,
	handleMenuIsOpen?: (open: boolean) => void,
	menuPlacement?: "auto" | "top" | "bottom",
	skipTranslate?: boolean,
	optionHeight?: number,
	customCSS?: {
		isMetadataStyle?: boolean,
		width?: number | string,
		optionPaddingTop?: number,
		optionLineHeight?: string
	},
	fetchOptions?: (inputValue: string) => Promise<{ label: string, value: string }[]>
}) => {
	const { t } = useTranslation();

	const selectRef = ref;

	const style = dropDownStyle(customCSS ?? {});

	// ──────────────────────────────────────────────────────────────
	// Stable helpers
	// ──────────────────────────────────────────────────────────────
	const formatOptions = useCallback((
		unformattedOptions: DropDownOption[],
		required: boolean,
	) => {
		// Translate (expensive, skip if not required)
		if (!skipTranslate) {
			unformattedOptions = unformattedOptions.map(option => ({ ...option, label: t(option.label as ParseKeys) }));
		}

		// Add "No value" option
		if (!required) {
			unformattedOptions.push({
				value: "",
				label: `-- ${t("SELECT_NO_OPTION_SELECTED")} --`,
			});
		}

		// Sort
		/**
		 * This is used to determine whether any entry of the passed `unformattedOptions`
		 * contains an `order` field, indicating that a custom ordering for that list
		 * exists and the list therefore should not be ordered alphabetically.
		 */
		const hasCustomOrder = unformattedOptions.every(item => {
			if (!isJson(item.label)) {
				return false;
			}
			// TODO: Handle JSON parsing errors
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const parsed = JSON.parse(item.label);
			return parsed && typeof parsed === "object" && "order" in parsed;
		});

		if (hasCustomOrder) {
			// Apply custom ordering.
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			unformattedOptions.sort((a, b) => JSON.parse(a.label).order - JSON.parse(b.label).order);
		} else {
			// Apply alphabetical ordering.
			unformattedOptions.sort((a, b) => a.label.localeCompare(b.label));
		}

		return unformattedOptions;
	}, [t, skipTranslate]);

	const filterOptions = useCallback((inputValue: string) => {
		if (options) {
			return options.filter(option =>
				option.label.toLowerCase().includes(inputValue.toLowerCase()),
			);
		}
		return [];
	}, [options]);

	const formattedOptions = useMemo(() => {
		return options ? formatOptions(options, required) : [];
	}, [options, required, formatOptions]);

	const loadOptions = useCallback((
		_inputValue: string,
		callback: (options: DropDownOption[]) => void,
	) => {
		callback(formatOptions(filterOptions(_inputValue), required));
	}, [formatOptions, filterOptions, required]);

	const loadOptionsAsync = useCallback((
		inputValue: string,
		callback: (options: DropDownOption[]) => void,
	) => {
		if (!fetchOptions) return;
		fetchOptions(inputValue).then(fetched => {
			callback(formatOptions(fetched, required));
		});
	}, [fetchOptions, required, formatOptions]);

	// ──────────────────────────────────────────────────────────────
	// Full stabilization — this stops the jump (MenuList, commonProps, value, callbacks)
	// ──────────────────────────────────────────────────────────────
	const itemHeight = optionHeight;
	/**
	 * Custom component for list virtualization
	 */
	const MenuList = useMemo(() => (props: MenuListProps<DropDownOption, false>) => {
		const { children, maxHeight } = props;

		console.log("Menu List render");

		return Array.isArray(children) ? (
			<div style={{ paddingTop: 4 }}>
				<FixedSizeList
					height={maxHeight < (children.length * itemHeight) ? maxHeight : children.length * itemHeight}
					itemCount={children.length}
					itemSize={itemHeight}
					overscanCount={4}
					width="100%"
				>
					{({ index, style }: ListChildComponentProps) => <div style={{ ...style }}>{children[index]}</div>}
				</FixedSizeList>
			</div>
		) : null;
	}, [itemHeight]);

	const selectValue = useMemo(() => ({
		value,
		label: text === "" ? placeholder : text,
	}), [value, text, placeholder]);

	const onChangeCallback = useCallback((element: any) => {  // kept internal cast pattern from original file
		handleChange(element as {value: T, label: string});
	}, [handleChange]);

	const openMenuCallback = useCallback((open: boolean) => {
		if (handleMenuIsOpen !== undefined) {
			handleMenuIsOpen(open);
		}
	}, [handleMenuIsOpen]);

	const commonProps = useMemo(() => ({
		tabIndex,
		theme: theme => dropDownSpacingTheme(theme),  // no type — matches original file exactly
		styles: style,
		defaultMenuIsOpen: defaultOpen,
		autoFocus,
		isSearchable: true,
		value: selectValue,
		defaultOptions: formattedOptions,
		cacheOptions: true,
		loadOptions: fetchOptions ? loadOptionsAsync : loadOptions,
		placeholder,
		onChange: onChangeCallback,
		menuIsOpen,
		onMenuOpen: openMenuCallback,
		onMenuClose: openMenuCallback,
		isDisabled: disabled,
		openMenuOnFocus,
		menuPlacement: menuPlacement ?? "auto",
		components: { MenuList },
	}), [
		tabIndex, style, defaultOpen, autoFocus, selectValue, formattedOptions,
		placeholder, onChangeCallback, menuIsOpen, openMenuCallback, disabled,
		openMenuOnFocus, menuPlacement, fetchOptions, loadOptionsAsync, loadOptions, MenuList,
	]);

	useEffect(() => {
		if (menuIsOpen) {
			selectRef.current?.focus();
		}
	}, [menuIsOpen, selectRef]);

	const commonProps = useMemo(() => ({
		tabIndex,
		theme: theme => dropDownSpacingTheme(theme),
		styles: style,
		defaultMenuIsOpen: defaultOpen,
		autoFocus,
		isSearchable: true,
		value: selectValue,
		defaultOptions: formattedOptions,
		cacheOptions: true,
		loadOptions: fetchOptions ? loadOptionsAsync : loadOptions,
		placeholder,
		onChange: onChangeCallback,
		menuIsOpen,
		onMenuOpen: openMenuCallback,
		onMenuClose: openMenuCallback,
		isDisabled: disabled,
		openMenuOnFocus,
		menuPlacement: menuPlacement ?? "auto",
		components: { MenuList },
	}), [tabIndex, style, defaultOpen, autoFocus, selectValue, formattedOptions, placeholder, onChangeCallback, menuIsOpen, openMenuCallback, disabled, openMenuOnFocus, menuPlacement, fetchOptions, loadOptionsAsync, loadOptions, MenuList]);

	return creatable ? (
		<AsyncCreatableSelect
			ref={selectRef}
			{...commonProps}
		/>
	) : fetchOptions ? (
		<AsyncSelect
			ref={selectRef}
			{...commonProps}
			openMenuOnFocus={false}
			noOptionsMessage={() => t("SELECT_NO_MATCHING_RESULTS")}
		/>
	) : (
		<Select
			ref={selectRef}
			{...commonProps}
			options={formattedOptions}
			openMenuOnFocus={false}
			noOptionsMessage={() => t("SELECT_NO_MATCHING_RESULTS")}
		/>
	);
};

export default DropDown;
