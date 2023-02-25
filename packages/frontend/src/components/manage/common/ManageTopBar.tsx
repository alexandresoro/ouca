import { Add, FileUpload } from "@mui/icons-material";
import { Button } from "@mui/material";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StyledPanelHeader from "../../utils/StyledPanelHeader";

type ManageTopBarProps = {
  showButtons?: boolean;
  title: string;
  onClickExport?: () => void;
};

const ManageTopBar: FunctionComponent<ManageTopBarProps> = (props) => {
  const { title, onClickExport, showButtons } = props;

  const { t } = useTranslation();

  return (
    <>
      <StyledPanelHeader className="place-content-between">
        <h1 className="text-2xl font-normal">{title}</h1>
        {showButtons && (
          <div className="flex items-center gap-6">
            <Button component={Link} to="create" variant="contained" color="secondary" startIcon={<Add />}>
              {t("createAction")}
            </Button>
            <Button variant="contained" color="secondary" startIcon={<FileUpload />} onClick={onClickExport}>
              {t("exportAction")}
            </Button>
          </div>
        )}
      </StyledPanelHeader>
    </>
  );
};

ManageTopBar.defaultProps = {
  showButtons: true,
};

export default ManageTopBar;
