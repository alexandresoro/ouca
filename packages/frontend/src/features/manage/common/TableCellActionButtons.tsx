import { EditAlt, Trash } from "@styled-icons/boxicons-regular";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../../../components/base/IconButton";

type TableCellActionButtonsProps = {
  canEdit?: boolean;
  canDelete?: boolean;
  /**
   * @deprecated Use `canDelete` instead
   */
  disabledDelete?: boolean;
  onEditClicked?: () => void;
  onDeleteClicked?: () => void;
};

const TableCellActionButtons: FunctionComponent<TableCellActionButtonsProps> = (props) => {
  const { disabledDelete, canEdit, canDelete, onEditClicked, onDeleteClicked } = props;
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        className="mx-1 text-primary dark:text-white"
        disabled={canEdit === false}
        aria-label={t("aria-editButton")}
        onClick={onEditClicked}
      >
        <EditAlt className="h-5" />
      </IconButton>
      <IconButton
        className="mx-1 text-error"
        // TODO: Remove `disabledDelete` once all components are updated and use !`canDelete` instead
        disabled={disabledDelete ?? canDelete === false}
        aria-label={t("aria-deleteButton")}
        onClick={onDeleteClicked}
      >
        <Trash className="h-5" />
      </IconButton>
    </>
  );
};

export default TableCellActionButtons;
