import { Add, FileUpload } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
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
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {showButtons && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Button component={Link} to="create" variant="contained" color="secondary" startIcon={<Add />}>
              {t("createAction")}
            </Button>
            <Button variant="contained" color="secondary" startIcon={<FileUpload />} onClick={onClickExport}>
              {t("exportAction")}
            </Button>
          </Box>
        )}
      </StyledPanelHeader>
    </>
  );
};

ManageTopBar.defaultProps = {
  showButtons: true,
};

export default ManageTopBar;
