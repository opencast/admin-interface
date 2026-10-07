import React, { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	dropDownSpacingTheme,
	dropDownStyle,
} from "../../utils/componentStyles";
import {
	components as SelectComponents,
	GroupBase,
	MenuListProps,
	OptionProps,
	SelectInstance,
	ValueContainerProps,
} from "react-select";
import { ParseKeys } from "i18next";
import { List, RowComponentProps } from "react-window";
import AsyncSelect, { AsyncProps } from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";

export type DropDownOption<T> = {
	label: string,
	value: T | "",
	order?: number
}

// How long to wait after the user stops typing before firing a fetchOptions() search request.
const SEARCH_DEBOUNCE_MS = 300;

function MenuListRow({
	index,
	names,
	style,
}: RowComponentProps<{
	names: string[];
}>) {
	const name = names[index];
	return <div style={style}>{name}</div>;
}

/**
 * This component renders a dropdown menu using react-select
 */
const DropDown = <T, >({
	ref,
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
	ref?: React.RefObject<SelectInstance<DropDownOption<T>, boolean, GroupBase<DropDownOption<T>>> | null>
	value: T
	text: string,
	options?: DropDownOption<T>[],
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
	fetchOptions?: (inputValue: string) => Promise<DropDownOption<T>[]>
}) => {
	const { t } = useTranslation();

	const internalRef = useRef<SelectInstance<DropDownOption<T>, boolean, GroupBase<DropDownOption<T>>> | null>(null);
	const selectRef = ref ?? internalRef;

	const style = dropDownStyle<T>(customCSS ?? {});

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
		unformattedOptions: DropDownOption<T>[],
		required: boolean,
	) => {
		// Translate
		// Translating is expensive, skip it if it is not required.
		// Either way, copy the array so the input is not transmuted later.
		unformattedOptions = skipTranslate
			? [...unformattedOptions]
			: unformattedOptions.map(option => ({ ...option, label: t(option.label as ParseKeys) }));

		// Add "No value" option
		if (!required) {
			unformattedOptions.push({
				value: "",
				label: `-- ${t("SELECT_NO_OPTION_SELECTED")} --`,
				order: 0,
			});
		}

		// Sort
		/**
		 * This is used to determine whether every entry of the passed `unformattedOptions`
		 * contains an `order` field, indicating that a custom ordering for that list
		 * exists and the list therefore should not be ordered alphabetically.
		 */
		const hasCustomOrder = unformattedOptions.every(item => {
			return item.order !== undefined;
		});

		if (hasCustomOrder) {
			// Apply custom ordering.
			unformattedOptions.sort((a, b) => a.order! - b.order!);
		} else {
			// Apply alphabetical ordering.
			unformattedOptions.sort((a, b) => a.label.localeCompare(b.label));
		}

		return unformattedOptions;
	};

	/**
	 * Wrapper that adds the title attribute to options, which should result
	 * in a native tooltip that is intended to help with very long labels.
	 */
	const OptionWithTitle = useCallback((
		props: OptionProps<DropDownOption<T>, boolean, GroupBase<DropDownOption<T>>>,
	) => (
		<SelectComponents.Option {...props} innerProps={{ ...props.innerProps, title: props.data.label }} />
	), []);

	/**
	 * Same wrapper as above, but for the input field.
	 */
	const ValueContainerWithTitle = useCallback((
		props: ValueContainerProps<DropDownOption<T>, boolean, GroupBase<DropDownOption<T>>>,
	) => (
		<SelectComponents.ValueContainer
			{...props}
			innerProps={{ ...props.innerProps, title: props.getValue()[0]?.label }}
		/>
	), []);

	const itemHeight = optionHeight;
	/**
	 * Custom component for list virtualization
	 */
	const MenuList = useCallback((props: MenuListProps<DropDownOption<T>, false>) => {
		const { children, maxHeight } = props;

		return Array.isArray(children) ? (
			<div style={{ paddingTop: 4 }}>
				<List
					rowComponent={MenuListRow}
					rowCount={children.length}
					rowHeight={itemHeight}
					style={{
						height: maxHeight < (children.length * itemHeight) ? maxHeight : children.length * itemHeight,
						width: "100%",
					}}
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					rowProps={{ names: children }}
					overscanCount={4}
				/>
			</div>
		) : null;
	}, [itemHeight]);

	const filterOptions = (inputValue: string) => {
		if (options) {
			return options.filter(option =>
				option.label.toLowerCase().includes(inputValue.toLowerCase()),
			);
		}
		return [];
	};

	const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		return () => clearTimeout(debounceTimeoutRef.current);
	}, []);

	const loadOptionsAsync = (inputValue: string, callback: (options: DropDownOption<T>[]) => void) => {
		clearTimeout(debounceTimeoutRef.current);
		debounceTimeoutRef.current = setTimeout(() => {
			const timeout = async () => {
				callback(formatOptions(
					fetchOptions ? await fetchOptions(inputValue) : filterOptions(inputValue),
					required,
				));
			};
			void timeout();
		}, SEARCH_DEBOUNCE_MS);
	};

	const loadOptions = (
		_inputValue: string,
		callback: (options: DropDownOption<T>[]) => void,
	) => {
		callback(formatOptions(filterOptions(_inputValue), required));
	};


	const commonProps: AsyncProps<
		DropDownOption<T>,
		boolean,
		GroupBase<DropDownOption<T>>
	> = {
		tabIndex: tabIndex,
		theme: theme => (dropDownSpacingTheme(theme)),
		styles: style,
		defaultMenuIsOpen: defaultOpen,
		autoFocus: autoFocus,
		isSearchable: true,
		value: { value: value, label: text === "" ? placeholder : text },
		defaultOptions: options
			? formatOptions(
				options,
				required,
			)
			: true,
		cacheOptions: true,
		loadOptions: fetchOptions ? loadOptionsAsync : loadOptions,
		placeholder: placeholder,
		onChange: element => handleChange(element as {value: T, label: string}),
		menuIsOpen: menuIsOpen,
		onMenuOpen: () => openMenu(true),
		onMenuClose: () => openMenu(false),
		isDisabled: disabled,
		openMenuOnFocus: openMenuOnFocus,
		menuPlacement: menuPlacement,
		components: {
			MenuList,
			Option: OptionWithTitle,
			ValueContainer: ValueContainerWithTitle,
		},
	};

	return creatable ? (
		<AsyncCreatableSelect
			ref={selectRef}
			{...commonProps}
		/>
	) : (
		<AsyncSelect
			ref={selectRef}
			{...commonProps}
			noOptionsMessage={() => t("SELECT_NO_MATCHING_RESULTS")}
		/>
	);
};

export default DropDown;
