export type ActivityType =
  | 'car'
  | 'bus'
  | 'flight'
  | 'electricity'
  | 'veg_meal'
  | 'non_veg_meal';

export type ActivityCategory = 'transport' | 'travel' | 'electricity' | 'food';

export interface ActivityDefinition {
  type: ActivityType;
  label: string;
  category: ActivityCategory;
  categoryLabel: string;
  unit: string;
  emissionFactor: number; // kg CO2 per unit
  description: string;
  absurdThreshold: number; // Values exceeding this trigger confirmation modal
}

export interface Activity {
  id: string;
  activity_type: ActivityType;
  quantity: number;
  unit: string;
  emission_factor: number;
  co2_kg: number;
  activity_date: string; // YYYY-MM-DD (strictly persistent)
  created_at: string;    // ISO timestamp
}

export interface UserSettings {
  id: string;
  personal_weekly_target: number; // Default 100 kg CO2
  updated_at: string;
}

export interface ComplianceWeek {
  id: string;
  week_start: string; // YYYY-MM-DD (Monday)
  week_end: string;   // YYYY-MM-DD (Sunday)
  total_co2: number;
  government_threshold: number; // Fixed at 100 kg
  exceeded: boolean;
  first_violation: boolean;
  fee_amount: number; // 0 or 10
  created_at: string;
  updated_at: string;
}

export type ComplianceStatus = 'ON TRACK' | 'APPROACHING LIMIT' | 'NEAR LIMIT' | 'LIMIT EXCEEDED';

export interface WeeklyComplianceSummary {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  weekLabel: string; // e.g. "Sep 14 – Sep 20, 2026"
  isCurrentWeek: boolean;
  totalCo2: number;
  everydayCo2: number;
  travelCo2: number;
  governmentThreshold: number; // 100.00 kg
  personalTarget: number;       // default 100.00 kg
  percentageUsed: number;
  remainingCo2: number;
  status: ComplianceStatus;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  isExceeded: boolean;
  isFirstViolation: boolean;
  feeAmount: number; // 0 or 10
  feeStatusLabel: string;
  activitiesCount: number;
}

export interface CategoryBreakdownItem {
  category: ActivityCategory;
  label: string;
  co2_kg: number;
  percentage: number;
  color: string;
  itemCount: number;
}

export interface MonthlyTravelAllowance {
  month: string; // YYYY-MM
  monthLabel: string; // e.g. "September 2026"
  travelCo2: number;
  allowanceLimit: number; // 200.00 kg
  remaining: number;
  percentageUsed: number;
  isExceeded: boolean;
}

export interface DeterministicInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
}
