import { EditAlt, Trash } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../../common/styled/IconButton";

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
      <IconButton
        className="mx-1 text-primary dark:text-white"
        disabled={disabled}
        aria-label={t("aria-editButton")}
        onClick={onEditClicked}
      >
        <EditAlt className="h-5" />
      </IconButton>
      <IconButton
        className="mx-1 text-accent"
        disabled={disabled}
        aria-label={t("aria-deleteButton")}
        onClick={onDeleteClicked}
      >
        <Trash className="h-5" />
      </IconButton>
    </>
  );
};

export default TableCellActionButtons;
