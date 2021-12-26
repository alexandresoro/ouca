import { Add, FileUpload } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FlexSpacer from "../../utils/FlexSpacer";
import StyledPanelHeader from "../../utils/StyledPanelHeader";

type ManageTopBarProps = {
  title: string;
  onClickExport?: () => void;
};

export default function ManageTopBar(props: ManageTopBarProps): ReactElement {
  const { title, onClickExport } = props;

  const { t } = useTranslation();

  return (
    <>
      <StyledPanelHeader>
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        <FlexSpacer />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3
          }}
        >
          <Button component={Link} to="create" variant="contained" color="secondary" startIcon={<Add />}>
            {t("createAction")}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<FileUpload />} onClick={onClickExport}>
            {t("exportAction")}
          </Button>
        </Box>
      </StyledPanelHeader>
    </>
  );
}
