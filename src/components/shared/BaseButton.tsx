import React, { JSX } from "react";

import { ParseKeys, TOptions } from "i18next";
import { Tooltip } from "./Tooltip";
import { useTranslation } from "react-i18next";

type BaseButtonProps = JSX.IntrinsicElements["button"] & {
	tooltipText?: ParseKeys
	tooltipParams?: TOptions
}

const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(({
	tooltipText,
	tooltipParams,
	children,
	...rest
}, ref) => {
	const { t } = useTranslation();

	const buttonComponent = (
		<button
			ref={ref}
			type="button"
			{...rest}
		>
			{children}
		</button>
	);

	if (tooltipText) {
		return (
			<Tooltip title={tooltipParams ? t(tooltipText) : t(tooltipText, tooltipParams)}>
				{buttonComponent}
			</Tooltip>
		);
	}

	return buttonComponent;
});

export default BaseButton;
