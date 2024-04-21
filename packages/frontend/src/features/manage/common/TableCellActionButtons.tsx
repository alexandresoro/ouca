import IconButton from "@components/base/IconButton";
import { EditAlt, Trash } from "@styled-icons/boxicons-regular";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type TableCellActionButtonsProps = {
  canEdit?: boolean;
  canDelete?: boolean;
  onEditClicked?: () => void;
  onDeleteClicked?: () => void;
};

const TableCellActionButtons: FunctionComponent<TableCellActionButtonsProps> = (props) => {
  const { canEdit, canDelete, onEditClicked, onDeleteClicked } = props;
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        className="mx-1 text-primary dark:text-white"
        disabled={!canEdit}
        aria-label={t("aria-editButton")}
        onClick={onEditClicked}
      >
        <EditAlt className="h-5" />
      </IconButton>
      <IconButton
        className="mx-1 text-error"
        disabled={!canDelete}
        aria-label={t("aria-deleteButton")}
        onClick={onDeleteClicked}
      >
        <Trash className="h-5" />
      </IconButton>
    </>
  );
};

export default TableCellActionButtons;
