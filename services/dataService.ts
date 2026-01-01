
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { FinancialProfile, DelegationItem, LifeContext, YearlyCompassData, ContextAnalysisResult, AssetItem, MonthlyNote, STORAGE_KEY } from '../types';

export interface FullUserData {
  profile: FinancialProfile;
  delegations: DelegationItem[];
  assets: AssetItem[]; 
  lifeContext: LifeContext | null;
  analysisResult: ContextAnalysisResult | null;
  yearCompass: YearlyCompassData;
  monthlyNotes: MonthlyNote[]; // NEW
}

const DEFAULT_PROFILE: FinancialProfile = {
  netIncome: 0,
  contractHoursWeekly: 40,
  commuteMinutesDaily: 60,
  aspirationalIncome: 0
};

const DEFAULT_COMPASS: YearlyCompassData = {
  goal1: { text: "", indicator: "", completed: false },
  goal2: { text: "", indicator: "", completed: false },
  goal3: { text: "", indicator: "", completed: false },
  financialGoal: { targetMonthlyIncome: 0, targetTHL: 0, deadlineMonth: "" }
};

// --- MOCK DATA FOR DEMO MODE ---
const MOCK_DATA: FullUserData = {
  profile: {
    netIncome: 35000,
    contractHoursWeekly: 45,
    commuteMinutesDaily: 40,
    aspirationalIncome: 80000
  },
  delegations: [
    { id: 'mock-1', name: 'Faxina Semanal', cost: 800, hoursSaved: 16, frequency: 'monthly', category: 'cleaning', archetype: 'CAMEL' },
    { id: 'mock-2', name: 'Motorista App (Deslocamentos)', cost: 1200, hoursSaved: 20, frequency: 'monthly', category: 'transport', archetype: 'CAMEL' },
    { id: 'mock-3', name: 'Assistente Virtual (Emails)', cost: 1500, hoursSaved: 30, frequency: 'monthly', category: 'admin', archetype: 'CAMEL' }
  ],
  assets: [
    {
      id: 'mock-a1',
      name: 'BMW 320i',
      description: 'Veículo principal, ano 2022.',
      purchaseYear: 2022,
      purchaseValue: 280000,
      category: 'VEHICLE',
      aiAnalysis: {
        currentValueEstimated: 245000,
        depreciationTrend: 'DEPRECIATING',
        liquidityScore: 60,
        maintenanceCostMonthlyEstimate: 2500,
        commentary: 'Ativo de alta depreciação e custo de manutenção. Considere se o status compensa o custo de oportunidade.'
      }
    },
    {
      id: 'mock-a2',
      name: 'Carteira Bitcoin (Cold Wallet)',
      description: 'Reserva de valor soberana.',
      purchaseYear: 2020,
      purchaseValue: 50000,
      category: 'INVESTMENT',
      aiAnalysis: {
        currentValueEstimated: 180000,
        depreciationTrend: 'APPRECIATING',
        liquidityScore: 90,
        maintenanceCostMonthlyEstimate: 0,
        commentary: 'Excelente reserva de valor com alta liquidez e sem custo de manutenção. Um ativo "Estrela".'
      }
    },
    {
      id: 'mock-a3',
      name: 'MacBook Pro M3 Max',
      description: 'Ferramenta de trabalho essencial.',
      purchaseYear: 2024,
      purchaseValue: 25000,
      category: 'ELECTRONICS',
      aiAnalysis: {
        currentValueEstimated: 22000,
        depreciationTrend: 'STABLE',
        liquidityScore: 70,
        maintenanceCostMonthlyEstimate: 0,
        commentary: 'Ferramenta produtiva. Deprecia, mas gera alavancagem operacional (ROI positivo indireto).'
      }
    }
  ],
  lifeContext: {
    routineDescription: "Acordo às 5:30, treino musculação. Trabalho das 9h às 19h liderando time de vendas. Gasto muito tempo em reuniões operacionais que poderiam ser emails. No trânsito, escuto audiobooks. Fim de semana tento descansar mas acabo resolvendo pendências da casa.",
    assetsDescription: "Carro premium, alguns investimentos em cripto e renda fixa, apartamento financiado.",
    sleepHours: 6.5,
    physicalActivityMinutes: 200,
    studyMinutes: 120,
    lastUpdated: new Date().toISOString(),
    eternalReturnScore: 68,
    eternalReturnText: "Sua rotina mostra ambição, mas você está preso no arquétipo do Leão: conquista muito, mas carrega o mundo nas costas. O trânsito e as reuniões operacionais são seus maiores drenos de vida."
  },
  analysisResult: {
    delegationSuggestions: [
      { id: 'sug-1', name: 'Personal Chef / Marmitas', cost: 600, hoursSaved: 12, frequency: 'monthly', category: 'other', archetype: 'CAMEL' },
      { id: 'sug-2', name: 'Automação de Relatórios', cost: 200, hoursSaved: 8, frequency: 'monthly', category: 'software', archetype: 'CAMEL' }
    ],
    sunkCostSuspects: [],
    lifestyleRisks: ["Financiamento imobiliário comprometendo liquidez", "Carro de luxo com alto custo mensal"],
    summary: "Você é um High Performer preso em tarefas operacionais. Sua renda é excelente (Classe A), mas sua autonomia é média. Você troca tempo por dinheiro numa taxa alta, mas ainda troca. O objetivo agora é desconectar a renda da sua presença física.",
    eternalReturnScore: 68,
    eternalReturnAnalysis: "Sua rotina mostra ambição, mas você está preso no arquétipo do Leão.",
    matrixCoordinates: {
      x: 45, // Autonomia média/baixa
      y: 85, // Eficiência alta
      quadrantLabel: "O Leão (Eficiente mas Preso)"
    }
  },
  yearCompass: {
    goal1: { text: "Atingir R$ 100k/mês de Faturamento", indicator: "Faturamento mensal recorrente > 100k", completed: false },
    goal2: { text: "Delegar 100% do operacional da empresa", indicator: "Menos de 2h/semana em tarefas manuais", completed: false },
    goal3: { text: "Completar um Ironman 70.3", indicator: "Cruzar a linha de chegada < 6h", completed: true },
    financialGoal: { targetMonthlyIncome: 80000, targetTHL: 500, deadlineMonth: "Dezembro 2025" }
  },
  monthlyNotes: [
    { month: 1, year: 2025, content: "Janeiro: Foco total em aumentar a THL. Cortei reuniões inúteis.", updatedAt: new Date().toISOString() }
  ]
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

const isDemo = (userId: string) => userId === 'demo_user';

export const dataService = {
  isConfigured: isSupabaseConfigured,

  /**
   * Loads all user data
   */
  loadFullData: async (userId: string): Promise<FullUserData> => {
    // SE FOR USUÁRIO DEMO, RETORNA DADOS MOCKADOS IMEDIATAMENTE
    if (isDemo(userId)) {
        return MOCK_DATA;
    }

    if (!isSupabaseConfigured) {
       const data = getLocalData();
       return {
         profile: data.profile || DEFAULT_PROFILE,
         delegations: data.delegations || [],
         assets: data.assets || [],
         lifeContext: data.lifeContext || null,
         analysisResult: data.analysisResult || null,
         yearCompass: data.yearCompass || DEFAULT_COMPASS,
         monthlyNotes: data.monthlyNotes || []
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
      
    // 3. Assets (NEW)
    const { data: assetsData } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);

    // 4. Life Context
    const { data: contextData } = await supabase
      .from('life_contexts')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 5. Year Compass
    const { data: compassData } = await supabase
      .from('year_compass')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 6. Monthly Notes (NEW)
    const { data: notesData } = await supabase
      .from('monthly_notes')
      .select('*')
      .eq('user_id', userId);

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
      hours_saved: Number(d.hours_saved),
      frequency: d.frequency,
      category: d.category,
      archetype: d.archetype
    }));
    
    const assets: AssetItem[] = (assetsData || []).map((a: any) => ({
       id: a.id,
       name: a.name,
       description: a.description,
       purchaseYear: a.purchase_year,
       purchaseValue: Number(a.purchase_value),
       category: a.category,
       aiAnalysis: a.current_value_est ? {
          currentValueEstimated: Number(a.current_value_est),
          depreciationTrend: a.appreciation_rate as any,
          liquidityScore: 50, // Default if not saved individually
          maintenanceCostMonthlyEstimate: 0, // Default if not saved
          commentary: a.liabilities_text
       } : undefined
    }));

    const lifeContext: LifeContext | null = contextData ? {
      routineDescription: contextData.routine_description,
      assetsDescription: contextData.assets_description,
      sleepHours: Number(contextData.sleep_hours || 7),
      physicalActivityMinutes: Number(contextData.physical_activity_minutes || 0),
      studyMinutes: Number(contextData.study_minutes || 0),
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
      goal1: { 
          text: compassData.goal1_text || "", 
          indicator: compassData.goal1_indicator || "", 
          completed: compassData.goal1_completed 
      },
      goal2: { 
          text: compassData.goal2_text || "", 
          indicator: compassData.goal2_indicator || "", 
          completed: compassData.goal2_completed 
      },
      goal3: { 
          text: compassData.goal3_text || "", 
          indicator: compassData.goal3_indicator || "", 
          completed: compassData.goal3_completed 
      },
      financialGoal: {
        targetMonthlyIncome: Number(compassData.financial_target_income),
        targetTHL: 0,
        deadlineMonth: compassData.financial_deadline || "" 
      }
    } : DEFAULT_COMPASS;

    const monthlyNotes: MonthlyNote[] = (notesData || []).map((n: any) => ({
      id: n.id,
      month: n.month,
      year: n.year,
      content: n.content,
      updatedAt: n.updated_at
    }));

    return { profile, delegations, assets, lifeContext, analysisResult, yearCompass, monthlyNotes };
  },

  /**
   * Saves Profile Data
   */
  saveProfile: async (userId: string, profile: FinancialProfile) => {
    if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) saveLocalData({ profile });
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
    if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) saveLocalData({ yearCompass: data });
        return { error: null };
    }
    return supabase.from('year_compass').upsert({
      user_id: userId,
      goal1_text: data.goal1.text,
      goal1_indicator: data.goal1.indicator,
      goal1_completed: data.goal1.completed,
      goal2_text: data.goal2.text,
      goal2_indicator: data.goal2.indicator,
      goal2_completed: data.goal2.completed,
      goal3_text: data.goal3.text,
      goal3_indicator: data.goal3.indicator,
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
    if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) saveLocalData({ lifeContext: context, analysisResult: analysis });
        return { error: null };
    }
    const payload: any = {
      user_id: userId,
      routine_description: context.routineDescription,
      assets_description: context.assetsDescription,
      sleep_hours: context.sleepHours,
      physical_activity_minutes: context.physicalActivityMinutes,
      study_minutes: context.studyMinutes,
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
   * Save a Monthly Note
   */
  saveNote: async (userId: string, note: MonthlyNote) => {
    if (!isSupabaseConfigured || isDemo(userId)) {
      if (!isDemo(userId)) {
        const current = getLocalData();
        const notes = current.monthlyNotes || [];
        // Remove existing note for that month/year if exists
        const filtered = notes.filter((n: MonthlyNote) => !(n.month === note.month && n.year === note.year));
        saveLocalData({ monthlyNotes: [...filtered, note] });
      }
      return { error: null };
    }

    // Using Upsert based on composite key logic via SQL policies or ensuring uniqueness in application logic
    // Supabase needs a unique constraint or primary key to upsert. 
    // Assuming we don't have a unique constraint on (user_id, month, year) yet in SQL, we can try to insert/update based on ID or select first.
    // Better strategy: We can assume the frontend passes an ID if it exists, or we query first.
    // However, simplest "upsert" for this logic without unique constraint is DELETE then INSERT, or use a Match query.
    
    // Efficient strategy: Use `upsert` matching on a unique constraint if we added one, 
    // BUT since I can't guarantee the user ran a complex migration with constraints, 
    // I will use a SELECT -> UPDATE/INSERT pattern to be safe, or just insert.
    
    // Let's rely on the client knowing the ID if it was loaded, OR check existence.
    const { data: existing } = await supabase
        .from('monthly_notes')
        .select('id')
        .eq('user_id', userId)
        .eq('month', note.month)
        .eq('year', note.year)
        .single();
    
    if (existing) {
       return supabase
         .from('monthly_notes')
         .update({ content: note.content, updated_at: new Date().toISOString() })
         .eq('id', existing.id);
    } else {
       return supabase
         .from('monthly_notes')
         .insert({
            user_id: userId,
            month: note.month,
            year: note.year,
            content: note.content,
            updated_at: new Date().toISOString()
         });
    }
  },

  /**
   * Adds a delegation item
   */
  addDelegation: async (userId: string, item: DelegationItem) => {
    if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) {
            const current = getLocalData();
            const list = current.delegations || [];
            if (!list.find((i: DelegationItem) => i.id === item.id)) {
                saveLocalData({ delegations: [...list, item] });
            }
        }
        return { error: null };
    }
    const { error } = await supabase.from('delegations').insert({
      id: item.id,
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
     if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) {
            const current = getLocalData();
            const list = current.delegations || [];
            saveLocalData({ delegations: list.filter((i: DelegationItem) => i.id !== itemId) });
        }
        return { error: null };
     }
     return supabase.from('delegations').delete().eq('id', itemId).eq('user_id', userId);
  },
  
  /**
   * Adds an Asset Item
   */
  addAsset: async (userId: string, item: AssetItem) => {
    if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) {
            const current = getLocalData();
            const list = current.assets || [];
            if (!list.find((i: AssetItem) => i.id === item.id)) {
                saveLocalData({ assets: [...list, item] });
            }
        }
        return { error: null };
    }
    const { error } = await supabase.from('assets').insert({
      id: item.id,
      user_id: userId,
      name: item.name,
      description: item.description,
      purchase_year: item.purchaseYear,
      purchase_value: item.purchaseValue,
      category: item.category,
      // Flattening AI analysis for SQL storage
      current_value_est: item.aiAnalysis?.currentValueEstimated,
      appreciation_rate: item.aiAnalysis?.depreciationTrend,
      liabilities_text: item.aiAnalysis?.commentary
    });
    return error;
  },
  
  /**
   * Removes an Asset Item
   */
  removeAsset: async (userId: string, itemId: string) => {
     if (!isSupabaseConfigured || isDemo(userId)) {
        if (!isDemo(userId)) {
            const current = getLocalData();
            const list = current.assets || [];
            saveLocalData({ assets: list.filter((i: AssetItem) => i.id !== itemId) });
        }
        return { error: null };
     }
     return supabase.from('assets').delete().eq('id', itemId).eq('user_id', userId);
  }
};
