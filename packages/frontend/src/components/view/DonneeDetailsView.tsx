import { Chip } from "@mui/material";
import { getHighestNicheurStatus } from "@ou-ca/common/helpers/nicheur-helper";
import { Angry, Bug, Comment, Link, PieChartAlt2 } from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import { type TFuncKey } from "i18next";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { type Comportement, type Donnee } from "../../gql/graphql";
import ItemWithAvatar from "../common/ItemWithAvatar";

type DonneeDetailsViewProps = {
  donnee: Donnee;
};

const DonneeDetailsView: FunctionComponent<DonneeDetailsViewProps> = (props) => {
  const { donnee } = props;

  const { t } = useTranslation();

  const getNicheurStatusStr = (comportements: Comportement[]): string => {
    const statusCode = getHighestNicheurStatus(comportements);
    return statusCode ? t(`breedingStatus.${statusCode}`) : "";
  };

  return (
    <>
      <ul className="border border-solid rounded border-neutral-300 divide-solid divide-neutral-200 divide-y py-2">
        <ItemWithAvatar
          primary={
            <>
              <h3 className="text-x font-normal">
                {t("observationDetails.observationTitle")}

                {donnee?.regroupement ? (
                  <>
                    <Chip
                      className="ml-2.5 border-gray-300"
                      icon={<Link className="h-6 pl-1" />}
                      label={t("observationDetails.group", {
                        group: donnee?.regroupement,
                      })}
                      variant="outlined"
                    />
                  </>
                ) : (
                  <></>
                )}
              </h3>
            </>
          }
        ></ItemWithAvatar>

        <ItemWithAvatar
          icon={<PieChartAlt2 className="h-6" />}
          primary={
            t("observationDetails.number" as unknown as TFuncKey, {
              context: donnee?.estimationNombre?.nonCompte ? "undefined" : "defined",
              number: donnee?.nombre,
              numberPrecision: donnee?.estimationNombre?.libelle,
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
              distancePrecision: donnee?.estimationDistance?.libelle,
            }) as string
          }
        ></ItemWithAvatar>

        <ItemWithAvatar
          icon={<Bug className="h-6" />}
          primary={
            <>
              <div>
                {t("observationDetails.gender", {
                  gender: donnee?.sexe.libelle,
                })}
              </div>
              <div>
                {t("observationDetails.age", {
                  age: donnee?.age.libelle,
                })}
              </div>
            </>
          }
        ></ItemWithAvatar>

        <ItemWithAvatar
          icon={<Angry className="h-6" />}
          primary={t("observationDetails.behaviors", {
            count: donnee?.comportements.length,
            behaviors: donnee?.comportements.map((c) => {
              return c?.libelle;
            }),
          })}
          secondary={getNicheurStatusStr(donnee.comportements)}
        ></ItemWithAvatar>

        <ItemWithAvatar
          icon={<Tree className="h-6" />}
          primary={t("observationDetails.environments", {
            count: donnee?.milieux.length,
            environments: donnee?.milieux.map((m) => {
              return m?.libelle;
            }),
          })}
        ></ItemWithAvatar>

        <ItemWithAvatar
          icon={<Comment className="h-6" />}
          primary={t("observationDetails.comment", {
            context: donnee?.commentaire ? "" : "undefined",
            comment: donnee?.commentaire,
          })}
        ></ItemWithAvatar>
      </ul>
    </>
  );
};
export default DonneeDetailsView;
