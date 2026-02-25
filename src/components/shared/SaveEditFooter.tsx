import { useTranslation } from "react-i18next";
import { ParseKeys } from "i18next";

import { Tooltip } from "./Tooltip";
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
  const disabled = !(isValid && active);

  return <footer style={{}}>
    <BaseButton
      onClick={submit}
      aria-disabled={!disabled}
      disabled={disabled}
      className={`save green ${disabled ? "disabled" : ""}`}
    >{t(saveButtonText)}</BaseButton>
    {additionalButton && (
      <Tooltip title={t(additionalButton.hint)}>
        <BaseButton
          onClick={additionalButton.onClick}
          disabled={disabled}
          aria-disabled={disabled}
          className={`save green ${disabled ? "disabled" : ""}`}
        >{t(additionalButton.label)}</BaseButton>
      </Tooltip>
    )}
    <BaseButton
      type="reset"
      onClick={reset}
      className={`cancel ${disabled ? "disabled" : ""}`}
      disabled={disabled}
      aria-disabled={disabled}
    >{t("CANCEL")}</BaseButton>
  </footer>;
};
