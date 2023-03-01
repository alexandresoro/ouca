import { EditAlt, Trash } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import PrimaryIconButton from "../../common/PrimaryIconButton";

type TableCellActionButtonsProps = {
  disabled?: boolean;
  onEditClicked?: () => void;
  onDeleteClicked?: () => void;
};

const TableCellActionButtons: FunctionComponent<TableCellActionButtonsProps> = (props) => {
  const { disabled, onEditClicked, onDeleteClicked } = props;
  const { t } = useTranslation();

  return (
    <>
      <PrimaryIconButton
        className="mx-1 text-primary dark:text-white"
        disabled={disabled}
        aria-label={t("aria-editButton")}
        onClick={onEditClicked}
      >
        <EditAlt className="h-5" />
      </PrimaryIconButton>
      <PrimaryIconButton
        className="mx-1 text-error"
        disabled={disabled}
        aria-label={t("aria-deleteButton")}
        onClick={onDeleteClicked}
      >
        <Trash className="h-5" />
      </PrimaryIconButton>
    </>
  );
};

export default TableCellActionButtons;
