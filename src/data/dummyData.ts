
import { RatePlan, RoomType } from "../models/SupplementTypes";

export const roomTypes: RoomType[] = [
  { id: "1", name: "Standard Room", code: "KING" },
  { id: "2", name: "Deluxe Room", code: "DLX" },
  { id: "3", name: "Junior Suite", code: "JSUI" },
  { id: "4", name: "Executive Suite", code: "ESUI" },
  { id: "5", name: "Presidential Suite", code: "PSUI" },
];

export const ratePlans: RatePlan[] = [
  { id: "1", name: "Best Available Rate", code: "BAR" },
  { id: "2", name: "Advanced Purchase", code: "AP" },
  { id: "3", name: "Retail Rate", code: "RET" },
  { id: "4", name: "Package Rate", code: "PKG" },
  { id: "5", name: "Weekend Special", code: "WKND" },
];

export const supplementTypes = [
  { id: "1", name: "Mealplan", type: "mealplan" },
  { id: "2", name: "Spa Access", type: "spa" },
  { id: "3", name: "Gym Access", type: "gym" },
  { id: "4", name: "Airport Transfer", type: "other" },
  { id: "5", name: "Welcome Gift", type: "other" },
];
