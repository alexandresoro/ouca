import { type EntityFailureReason } from "@domain/shared/failure-reason.js";
import { type Weather, type WeatherCreateInput, type WeatherFindManyInput } from "@domain/weather/weather.js";
import { type Result } from "neverthrow";

export type WeatherRepository = {
  findWeatherById: (id: number) => Promise<Weather | null>;
  findWeathersByInventoryId: (inventoryId: number | undefined) => Promise<Weather[]>;
  findWeathers: ({ orderBy, sortOrder, q, offset, limit }: WeatherFindManyInput) => Promise<readonly Weather[]>;
  getCount: (q?: string | null) => Promise<number>;
  createWeather: (weatherInput: WeatherCreateInput) => Promise<Result<Weather, EntityFailureReason>>;
  createWeathers: (weatherInputs: WeatherCreateInput[]) => Promise<Weather[]>;
  updateWeather: (weatherId: number, weatherInput: WeatherCreateInput) => Promise<Result<Weather, EntityFailureReason>>;
  deleteWeatherById: (weatherId: number) => Promise<Weather | null>;
};
