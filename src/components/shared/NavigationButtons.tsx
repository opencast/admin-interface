import { useTranslation } from "react-i18next";
import cn from "classnames";
import { ParseKeys } from "i18next";
import BaseButton from "./BaseButton";

const NavigationButtons = ({
	isFirst,
	isLast,
	isSubmitDisabled = false,
	submitClassName = "submit",
	nextPage,
	previousPage,
	nextTranslationString,
	previousTranslationString,
}: {
	isFirst?: boolean,
	isLast?: boolean,
	isSubmitDisabled?: boolean,
	submitClassName?: string,
	nextPage?: () => unknown,
	previousPage?: () => unknown,
	nextTranslationString?: ParseKeys,
	previousTranslationString?: ParseKeys,
}) => {

	const { t } = useTranslation();

	const disabled = isSubmitDisabled;

	const submitActiveClassName = {
		active: !disabled,
		inactive: disabled,
	};

	return (
		<footer>
			{isLast ? (
				<BaseButton
					type="submit"
					className={cn(submitClassName, submitActiveClassName)}
					disabled={disabled}
					aria-disabled={disabled}
					onClick={() => {
						if (nextPage) {
							nextPage();
						}
					}}
					tabIndex={100}
				>
					{t(nextTranslationString ?? "WIZARD.CREATE")}
				</BaseButton>
			) : (
				<BaseButton
					type="submit"
					className={cn(submitClassName, submitActiveClassName)}
					disabled={disabled}
					aria-disabled={disabled}
					onClick={() => {
						if (nextPage) {
							nextPage();
						}
					}}
					tabIndex={100}
				>
					{t(nextTranslationString ?? "WIZARD.NEXT_STEP")}
				</BaseButton>
			)}
			{!isFirst && (
				<BaseButton
					className="cancel"
					onClick={() => {
						if (previousPage) {
							previousPage();
						}
					}}
					tabIndex={101}
				>
					{t(previousTranslationString ?? "WIZARD.BACK")}
				</BaseButton>
			)}
		</footer>
	);

};

export default NavigationButtons;
