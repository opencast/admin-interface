import React, { JSX } from "react";

import { ParseKeys, TOptions } from "i18next";
import { useTranslation } from "react-i18next";

type BaseButtonProps = JSX.IntrinsicElements["button"] & {
	tooltipText?: ParseKeys
	tooltipParams?: TOptions
	tooltipOptions?: { [key: string]: unknown }
}

const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(({
	tooltipText,
	tooltipParams,
	tooltipOptions,
	children,
	...rest
}, ref) => {
	const { t } = useTranslation();

	const tooltipProps = tooltipText
		? {
				"data-tooltip-id": "my-tooltip",
				"data-tooltip-content": tooltipParams ? t(tooltipText, tooltipParams) : t(tooltipText),
			}
		: {};

	return (
		<button
			ref={ref}
			type="button"
			{...tooltipProps}
			{...rest}
		>
			{children}
		</button>
	);
});

export default BaseButton;
