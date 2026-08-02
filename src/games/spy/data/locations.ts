import {
  SpyAirportLocation,
  SpyBankLocation,
  SpyCinemaLocation,
  SpyHospitalLocation,
  SpyHotelLocation,
  SpyMuseumLocation,
  SpyRestaurantLocation,
  SpySchoolLocation,
  SpySupermarketLocation,
  SpyTrainStationLocation,
} from "@assets/Spy_game";
import type { SpyWord } from "@/games/spy/types";

export const SPY_LOCATIONS = [
  {
    id: "cinema",
    name: "Кинотеатр",
    image: SpyCinemaLocation,
  },
  {
    id: "airport",
    name: "Аэропорт",
    image: SpyAirportLocation,
  },
  {
    id: "bank",
    name: "Банк",
    image: SpyBankLocation,
  },
  {
    id: "hospital",
    name: "Больница",
    image: SpyHospitalLocation,
  },
  {
    id: "hotel",
    name: "Отель",
    image: SpyHotelLocation,
  },
  {
    id: "museum",
    name: "Музей",
    image: SpyMuseumLocation,
  },
  {
    id: "restaurant",
    name: "Ресторан",
    image: SpyRestaurantLocation,
  },
  {
    id: "school",
    name: "Школа",
    image: SpySchoolLocation,
  },
  {
    id: "supermarket",
    name: "Супермаркет",
    image: SpySupermarketLocation,
  },
  {
    id: "train-station",
    name: "Вокзал",
    image: SpyTrainStationLocation,
  },
] as const satisfies readonly SpyWord[];

export type SpyLocationId = (typeof SPY_LOCATIONS)[number]["id"];

export function getSpyLocationById(locationId: string) {
  return SPY_LOCATIONS.find(({ id }) => id === locationId);
}
