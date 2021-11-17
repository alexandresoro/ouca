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
