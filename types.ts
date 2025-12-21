
export interface FinancialProfile {
  netIncome: number;
  contractHoursWeekly: number;
  commuteMinutesDaily: number;
  aspirationalIncome: number;
}

export interface CalculatedTHL {
  realTHL: number;
  aspirationalTHL: number;
  monthlyTotalHours: number;
  monthlyCommuteHours: number;
}

export type NietzscheArchetype = 'CAMEL' | 'LION' | 'CHILD';

export interface DelegationItem {
  id: string;
  name: string;
  cost: number;
  hoursSaved: number;
  frequency: 'once' | 'weekly' | 'monthly';
  category: 'cleaning' | 'transport' | 'admin' | 'software' | 'other';
  archetype?: NietzscheArchetype; // Added for The Three Metamorphoses
}

export interface SunkCostScenario {
  id: string;
  title: string;
  description: string;
  investedTimeMonths: number;
  investedMoney: number;
  projectedFutureCostMoney: number;
  projectedFutureCostTime: number;
  probabilityOfSuccess: number; // 0-100
  aiAnalysis?: string;
  decision?: 'ABANDON' | 'PIVOT' | 'PERSEVERE';
}

export interface ParetoResult {
  vitalFew: {
    task: string;
    impact: string;
  }[];
  trivialMany: {
    task: string;
    action: 'ELIMINATE' | 'DELEGATE' | 'AUTOMATE';
    reasoning: string;
  }[];
}

export interface RazorAnalysis {
  occam: string; // Simplicidade
  inversion: string; // Via Negativa
  regret: string; // Minimização de Arrependimento
  synthesis: string; // Conclusão Final
}

export interface PreMortemResult {
  deathDate: string;
  causeOfDeath: string;
  autopsyReport: {
    cause: string;
    prevention: string;
  }[];
}

export interface TimeTravelResult {
  pathA: {
    title: string;
    memoir: string;
    regretLevel: number; // 0-10
  };
  pathB: {
    title: string;
    memoir: string;
    regretLevel: number; // 0-10
  };
  synthesis: string;
}

export interface EnergyAuditItem {
  task: string;
  energy: 'GAIN' | 'DRAIN';
  value: 'HIGH' | 'LOW';
  quadrant: 'GENIUS' | 'TRAP' | 'GRIND' | 'DUMP';
  advice: string;
}

export interface SkillAnalysis {
  isRealistic: boolean;
  commentary: string;
  marketRealityCheck: string;
}

export interface InactionAnalysis {
  cumulativeCost6Months: number;
  cumulativeCost1year: number;
  cumulativeCost3years: number;
  intangibleCosts: string[];
  callToAction: string;
}

export interface LifestyleAudit {
  hoursOfLifeLost: number;
  futureValueLost: number; // if invested over 10 years
  paretoAlternative: {
    name: string;
    priceEstimate: number;
    reasoning: string;
  };
  verdict: 'BUY' | 'WAIT' | 'DOWNGRADE';
}

export interface LifeContext {
  routineDescription: string;
  assetsDescription: string;
  lastUpdated: string;
  eternalReturnScore?: number; // 0-100 (Nietzschean Metric)
  eternalReturnText?: string;
}

export interface AnalysisCoordinates {
  x: number; // Autonomy (0-100)
  y: number; // Efficiency (0-100)
  quadrantLabel: string;
}

export interface ContextAnalysisResult {
  delegationSuggestions: DelegationItem[];
  sunkCostSuspects: { title: string; description: string }[];
  lifestyleRisks: string[];
  summary: string;
  eternalReturnScore?: number;
  eternalReturnAnalysis?: string;
  matrixCoordinates?: AnalysisCoordinates; // Added for X/Y Chart
}

export interface YearlyCompassData {
  goal1: { text: string; completed: boolean };
  goal2: { text: string; completed: boolean };
  goal3: { text: string; completed: boolean };
  financialGoal: {
    targetMonthlyIncome: number;
    targetTHL: number;
    deadlineMonth: string;
  };
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  THL_CALCULATOR = 'THL_CALCULATOR',
  LIFE_CONTEXT = 'LIFE_CONTEXT',
  DIAGNOSIS = 'DIAGNOSIS',
  YEARLY_GOALS = 'YEARLY_GOALS',
  DELEGATION = 'DELEGATION',
  SUNK_COST = 'SUNK_COST',
  NEGOTIATOR = 'NEGOTIATOR',
  PARETO = 'PARETO',
  DEEP_WORK = 'DEEP_WORK',
  RAZORS = 'RAZORS',
  ENERGY_AUDIT = 'ENERGY_AUDIT',
  SKILL_ROI = 'SKILL_ROI',
  INACTION_CALC = 'INACTION_CALC',
  LIFESTYLE_INFLATOR = 'LIFESTYLE_INFLATOR',
  SETTINGS = 'SETTINGS',
  DOCS = 'DOCS',
  BUG_TRACKER = 'BUG_TRACKER',
  CHAT = 'CHAT'
}

export const STORAGE_KEY = 'oiq_user_data_v1';
