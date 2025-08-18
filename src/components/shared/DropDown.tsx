import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	dropDownSpacingTheme,
	dropDownStyle,
} from "../../utils/componentStyles";
import { GroupBase, MenuListProps, Props, SelectInstance, createFilter } from "react-select";
import { isJson } from "../../utils/utils";
import { ParseKeys } from "i18next";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";

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
	options: DropDownOption[],
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
	fetchOptions?: () => { label: string, value: string}[]
}) => {
	const { t } = useTranslation();

	const selectRef = ref;

	const style = dropDownStyle(customCSS ?? {});

	useEffect(() => {
		// Ensure menu has focus when opened programmatically
		if (menuIsOpen) {
			selectRef.current?.focus();
		}
	}, [menuIsOpen, selectRef]);

	const openMenu = (open: boolean) => {
		if (handleMenuIsOpen !== undefined) {
			handleMenuIsOpen(open);
		}
	};

	const formatOptions = (
		unformattedOptions: DropDownOption[],
		required: boolean,
	) => {
		// Translate
		// Translating is expensive, skip it if it is not required
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
	};

	const itemHeight = optionHeight;
	/**
	 * Custom component for list virtualization
	 */
	const MenuList = (props: MenuListProps<DropDownOption, false>) => {
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
	};

	const loadOptions = (
		_inputValue: string,
		callback: (options: DropDownOption[]) => void,
	) => {
		callback(formatOptions(
			fetchOptions ? fetchOptions() : options,
			required,
		));
	};


  const commonProps: Props = {
		tabIndex: tabIndex,
		theme: theme => (dropDownSpacingTheme(theme)),
		styles: style,
		defaultMenuIsOpen: defaultOpen,
		autoFocus: autoFocus,
		isSearchable: true,
		value: { value: value, label: text === "" ? placeholder : text },
		options: formatOptions(
			options,
			required,
		),
		placeholder: placeholder,
		onChange: element => handleChange(element as {value: T, label: string}),
		menuIsOpen: menuIsOpen,
		onMenuOpen: () => openMenu(true),
		onMenuClose: () => openMenu(false),
		isDisabled: disabled,
		openMenuOnFocus: openMenuOnFocus,
		menuPlacement: menuPlacement ?? "auto",

		// @ts-expect-error: React-Select typing does not account for the typing of option it itself requires
		components: { MenuList },
		filterOption: createFilter({ ignoreAccents: false }), // To improve performance on filtering
	};

	return creatable ? (
		<AsyncCreatableSelect
			ref={selectRef}
			{...commonProps}
			cacheOptions
			defaultOptions={formatOptions(
				options,
				required,
			)}
			loadOptions={loadOptions}
		/>
	) : (
		<AsyncSelect
			ref={selectRef}
			{...commonProps}
			noOptionsMessage={() => t("SELECT_NO_MATCHING_RESULTS")}
			cacheOptions
			defaultOptions={formatOptions(
				options,
				required,
			)}
			loadOptions={loadOptions}
		/>
	);
};

export default DropDown;
