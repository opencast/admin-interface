import React, { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	dropDownSpacingTheme,
	dropDownStyle,
} from "../../utils/componentStyles";
import { GroupBase, MenuListProps, Props, SelectInstance, StylesConfig, Theme } from "react-select";
import { isJson } from "../../utils/utils";
import { ParseKeys } from "i18next";
import { List, RowComponentProps } from "react-window";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

export type DropDownOption = {
	label: string,
	value: string | number,
	order?: number
}

/**
 * This component renders a dropdown menu using react-select
 */
const DropDown = <T extends string | number | undefined, >({
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
	value?: T
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
	const { t, i18n } = useTranslation();

	const selectRef = ref;

	const style = dropDownStyle(customCSS ?? {}) as StylesConfig<DropDownOption, false>;

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
	): DropDownOption[] => {
		let formatted = skipTranslate
			? [...unformattedOptions]
			: unformattedOptions.map(option => ({ ...option, label: t(option.label as ParseKeys) }));

		if (!required) {
			formatted = [
				...formatted,
				{
					value: "",
					label: `-- ${t("SELECT_NO_OPTION_SELECTED")} --`,
				},
			];
		}

		const hasCustomOrder = formatted.every(item => {
			if (!isJson(item.label)) {
				return false;
			}
			try {
				const parsed = JSON.parse(item.label);
				return parsed && typeof parsed === "object" && "order" in parsed;
			} catch {
				return false;
			}
		});

		if (hasCustomOrder) {
			formatted = [...formatted].sort((a, b) => JSON.parse(a.label).order - JSON.parse(b.label).order);
		} else {
			formatted = [...formatted].sort((a, b) => a.label.localeCompare(b.label));
		}

		return formatted;
	};

	const isAsync = !!fetchOptions;

	const memoizedOptions = useMemo(() => {
		if (isAsync || !options) return undefined;
		return formatOptions(options, required);
	}, [options, required, skipTranslate, i18n.resolvedLanguage, isAsync]);

	const itemHeight = optionHeight;

	/**
	 * Custom component for list virtualization
	 */
	const MenuList = (props: MenuListProps<DropDownOption, false>) => {
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
					rowProps={{ children }}
					overscanCount={4}
				/>
			</div>
		) : null;
	};

	function MenuListRow({
		index,
		children,
		style,
	}: RowComponentProps<{
		children: React.ReactNode[];
	}>) {
		const child = children[index];
		return <div style={style}>{child}</div>;
	}

	const loadOptions = useCallback((
		inputValue: string,
		callback: (options: DropDownOption[]) => void,
	) => {
		setTimeout(async () => {
			const raw = await fetchOptions!(inputValue);
			callback(formatOptions(raw || [], required));
		}, 1000);
	}, [fetchOptions, required, skipTranslate, i18n.resolvedLanguage]);

	const selectedValue = value != null ? { value, label: text === "" ? placeholder : text } as DropDownOption : null;

	const baseProps: Props<DropDownOption, false, GroupBase<DropDownOption>> = {
		tabIndex: tabIndex,
		theme: (theme: Theme) => dropDownSpacingTheme(theme),
		styles: style,
		defaultMenuIsOpen: defaultOpen,
		autoFocus: autoFocus,
		isSearchable: true,
		value: selectedValue,
		placeholder: placeholder,
		onChange: (element: any) => handleChange(element || null),
		menuIsOpen: menuIsOpen,
		onMenuOpen: () => openMenu(true),
		onMenuClose: () => openMenu(false),
		isDisabled: disabled,
		openMenuOnFocus: openMenuOnFocus,
		menuPlacement: menuPlacement ?? "auto",
		components: { MenuList },
		isMulti: false,
	};

	if (isAsync) {
		const asyncProps = {
			...baseProps,
			loadOptions,
			defaultOptions: true,
			cacheOptions: true,
		};

		// @ts-expect-error: React-Select typing mismatch with generics and isMulti
		return creatable ? (
			<AsyncCreatableSelect ref={selectRef} {...asyncProps} />
		) : (
			// @ts-expect-error: React-Select typing mismatch with generics and isMulti
			<AsyncSelect
				ref={selectRef}
				{...asyncProps}
				openMenuOnFocus={false}
				noOptionsMessage={() => t("SELECT_NO_MATCHING_RESULTS")}
			/>
		);
	}

	const syncProps = {
		...baseProps,
		options: memoizedOptions ?? [],
	};

	// @ts-expect-error: React-Select typing mismatch with generics and isMulti
	return creatable ? (
		<CreatableSelect ref={selectRef} {...syncProps} />
	) : (
		// @ts-expect-error: React-Select typing mismatch with generics and isMulti
		<Select ref={selectRef} {...syncProps} />
	);
};

export default DropDown;