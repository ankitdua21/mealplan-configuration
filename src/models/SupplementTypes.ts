
export interface Supplement {
  id: string;
  name: string;
  type: 'mealplan' | 'spa' | 'gym' | 'other';
  description: string;
  values: SupplementValue[];
}

export interface DateRange {
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

export type ChargeType = 'per-room' | 'per-adult' | 'per-occupant';

export interface ParameterSet {
  id: string;
  dateRanges: DateRange[];
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  chargeType: ChargeType;
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
