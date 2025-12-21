
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { FinancialProfile, DelegationItem, LifeContext, YearlyCompassData, ContextAnalysisResult, STORAGE_KEY } from '../types';

export interface FullUserData {
  profile: FinancialProfile;
  delegations: DelegationItem[];
  lifeContext: LifeContext | null;
  analysisResult: ContextAnalysisResult | null;
  yearCompass: YearlyCompassData;
}

const DEFAULT_PROFILE: FinancialProfile = {
  netIncome: 0,
  contractHoursWeekly: 40,
  commuteMinutesDaily: 60,
  aspirationalIncome: 0
};

const DEFAULT_COMPASS: YearlyCompassData = {
  goal1: { text: "", completed: false },
  goal2: { text: "", completed: false },
  goal3: { text: "", completed: false },
  financialGoal: { targetMonthlyIncome: 0, targetTHL: 0, deadlineMonth: "" }
};

// --- Local Storage Helpers (Fallback) ---
const getLocalData = (): any => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
};

const saveLocalData = (data: any) => {
  const current = getLocalData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
};

export const dataService = {
  isConfigured: isSupabaseConfigured,

  /**
   * Loads all user data
   */
  loadFullData: async (userId: string): Promise<FullUserData> => {
    if (!isSupabaseConfigured) {
       const data = getLocalData();
       return {
         profile: data.profile || DEFAULT_PROFILE,
         delegations: data.delegations || [],
         lifeContext: data.lifeContext || null,
         analysisResult: data.analysisResult || null,
         yearCompass: data.yearCompass || DEFAULT_COMPASS
       };
    }

    // 1. Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Delegations
    const { data: delegationData } = await supabase
      .from('delegations')
      .select('*')
      .eq('user_id', userId);

    // 3. Life Context
    const { data: contextData } = await supabase
      .from('life_contexts')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 4. Year Compass
    const { data: compassData } = await supabase
      .from('year_compass')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Mapping Database to Types
    const profile: FinancialProfile = profileData ? {
      netIncome: Number(profileData.net_income),
      contractHoursWeekly: Number(profileData.contract_hours_weekly),
      commuteMinutesDaily: Number(profileData.commute_minutes_daily),
      aspirationalIncome: Number(profileData.aspirational_income)
    } : DEFAULT_PROFILE;

    const delegations: DelegationItem[] = (delegationData || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      cost: Number(d.cost),
      hoursSaved: Number(d.hours_saved),
      frequency: d.frequency,
      category: d.category,
      archetype: d.archetype
    }));

    const lifeContext: LifeContext | null = contextData ? {
      routineDescription: contextData.routine_description,
      assetsDescription: contextData.assets_description,
      lastUpdated: contextData.last_updated,
      eternalReturnScore: contextData.eternal_return_score,
      eternalReturnText: contextData.eternal_return_text
    } : null;

    const analysisResult: ContextAnalysisResult | null = contextData && contextData.matrix_x ? {
      delegationSuggestions: [], 
      sunkCostSuspects: [], 
      lifestyleRisks: [],
      summary: "Análise carregada do histórico.",
      eternalReturnScore: contextData.eternal_return_score,
      eternalReturnAnalysis: contextData.eternal_return_text,
      matrixCoordinates: {
        x: Number(contextData.matrix_x),
        y: Number(contextData.matrix_y),
        quadrantLabel: contextData.matrix_label
      }
    } : null;

    const yearCompass: YearlyCompassData = compassData ? {
      goal1: { text: compassData.goal1_text || "", completed: compassData.goal1_completed },
      goal2: { text: compassData.goal2_text || "", completed: compassData.goal2_completed },
      goal3: { text: compassData.goal3_text || "", completed: compassData.goal3_completed },
      financialGoal: {
        targetMonthlyIncome: Number(compassData.financial_target_income),
        targetTHL: 0,
        deadlineMonth: compassData.financial_deadline || ""
      }
    } : DEFAULT_COMPASS;

    return { profile, delegations, lifeContext, analysisResult, yearCompass };
  },

  /**
   * Saves Profile Data
   */
  saveProfile: async (userId: string, profile: FinancialProfile) => {
    if (!isSupabaseConfigured) {
        saveLocalData({ profile });
        return { error: null };
    }
    return supabase.from('profiles').upsert({
      id: userId,
      net_income: profile.netIncome,
      contract_hours_weekly: profile.contractHoursWeekly,
      commute_minutes_daily: profile.commuteMinutesDaily,
      aspirational_income: profile.aspirationalIncome,
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Saves Compass Data
   */
  saveCompass: async (userId: string, data: YearlyCompassData) => {
    if (!isSupabaseConfigured) {
        saveLocalData({ yearCompass: data });
        return { error: null };
    }
    return supabase.from('year_compass').upsert({
      user_id: userId,
      goal1_text: data.goal1.text,
      goal1_completed: data.goal1.completed,
      goal2_text: data.goal2.text,
      goal2_completed: data.goal2.completed,
      goal3_text: data.goal3.text,
      goal3_completed: data.goal3.completed,
      financial_target_income: data.financialGoal.targetMonthlyIncome,
      financial_deadline: data.financialGoal.deadlineMonth,
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Upserts Life Context
   */
  saveContext: async (userId: string, context: LifeContext, analysis?: ContextAnalysisResult) => {
    if (!isSupabaseConfigured) {
        saveLocalData({ lifeContext: context, analysisResult: analysis });
        return { error: null };
    }
    const payload: any = {
      user_id: userId,
      routine_description: context.routineDescription,
      assets_description: context.assetsDescription,
      eternal_return_score: context.eternalReturnScore,
      eternal_return_text: context.eternalReturnText,
      last_updated: new Date().toISOString()
    };

    if (analysis && analysis.matrixCoordinates) {
      payload.matrix_x = analysis.matrixCoordinates.x;
      payload.matrix_y = analysis.matrixCoordinates.y;
      payload.matrix_label = analysis.matrixCoordinates.quadrantLabel;
    }

    return supabase.from('life_contexts').upsert(payload);
  },

  /**
   * Adds a delegation item
   */
  addDelegation: async (userId: string, item: DelegationItem) => {
    if (!isSupabaseConfigured) {
        const current = getLocalData();
        const list = current.delegations || [];
        // avoid duplicates by ID if possible, but for array push just push
        if (!list.find((i: DelegationItem) => i.id === item.id)) {
            saveLocalData({ delegations: [...list, item] });
        }
        return { error: null };
    }
    const { error } = await supabase.from('delegations').insert({
      user_id: userId,
      name: item.name,
      cost: item.cost,
      hours_saved: item.hoursSaved,
      frequency: item.frequency,
      category: item.category,
      archetype: item.archetype
    });
    return error;
  },

  /**
   * Removes a delegation item
   */
  removeDelegation: async (userId: string, itemId: string) => {
     if (!isSupabaseConfigured) {
        const current = getLocalData();
        const list = current.delegations || [];
        saveLocalData({ delegations: list.filter((i: DelegationItem) => i.id !== itemId) });
        return { error: null };
     }
     return supabase.from('delegations').delete().eq('id', itemId).eq('user_id', userId);
  }
};
