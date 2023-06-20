import { getHighestNicheurStatus } from "@ou-ca/common/helpers/nicheur-helper";
import { Angry, Bug, Comment, Link, PieChartAlt2 } from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import { type ParseKeys } from "i18next";
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
              <h3 className="flex items-center gap-2.5 text-lg font-normal">
                {t("observationDetails.observationTitle")}

                {donnee.regroupement ? (
                  <>
                    <span className="badge badge-primary badge-outline badge-lg">
                      <Link className="h-4 pr-1.5" />
                      {t("observationDetails.group", {
                        group: donnee.regroupement,
                      })}
                    </span>
                  </>
                ) : (
                  <></>
                )}
              </h3>
            </>
          }
        />

        <ItemWithAvatar
          icon={<PieChartAlt2 className="h-6" />}
          primary={t("observationDetails.number" as ParseKeys, {
            context: donnee?.estimationNombre?.nonCompte ? "undefined" : "defined",
            number: donnee?.nombre,
            numberPrecision: donnee?.estimationNombre?.libelle,
          })}
          secondary={t("observationDetails.distance" as ParseKeys, {
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
          })}
        />

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
        />

        <ItemWithAvatar
          icon={<Angry className="h-6" />}
          primary={t("observationDetails.behaviors", {
            count: donnee?.comportements.length,
            behaviors: donnee?.comportements.map((c) => {
              return c?.libelle;
            }),
          })}
          secondary={getNicheurStatusStr(donnee.comportements)}
        />

        <ItemWithAvatar
          icon={<Tree className="h-6" />}
          primary={t("observationDetails.environments", {
            count: donnee?.milieux.length,
            environments: donnee?.milieux.map((m) => {
              return m?.libelle;
            }),
          })}
        />

        <ItemWithAvatar
          icon={<Comment className="h-6" />}
          primary={t("observationDetails.comment", {
            context: donnee?.commentaire ? "" : "undefined",
            comment: donnee?.commentaire,
          })}
        />
      </ul>
    </>
  );
};
export default DonneeDetailsView;
