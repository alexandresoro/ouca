import { Container } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurTable from "./ObservateurTable";

export default function ObservateurPage(): ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <ManageTopBar title={t("observersButton")} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <ObservateurTable />
      </Container>
    </>
  );
}
