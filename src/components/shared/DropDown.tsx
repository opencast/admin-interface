import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	dropDownSpacingTheme,
	dropDownStyle,
} from "../../utils/componentStyles";
import { GroupBase, MenuListProps, SelectInstance } from "react-select";
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
	loadOptionsOnMount = true,
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
	// Whether an async (fetchOptions-based) dropdown should eagerly fetch its default option list on
	// mount, before the user has interacted with it. Set to false when many instances of this dropdown
	// may be mounted at once (e.g. one per table row), to avoid firing one request per instance on
	// render; the default option list is then fetched lazily, the first time this instance's menu is
	// opened, instead of unconditionally on mount.
	loadOptionsOnMount?: boolean
}) => {
	const { t } = useTranslation();

	const internalRef = useRef<SelectInstance<DropDownOption<T>, boolean, GroupBase<DropDownOption<T>>> | null>(null);
	const selectRef = ref ?? internalRef;

	// Holds the result of the one-off default-option fetch below, once it has completed.
	const [preloadedOptions, setPreloadedOptions] = useState<DropDownOption<T>[] | undefined>(undefined);
	const [isPreloading, setIsPreloading] = useState(false);
	const hasStartedPreload = useRef(false);

	const style = dropDownStyle<T>(customCSS ?? {});

	useEffect(() => {
		// Ensure menu has focus when opened programmatically
		if (menuIsOpen) {
			selectRef.current?.focus();
		}
	}, [menuIsOpen, selectRef]);

	const openMenu = (open: boolean) => {
		// If loadOptionsOnMount === false, fetch option list ourselves here
		if (open && fetchOptions && !loadOptionsOnMount && !hasStartedPreload.current) {
			hasStartedPreload.current = true;
			setIsPreloading(true);
			fetchOptions("")
				.then(fetched => setPreloadedOptions(formatOptions(fetched, required)))
				.finally(() => setIsPreloading(false));
		}
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
		// react-select passes a single NoOptionsMessage/LoadingMessage node here (not an array) when
		// there are no options to list, e.g. before the user has typed anything into an async dropdown.
		) : children;
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
			: loadOptionsOnMount || (preloadedOptions ?? []),
		isLoading: isPreloading,
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
		components: { MenuList },
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
