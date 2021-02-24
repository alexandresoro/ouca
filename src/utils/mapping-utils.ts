export const mapAssociesIds = (
  associesDb: { associeId: number }[]
): number[] => {
  return associesDb.map((associeDb) => {
    return associeDb.associeId;
  });
};

export const mapMeteosIds = (meteosDb: { meteoId: number }[]): number[] => {
  return meteosDb.map((meteoDb) => {
    return meteoDb.meteoId;
  });
};

export const mapComportementsIds = (
  comportementsDb: { comportementId: number }[]
): number[] => {
  return comportementsDb.map((comportementDb) => {
    return comportementDb.comportementId;
  });
};

export const mapMilieuxIds = (milieuxDds: { milieuId: number }[]): number[] => {
  return milieuxDds.map((milieuDb) => {
    return milieuDb.milieuId;
  });
};
