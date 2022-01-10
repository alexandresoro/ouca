import { Delete, Edit } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import PrimaryIconButton from "../../utils/PrimaryIconButton";

type TableCellActionButtonsProps = {
  onEditClicked?: () => void;
  onDeleteClicked?: () => void;
};

const TableCellActionButtons: FunctionComponent<TableCellActionButtonsProps> = (props) => {
  const { onEditClicked, onDeleteClicked } = props;
  const { t } = useTranslation();

  return (
    <>
      <Tooltip title={t("aria-editButton") as unknown as string}>
        <PrimaryIconButton aria-label={t("aria-editButton")} onClick={onEditClicked}>
          <Edit />
        </PrimaryIconButton>
      </Tooltip>
      <Tooltip title={t("aria-deleteButton") as unknown as string}>
        <PrimaryIconButton aria-label={t("aria-deleteButton")} onClick={onDeleteClicked}>
          <Delete />
        </PrimaryIconButton>
      </Tooltip>
    </>
  );
};

export default TableCellActionButtons;
