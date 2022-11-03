import { Comment, EmojiNature, Filter1, Link, Park, Pets } from "@mui/icons-material";
import { Chip, Divider, List, Typography, useTheme } from "@mui/material";
import { TFuncKey } from "i18next";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Comportement, Donnee } from "../../gql/graphql";
import { getHighestNicheurStatus } from "../../model/helpers/nicheur-helper";
import ItemWithAvatar from "../common/ItemWithAvatar";

type DonneeDetailsViewProps = {
  donnee: Donnee;
};

const DonneeDetailsView: FunctionComponent<DonneeDetailsViewProps> = (props) => {
  const { donnee } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  const getNicheurStatusStr = (comportements: Comportement[]): string => {
    const statusCode = getHighestNicheurStatus(comportements);
    return statusCode ? t(`breedingStatus.${statusCode}`) : "";
  };

  return (
    <>
      <List sx={{ borderRadius: "4px", border: 1, borderColor: theme.palette.grey[300] }}>
        <ItemWithAvatar
          primary={
            <>
              <Typography component="h3" variant="h6">
                {t("observationDetails.observationTitle")}

                {donnee?.regroupement ? (
                  <>
                    <Chip
                      icon={<Link sx={{ paddingLeft: "5px" }} />}
                      label={t("observationDetails.group", {
                        group: donnee?.regroupement
                      })}
                      variant="outlined"
                      sx={{ marginLeft: "10px", borderColor: theme.palette.grey[300] }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </Typography>
            </>
          }
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<Filter1 />}
          primary={
            t("observationDetails.number" as unknown as TFuncKey, {
              context: donnee?.estimationNombre?.nonCompte ? "undefined" : "defined",
              number: donnee?.nombre,
              numberPrecision: donnee?.estimationNombre?.libelle
            }) as string
          }
          secondary={
            t("observationDetails.distance" as unknown as TFuncKey, {
              context:
                donnee?.distance && donnee?.estimationDistance
                  ? "both"
                  : donnee?.distance
                  ? "valueOnly"
                  : donnee?.estimationDistance
                  ? "precisionOnly"
                  : "none",
              distance: donnee?.distance,
              distancePrecision: donnee?.estimationDistance?.libelle
            }) as string
          }
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<EmojiNature />}
          primary={
            <>
              <div>
                {t("observationDetails.gender", {
                  gender: donnee?.sexe.libelle
                })}
              </div>
              <div>
                {t("observationDetails.age", {
                  age: donnee?.age.libelle
                })}
              </div>
            </>
          }
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<Pets />}
          primary={t("observationDetails.behaviors", {
            count: donnee?.comportements.length,
            behaviors: donnee?.comportements.map((c) => {
              return c?.libelle;
            })
          })}
          secondary={getNicheurStatusStr(donnee.comportements)}
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<Park />}
          primary={t("observationDetails.environments", {
            count: donnee?.milieux.length,
            environments: donnee?.milieux.map((m) => {
              return m?.libelle;
            })
          })}
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<Comment />}
          primary={t("observationDetails.comment", {
            context: donnee?.commentaire ? "" : "undefined",
            comment: donnee?.commentaire
          })}
        ></ItemWithAvatar>
      </List>
    </>
  );
};
export default DonneeDetailsView;
