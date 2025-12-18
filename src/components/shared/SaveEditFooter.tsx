import { useTranslation } from "react-i18next";
import { ParseKeys } from "i18next";
import BaseButton from "./BaseButton";

type SaveEditFooterProps = {
    active: boolean;
    reset: () => void;
    submit: () => void;
    isValid?: boolean;
    customSaveButtonText?: ParseKeys;
    additionalButton?: {
        label: ParseKeys,
        hint: ParseKeys,
        onClick: () => void
    };
}

export const SaveEditFooter: React.FC<SaveEditFooterProps> = ({
    active,
    reset,
    submit,
    isValid,
    customSaveButtonText,
    additionalButton,
}) => {
    const { t } = useTranslation();

    const saveButtonText = customSaveButtonText || "SAVE";

    return <footer>
        <BaseButton
            onClick={submit}
            aria-disabled={!isValid || !active}
            disabled={!isValid || !active}
            className={`save green ${
                !isValid || !active ? "disabled" : ""
            }`}
        >{t(saveButtonText)}</BaseButton>
        {additionalButton && (
            <BaseButton
                onClick={additionalButton.onClick}
                disabled={!isValid || !active}
                aria-disabled={!isValid || !active}
                tooltipText={additionalButton.hint}
                className={`save green ${
                    !isValid || !active ? "disabled" : ""
                }`}
            >{t(additionalButton.label)}</BaseButton>
        )}
        {active && isValid && (
            <BaseButton
                type="reset"
                onClick={reset}
                className="cancel"
            >{t("CANCEL")}</BaseButton>
        )}
    </footer>;
};
