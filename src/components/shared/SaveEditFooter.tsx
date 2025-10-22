import { useTranslation } from "react-i18next";
import { Tooltip } from "./Tooltip";
import { ParseKeys } from "i18next";
import BaseButton from "./BaseButton";

type SaveEditFooterProps = {
    active: boolean;
    reset: () => void;
    submit: () => void;
    isValid?: boolean;
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
    additionalButton,
}) => {
    const { t } = useTranslation();

    return <footer>
        <BaseButton
            onClick={submit}
            aria-disabled={!isValid || !active}
            disabled={!isValid || !active}
            className={`save green ${
                !isValid || !active ? "disabled" : ""
            }`}
        >{t("SAVE")}</BaseButton>
        {additionalButton && (
            <Tooltip title={t(additionalButton.hint)}>
                <BaseButton
                    onClick={additionalButton.onClick}
                    disabled={!isValid || !active}
                    aria-disabled={!isValid || !active}
                    className={`save green ${
                        !isValid || !active ? "disabled" : ""
                    }`}
                >{t(additionalButton.label)}</BaseButton>
            </Tooltip>
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
