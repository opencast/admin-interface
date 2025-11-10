/* this file contains syles as javascript objects for syled components */

import { StylesConfig, Theme } from "react-select";

// colors
const colorDropDownMain = "#aaa";
const colorDropDownNormalFocus = "#5897fb";
const colorDropDownDarkerFocus = "#2a62bc";

export function dropDownStyle(customCss: {
	isMetadataStyle?: boolean,
	width?: number | string,
	optionPaddingTop?: number,
	optionLineHeight?: string,
}): StylesConfig {
	const width = customCss.width ?? 250;

	return {
		container: (provided, _state) => ({
			...provided,
			width: width,
			position: "relative",
			display: "inline-block",
			verticalAlign: "middle",
			font: "inherit",
			paddingTop: 0,
			paddingBottom: 0,
			marginTop: 0,
			marginBottom: 0,
			marginRight: 1,
		}),
		control: (provided, state) => ({
			...provided,
			marginBottom: 0,
			border: customCss.isMetadataStyle ? 0 : `1px solid ${colorDropDownMain}`,
			borderColor: state.selectProps.menuIsOpen
				? colorDropDownNormalFocus
				: colorDropDownMain,
			hoverBorderColor: state.selectProps.menuIsOpen
				? colorDropDownNormalFocus
				: colorDropDownMain,
			boxShadow: customCss.isMetadataStyle
				? "0 0 0 0px"
				: state.selectProps.menuIsOpen
				? `0 0 0 1px ${colorDropDownNormalFocus}`
				: `0 0 0 1px ${colorDropDownMain}`,
			borderRadius: 4,
			paddingTop: 0,
			paddingBottom: 0,
			"&:hover": {
				borderColor: colorDropDownMain,
			},

			...customCss.isMetadataStyle && {
				backgroundColor: "transparent",
				"& div": {
					padding: "0 !important",
					paddingLeft: "0 !important",
				},
			},
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			transform: state.selectProps.menuIsOpen
				? "rotate(180deg)"
				: "rotate(0deg)",
			paddingTop: 0,
			paddingBottom: 0,
			color: colorDropDownMain,
			"&:hover": {
				color: colorDropDownNormalFocus,
			},
			...customCss.isMetadataStyle && {
				display: "none",
			},
		}),
		indicatorSeparator: (provided, _state) => ({
			...provided,
			display: "none",
		}),
		input: (provided, _state) => ({
			...provided,
			position: "relative",
			zIndex: 1010,
			margin: 0,
			whiteSpace: "nowrap",
			verticalAlign: "middle",
			border: "none",
			paddingTop: 0,
			paddingBottom: 0,
		}),
		menu: (provided, _state) => ({
			...provided,
			zIndex: 9000,
			marginTop: 1,
			border: "none",
		}),
		menuList: (provided, _state) => ({
			...provided,
			marginTop: 0,
			border: `1px solid ${colorDropDownMain}`,
			borderRadius: 4,
		}),
		noOptionsMessage: (provided, _state) => ({
			...provided,
			textAlign: "left",
			paddingTop: 0,
			paddingBottom: 0,
		}),
		option: (provided, state) => ({
			...provided,
			paddingTop: customCss.optionPaddingTop ?? 0,
			paddingBottom: customCss.optionPaddingTop ?? 0,
			backgroundColor: state.isSelected
				? colorDropDownDarkerFocus
				: state.isFocused
				? colorDropDownNormalFocus
				: "white",
			color: state.isFocused || state.isSelected ? "white" : provided.color,
			cursor: "pointer",
			overflowWrap: "normal",
			lineHeight: customCss.optionLineHeight ?? "inherit", // type === "comment" ? "105%" : "inherit",
		}),
		singleValue: (provided, _state) => ({
			...provided,
			marginTop: 0,
			marginBottom: 0,
			paddingTop: 0,
			paddingBottom: 0,
		}),
		valueContainer: (provided, _state) => ({
			...provided,
			marginTop: 0,
			marginBottom: 0,
			paddingLeft: 5,
			paddingTop: 0,
			paddingBottom: 0,
		}),
	};
};

export const dropDownSpacingTheme = (theme: Theme) => ({
	...theme,
	spacing: {
		...theme.spacing,
		controlHeight: 25,
		baseUnit: 2,
	},
});
