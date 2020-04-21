import * as _ from "lodash";

export const mapAssociesIds = (
  associesDb: { associeId: number }[]
): number[] => {
  return _.map(associesDb, (associeDb) => {
    return associeDb.associeId;
  });
};

export const mapMeteosIds = (meteosDb: { meteoId: number }[]): number[] => {
  return _.map(meteosDb, (meteoDb) => {
    return meteoDb.meteoId;
  });
};

export const mapComportementsIds = (
  comportementsDb: { comportementId: number }[]
): number[] => {
  return _.map(comportementsDb, (comportementDb) => {
    return comportementDb.comportementId;
  });
};

export const mapMilieuxIds = (milieuxDds: { milieuId: number }[]): number[] => {
  return _.map(milieuxDds, (milieuDb) => {
    return milieuDb.milieuId;
  });
};
