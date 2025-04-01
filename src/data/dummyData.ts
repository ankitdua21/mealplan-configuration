
import { RatePlan, RoomType } from "../models/SupplementTypes";

export const roomTypes: RoomType[] = [
  { id: "1", name: "Standard Room" },
  { id: "2", name: "Deluxe Room" },
  { id: "3", name: "Junior Suite" },
  { id: "4", name: "Executive Suite" },
  { id: "5", name: "Presidential Suite" },
];

export const ratePlans: RatePlan[] = [
  { id: "1", name: "Best Available Rate" },
  { id: "2", name: "Advanced Purchase" },
  { id: "3", name: "Retail Rate" },
  { id: "4", name: "Package Rate" },
  { id: "5", name: "Weekend Special" },
];

export const supplementTypes = [
  { id: "1", name: "Mealplan", type: "mealplan" },
  { id: "2", name: "Spa Access", type: "spa" },
  { id: "3", name: "Gym Access", type: "gym" },
  { id: "4", name: "Airport Transfer", type: "other" },
  { id: "5", name: "Welcome Gift", type: "other" },
];
