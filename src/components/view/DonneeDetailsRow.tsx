import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Card, Collapse, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { intlFormat, parseISO } from "date-fns";
import { TFuncKey } from "i18next";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Donnee } from "../../gql/graphql";
import PrimaryIconButton from "../utils/PrimaryIconButton";
import DonneeDetailsView from "./DonneeDetailsView";
import InventaireDetailsView from "./InventaireDetailsView";

type DonneeRowProps = {
  donnee: Donnee;
  onEditAction: () => void;
  onDeleteAction: () => void;
};

const DonneeDetailsRow: FunctionComponent<DonneeRowProps> = (props) => {
  const { donnee, onEditAction, onDeleteAction } = props;

  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label={t("expand-data-row" as unknown as TFuncKey) as string}
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{donnee?.espece.nomFrancais}</TableCell>
        <TableCell>{donnee?.nombre}</TableCell>
        <TableCell>
          {donnee?.inventaire.lieuDit.commune.nom} ({donnee?.inventaire.lieuDit.commune.departement.code}),{" "}
          {donnee?.inventaire.lieuDit.nom}
        </TableCell>
        <TableCell>{intlFormat(parseISO(donnee?.inventaire.date))}</TableCell>
        <TableCell>{donnee?.inventaire.observateur.libelle}</TableCell>
        <TableCell align="right">
          <Tooltip title={t("observationsTable.header.action.edit")}>
            <PrimaryIconButton aria-label={t("observationsTable.header.action.edit")} onClick={onEditAction}>
              <Edit />
            </PrimaryIconButton>
          </Tooltip>
          <Tooltip title={t("observationsTable.header.action.delete")}>
            <PrimaryIconButton aria-label={t("observationsTable.header.action.delete")} onClick={onDeleteAction}>
              <Delete />
            </PrimaryIconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Card
              sx={{
                padding: 3,
              }}
            >
              <Typography component="h2" variant="h5">
                {t("observationDetails.mainTitle", {
                  speciesName: donnee?.espece.nomFrancais,
                })}
              </Typography>
              <Typography sx={{ marginTop: "5px", fontSize: "13px" }}>
                {t("observationDetails.mainSubtitle", {
                  owner: donnee?.inventaire.observateur.libelle,
                  creationDate: intlFormat(parseISO(donnee?.inventaire.date)),
                  updatedDate: intlFormat(parseISO(donnee?.inventaire.date)),
                  inventoryId: donnee?.inventaire?.id,
                  observationId: donnee?.id,
                })}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="center"
                alignItems="center"
                spacing={{
                  xs: 0,
                  sm: 5,
                  md: 8,
                }}
                sx={{ marginTop: "30px" }}
              >
                <Stack
                  sx={{
                    flex: "auto",
                    width: {
                      xs: "100%",
                    },
                  }}
                >
                  <InventaireDetailsView inventaire={donnee.inventaire}></InventaireDetailsView>
                </Stack>

                <Stack
                  sx={{
                    flex: "auto",
                    width: {
                      xs: "100%",
                    },
                  }}
                >
                  <DonneeDetailsView donnee={donnee}></DonneeDetailsView>
                </Stack>
              </Stack>
            </Card>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default DonneeDetailsRow;
