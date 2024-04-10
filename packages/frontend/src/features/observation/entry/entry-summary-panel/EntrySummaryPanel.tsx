import type { EntryExtended } from "@ou-ca/common/api/entities/entry";
import { getHighestNicheurStatus } from "@ou-ca/common/helpers/nicheur-helper";
import { Angry, CalendarPlus, Comment, MaleSign, PieChartAlt2 } from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import ItemWithAvatar from "../../../../components/base/ItemWithAvatar";

type EntrySummaryPanelProps = {
  entry: EntryExtended;
};

const EntrySummaryPanel: FunctionComponent<EntrySummaryPanelProps> = ({ entry }) => {
  const { t } = useTranslation();

  const nicheurStatus = getHighestNicheurStatus(entry.behaviors);

  return (
    <div className="card border-2 border-primary shadow-xl py-4">
      <ItemWithAvatar
        icon={<PieChartAlt2 className="h-6" />}
        primary={t("observationDetails.number", {
          context: entry.numberEstimate?.nonCompte ? "undefined" : "defined",
          number: entry.number,
          numberPrecision: entry.numberEstimate?.libelle,
        })}
        secondary={t("observationDetails.distance", {
          context:
            entry?.distance != null && entry.distanceEstimate
              ? "both"
              : entry.distance != null
                ? "valueOnly"
                : entry.distanceEstimate
                  ? "precisionOnly"
                  : "none",
          distance: entry.distance,
          distancePrecision: entry.distanceEstimate?.libelle,
        })}
      />

      <ItemWithAvatar icon={<MaleSign className="h-6" />} primary={entry.sex.libelle} />

      <ItemWithAvatar icon={<CalendarPlus className="h-6" />} primary={entry.age.libelle} />

      {entry.behaviors.length > 0 && (
        <ItemWithAvatar
          icon={<Angry className="h-6" />}
          primary={
            <>
              {entry.behaviors.map(({ libelle }) => (
                <span className="badge badge-outline m-1 p-3 text-base">{libelle}</span>
              ))}
              {nicheurStatus && (
                <span className="badge badge-outline badge-accent m-1 p-3 text-base">
                  {t(`breedingStatus.${nicheurStatus}`)}
                </span>
              )}
            </>
          }
          // secondary={getNicheurStatusStr(entry.behaviors)}
        />
      )}

      {entry.environments.length > 0 && (
        <ItemWithAvatar
          icon={<Tree className="h-6" />}
          primary={entry.environments.map(({ libelle }) => (
            <span className="badge badge-outline m-1 p-3 text-base">{libelle}</span>
          ))}
        />
      )}

      {entry.comment && <ItemWithAvatar icon={<Comment className="h-6" />} primary={entry.comment} />}
    </div>
  );
};
export default EntrySummaryPanel;
