import { useTranslation } from "react-i18next";
import { Tooltip } from "./Tooltip";
import { ParseKeys } from "i18next";

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

    return <footer style={{ padding: "0 15px" }}>
        {active && isValid && (
            <div className="pull-left">
                <button
                    type="reset"
                    onClick={reset}
                    className="cancel"
                >{t("CANCEL")}</button>
            </div>
        )}
        {additionalButton && (
            <div className="pull-right" style={{ marginLeft: 5 }}>
                <Tooltip title={t(additionalButton.hint)}>
                    <button
                        onClick={additionalButton.onClick}
                        disabled={!isValid || !active}
                        aria-disabled={!isValid || !active}
                        className={`save green ${
                            !isValid || !active ? "disabled" : ""
                        }`}
                    >{t(additionalButton.label)}</button>
                </Tooltip>
            </div>
        )}
        <div className="pull-right">
            <button
                onClick={submit}
                aria-disabled={!isValid || !active}
                disabled={!isValid || !active}
                className={`save green ${
                    !isValid || !active ? "disabled" : ""
                }`}
            >{t("SAVE")}</button>
        </div>
    </footer>;
};
