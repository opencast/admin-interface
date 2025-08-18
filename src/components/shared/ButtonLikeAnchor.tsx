import React, { JSX } from "react";
import { getUserInformation } from "../../selectors/userInfoSelectors";
import { useAppSelector } from "../../store";
import { hasAccess } from "../../utils/utils";
import cn from "classnames";
import { ParseKeys, TOptions } from "i18next";
import BaseButton from "./BaseButton";

type ButtonLikeAnchorProps = JSX.IntrinsicElements["button"] & {
	editAccessRole?: string
	tooltipText?: ParseKeys
	tooltipParams?: TOptions
}

const ButtonLikeAnchor = React.forwardRef<HTMLButtonElement, ButtonLikeAnchorProps>(({
	editAccessRole,
	tooltipText,
	tooltipParams,
	children,
	...rest
}, ref) => {

	const user = useAppSelector(state => getUserInformation(state));

	if (editAccessRole && !hasAccess(editAccessRole, user)) {
		return (<></>);
	}

	const buttonComponent = (
		<BaseButton
			ref={ref}
			tooltipText={tooltipText}
			tooltipParams={tooltipParams}
			{...rest}
			className={cn("button-like-anchor", rest.className)}
		>
			{children}
		</BaseButton>
	);

	return buttonComponent;
});

export default ButtonLikeAnchor;
