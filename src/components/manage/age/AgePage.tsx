import { Container } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import ManageTopBar from "../common/ManageTopBar";
import AgeTable from "./AgeTable";

export default function AgePage(): ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <ManageTopBar title={t("agesButton")} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <AgeTable />
      </Container>
    </>
  );
}
