import { Save, X } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type EntityUpsertFormActionButtonsProps = {
  onCancelClick?: () => void;
  disabled?: boolean;
};

const EntityUpsertFormActionButtons: FunctionComponent<EntityUpsertFormActionButtonsProps> = ({
  onCancelClick,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card-actions justify-end">
      <button className="btn btn-secondary" type="button" onClick={onCancelClick}>
        <X className="h-6 mr-1" />
        {t("cancel")}
      </button>
      <button className="btn btn-primary" disabled={disabled} type="submit">
        <Save className="h-6 mr-1" />
        {t("save")}
      </button>
    </div>
  );
};

export default EntityUpsertFormActionButtons;
