import { getAltitudeResponse } from "@ou-ca/common/api/altitude";
import { fetchApi } from "@utils/fetch-api";

export const fetchApiAltitude = async (
  { latitude, longitude }: { latitude: number; longitude: number },
  {
    apiUrl,
    token,
  }: {
    apiUrl: string;
    token: string;
  },
) => {
  const searchParams = new URLSearchParams({
    latitude: `${latitude}`,
    longitude: `${longitude}`,
  });

  const url = `${apiUrl}/altitude?${searchParams.toString()}`;

  return fetchApi({
    url,
    token,
    schema: getAltitudeResponse,
  });
};
