import * as _ from "lodash";

export const mapAssociesIds = (associesDb: any): number[] => {
  return _.map(associesDb, (associeDb) => {
    return associeDb.associeId;
  });
};

export const mapMeteosIds = (meteosDb: any): number[] => {
  return _.map(meteosDb, (meteoDb) => {
    return meteoDb.meteoId;
  });
};

export const mapComportementsIds = (comportementsDb: any): number[] => {
  return _.map(comportementsDb, (comportementDb) => {
    return comportementDb.comportementId;
  });
};

export const mapMilieuxIds = (milieuxDds: any): number[] => {
  return _.map(milieuxDds, (milieuDb) => {
    return milieuDb.milieuId;
  });
};
