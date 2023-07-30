import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { getHighestNicheurStatus } from "@ou-ca/common/helpers/nicheur-helper";
import { Angry, Bug, Comment, Link, PieChartAlt2 } from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import ItemWithAvatar from "../common/ItemWithAvatar";

type DonneeDetailsViewProps = {
  donnee: EntryExtended;
};

const DonneeDetailsView: FunctionComponent<DonneeDetailsViewProps> = (props) => {
  const { donnee } = props;

  const { t } = useTranslation();

  const getNicheurStatusStr = (comportements: Behavior[]): string => {
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

                {donnee.regroupment ? (
                  <>
                    <span className="badge badge-primary badge-outline badge-lg">
                      <Link className="h-4 pr-1.5" />
                      {t("observationDetails.group", {
                        group: donnee.regroupment,
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
          primary={t("observationDetails.number", {
            context: donnee.numberEstimate?.nonCompte ? "undefined" : "defined",
            number: donnee.number,
            numberPrecision: donnee.numberEstimate?.libelle,
          })}
          secondary={t("observationDetails.distance", {
            context:
              donnee?.distance && donnee.distanceEstimate
                ? "both"
                : donnee.distance
                ? "valueOnly"
                : donnee.distanceEstimate
                ? "precisionOnly"
                : "none",
            distance: donnee.distance,
            distancePrecision: donnee.distanceEstimate?.libelle,
          })}
        />

        <ItemWithAvatar
          icon={<Bug className="h-6" />}
          primary={
            <>
              <div>
                {t("observationDetails.gender", {
                  gender: donnee.sex.libelle,
                })}
              </div>
              <div>
                {t("observationDetails.age", {
                  age: donnee.age.libelle,
                })}
              </div>
            </>
          }
        />

        <ItemWithAvatar
          icon={<Angry className="h-6" />}
          primary={t("observationDetails.behaviors", {
            count: donnee.behaviors.length,
            behaviors: donnee.behaviors.map((c) => {
              return c?.libelle;
            }),
          })}
          secondary={getNicheurStatusStr(donnee.behaviors)}
        />

        <ItemWithAvatar
          icon={<Tree className="h-6" />}
          primary={t("observationDetails.environments", {
            count: donnee?.environments.length,
            environments: donnee?.environments.map((m) => {
              return m?.libelle;
            }),
          })}
        />

        <ItemWithAvatar
          icon={<Comment className="h-6" />}
          primary={t("observationDetails.comment", {
            context: donnee?.comment ? "" : "undefined",
            comment: donnee?.comment,
          })}
        />
      </ul>
    </>
  );
};
export default DonneeDetailsView;
