import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Card, Collapse, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import { intlFormat, parseISO } from "date-fns";
import { type TFuncKey } from "i18next";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { type Donnee } from "../../gql/graphql";
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

  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
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
            <Card className="p-6">
              <h2 className="text-2xl font-normal">
                {t("observationDetails.mainTitle", {
                  speciesName: donnee?.espece.nomFrancais,
                })}
              </h2>
              <div className="mt-1 text-[13px]">
                {t("observationDetails.mainSubtitle", {
                  owner: donnee?.inventaire.observateur.libelle,
                  creationDate: intlFormat(parseISO(donnee?.inventaire.date)),
                  updatedDate: intlFormat(parseISO(donnee?.inventaire.date)),
                  inventoryId: donnee?.inventaire?.id,
                  observationId: donnee?.id,
                })}
              </div>

              <div className="mt-8 flex justify-center items-center flex-col sm:flex-row sm:gap-10 md:gap-16">
                <div className="flex flex-col flex-auto w-full">
                  <InventaireDetailsView inventaire={donnee.inventaire}></InventaireDetailsView>
                </div>

                <div className="flex flex-col flex-auto w-full">
                  <DonneeDetailsView donnee={donnee}></DonneeDetailsView>
                </div>
              </div>
            </Card>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default DonneeDetailsRow;
