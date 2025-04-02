
export interface Supplement {
  id: string;
  name: string;
  type: 'mealplan' | 'spa' | 'gym' | 'other';
  description: string;
  values: SupplementValue[];
}

export interface DateRange {
  id?: string;
  startDate: Date;
  endDate: Date;
}

export interface RoomType {
  id: string;
  name: string;
}

export interface RatePlan {
  id: string;
  name: string;
}

export type ChargeType = 'per-room' | 'per-adult-child' | 'per-occupant';

export interface AgeRange {
  id: string;
  minAge: number;
  maxAge: number;
  amount: number;
}

export interface OccupantAmounts {
  adultAmount: number;
  childAmount: number;
  infantAmount: number;
  childAgeRanges: AgeRange[];
  occupancyPricing: OccupancyPricing[];
}

export interface OccupancyPricing {
  id: string;
  occupantCount: number;
  amount: number;
}

export interface RoomAmounts {
  baseAmount: number;
  extraAdultAmount: number;
  extraChildAmount: number;
  extraInfantAmount: number;
}

export interface ParameterSet {
  id: string;
  dateRanges: DateRange[];
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  chargeType: ChargeType;
  daysOfWeek: string[];
  description?: string;
  roomAmounts?: RoomAmounts;
  occupantAmounts?: OccupantAmounts;
  condition?: LogicalCondition;
}

export interface LogicalCondition {
  type: 'and' | 'or' | 'not' | 'xor';
  operands: Array<LogicalCondition | keyof Omit<ParameterSet, 'id' | 'condition'>>;
}

export interface SupplementValue {
  id: string;
  amount: number;
  currency: string;
  parameters: ParameterSet;
  priority?: number;
}

export interface Conflict {
  valueIds: string[];
  conflictingParameters: Array<keyof Omit<ParameterSet, 'id' | 'condition'>>;
}
