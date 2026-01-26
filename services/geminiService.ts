
import { GoogleGenAI } from "@google/genai";
import type { Chat } from "@google/genai";
import { getGeminiApiKey, MODEL_CASCADE, SYSTEM_INSTRUCTIONS } from "./aiConfig";
import { 
  FinancialProfile, 
  ParetoResult, 
  RazorAnalysis, 
  EnergyAuditItem, 
  PreMortemResult, 
  TimeTravelResult, 
  LifestyleAudit, 
  ContextAnalysisResult, 
  NietzscheArchetype, 
  AssetItem,
  SunkCostScenario,
  SkillAnalysis,
  InactionAnalysis,
  CalculatedTHL,
  YearlyCompassData
} from "../types";

// --- CLIENT FACTORY ---
const createClient = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey || apiKey.includes('placeholder')) {
    console.error("Critical: Invalid API Key");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

// --- SMART RUNNER ARCHITECTURE ---

interface RunnerParams {
  contents: string | any;
  systemInstruction?: string;
  responseSchema?: any;
  isJson?: boolean;
}

/**
 * Smart Runner: Itera sobre modelos em cascata para garantir resiliência.
 * Trata erros de segurança (403) separadamente de erros de rede.
 */
async function smartRunner(params: RunnerParams) {
  const ai = createClient();
  let lastError: any = null;

  // Itera sobre a cascata de modelos definida na config
  for (const modelName of MODEL_CASCADE) {
    try {
      // Configuração da requisição
      const config: any = {
        systemInstruction: params.systemInstruction || SYSTEM_INSTRUCTIONS.DEFAULT,
        temperature: 0.7,
      };

      if (params.isJson) {
        config.responseMimeType = "application/json";
        // Reforça a instrução de sistema para JSON se não houver uma específica
        if (!config.systemInstruction.includes("JSON")) {
             config.systemInstruction += " " + SYSTEM_INSTRUCTIONS.JSON_MODE;
        }
        if (params.responseSchema) {
          config.responseSchema = params.responseSchema;
        }
      }

      // console.log(`Tentando conectar com modelo: ${modelName}...`);

      // Chamada via SDK novo (@google/genai)
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: config
      });

      // Validação da resposta
      if (!response || !response.text) {
        throw new Error("EMPTY_RESPONSE");
      }

      // Sucesso!
      return response.text;

    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || JSON.stringify(error);

      // Segurança: Se a chave for vazada ou bloqueada (403), pare imediatamente.
      // Não adianta tentar outros modelos se a chave é inválida.
      if (errorMsg.includes('403') || errorMsg.includes('API key not valid') || errorMsg.includes('400')) {
        console.error("SECURITY ALERT: API Key Rejected/Leaked/Invalid.");
        throw new Error("SECURITY_BLOCK_403");
      }

      // Se for rate limit (429) ou erro de modelo (404/500), continua para o próximo modelo
      console.warn(`SmartRunner: Modelo ${modelName} falhou (${errorMsg}). Tentando fallback...`);
      continue; 
    }
  }

  // Se todos falharem
  console.error("SmartRunner: Todos os modelos da cascata falharam.", lastError);
  throw lastError;
}

// --- JSON PARSER HELPERS ---

const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) throw new Error("Texto vazio");
  try {
    // 1. Tenta parse direto
    return JSON.parse(text);
  } catch (e) {
    // 2. Tenta extrair de blocos de código markdown (case insensitive, opcional 'json')
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch?.[1]) {
      try { return JSON.parse(codeBlockMatch[1]); } catch(e2) {}
    }
    
    // 3. Heurística: Tenta encontrar o primeiro { ou [ e o último } ou ]
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    let startIdx = -1;
    let endIdx = -1;

    // Determina onde começa o JSON
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = text.lastIndexOf('}');
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = text.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1) {
       const jsonCandidate = text.substring(startIdx, endIdx + 1);
       try { return JSON.parse(jsonCandidate); } catch(e3) {}
    }

    console.error("Falha fatal no parse JSON. Texto bruto:", text);
    throw new Error("JSON_PARSE_ERROR");
  }
};

// --- SERVICES IMPL ---

export const analyzeAsset = async (name: string, description: string, value: number, year: number): Promise<AssetItem['aiAnalysis']> => {
  try {
    const text = await smartRunner({
      contents: `Analise o bem "${name}" (${description}), comprado por R$${value} em ${year}. Estime valor atual de mercado (currentValueEstimated) e custo mensal oculto (maintenanceCostMonthlyEstimate). Responda JSON com os campos: currentValueEstimated (number), depreciationTrend (APPRECIATING, DEPRECIATING, STABLE), liquidityScore (0-100), maintenanceCostMonthlyEstimate (number), commentary (string curta).`,
      isJson: true,
      systemInstruction: SYSTEM_INSTRUCTIONS.JSON_MODE
    });
    return cleanAndParseJSON(text);
  } catch (e: any) {
    console.error("Erro analyzeAsset:", e);
    const isSecurity = e.message === 'SECURITY_BLOCK_403';
    return {
      currentValueEstimated: value, // Retorna valor original como fallback
      depreciationTrend: 'STABLE',
      liquidityScore: 0,
      maintenanceCostMonthlyEstimate: 0,
      commentary: isSecurity ? "ERRO CRÍTICO: Chave de API Inválida/Bloqueada." : "Sistema Offline: Não foi possível conectar à IA."
    };
  }
};

export const getPhilosophicalAnalysis = async (dilemma: string): Promise<RazorAnalysis> => {
  try {
    const text = await smartRunner({
      contents: `Analise o dilema "${dilemma}" usando as Navalhas de Occam, Inversão e Regret.`,
      isJson: true
    });
    return cleanAndParseJSON(text);
  } catch (e: any) {
    if (e.message === 'SECURITY_BLOCK_403') return { occam: "Erro 403", inversion: "Chave API Bloqueada", regret: "Verifique Configurações", synthesis: "Sistema pausado por segurança." };
    return {
      occam: "Simplifique o problema.",
      inversion: "O que evitar?",
      regret: "Pense no longo prazo.",
      synthesis: "IA em repouso. Use sua intuição."
    };
  }
};

export const analyzeLifeContext = async (routine: string, assets: AssetItem[], thl: number, profile: FinancialProfile, sleepHours: number = 7): Promise<ContextAnalysisResult> => {
  try {
    const assetSummary = assets.map(a => a.name).join(", ");
    const text = await smartRunner({
      contents: `Auditoria Forense de Vida. Renda Líquida: R$ ${profile.netIncome}. THL Real: R$ ${thl.toFixed(2)}. Sono: ${sleepHours}h. Rotina descrita: "${routine}". Ativos: ${assetSummary}. Identifique gargalos, custos irrecuperáveis e sugira delegações.`,
      isJson: true,
      systemInstruction: "Você é Zeus. Use as Metamorfoses de Nietzsche. Retorne JSON estrito com: delegationSuggestions (array de objetos {name, cost, hoursSaved, frequency, category, archetype}), sunkCostSuspects (array), lifestyleRisks (array de strings), summary (string), eternalReturnScore (0-100), eternalReturnAnalysis (string), matrixCoordinates ({x, y, quadrantLabel})."
    });
    return cleanAndParseJSON(text);
  } catch (e: any) {
    console.error("Erro na Auditoria:", e);
    return {
      delegationSuggestions: [],
      sunkCostSuspects: [],
      lifestyleRisks: ["Erro de conexão com Inteligência Central"],
      summary: e.message === 'SECURITY_BLOCK_403' ? "ACESSO NEGADO: Chave de API revogada ou inválida." : "Não foi possível conectar à IA. Tente novamente.",
      eternalReturnScore: 50,
      matrixCoordinates: { x: 50, y: 50, quadrantLabel: "Desconhecido" }
    };
  }
};

// Chat especializado usa streaming e precisa instanciar direto, mas usa o helper de Key
export const createSpecialistChat = (thl: number, context: string): Chat => {
  const ai = createClient();
  // Tenta o modelo primário para chat
  const modelToUse = MODEL_CASCADE[0];
  
  return ai.chats.create({
    model: modelToUse, 
    config: { 
      systemInstruction: `Persona: Nietzsche + Pareto. THL: R$ ${thl.toFixed(2)}. Contexto: ${context}` 
    },
  });
};

export const getSunkCostAnalysis = async (scenario: SunkCostScenario, thl: CalculatedTHL): Promise<string> => {
  try {
    return await smartRunner({ 
      contents: `Analise Sunk Cost: ${scenario.title}. THL: ${thl.realTHL}. Futuro: R$${scenario.projectedFutureCostMoney}`, 
      isJson: false 
    });
  } catch (e) {
    return "O passado é imutável. Foque apenas no custo futuro. (IA Offline)";
  }
};

export const getRefusalScripts = async (request: string): Promise<{ diplomatic: string, direct: string, alternative: string }> => {
  try {
    const text = await smartRunner({ 
      contents: `Gere scripts para dizer NÃO a: "${request}"`, 
      isJson: true 
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { diplomatic: "Não posso agora.", direct: "Não.", alternative: "Tente outra pessoa." };
  }
};

export const getSkillAnalysis = async (skill: string, currentTHL: number, increase: number): Promise<SkillAnalysis> => {
  try {
    const text = await smartRunner({ 
      contents: `ROI da skill "${skill}" para aumentar THL em ${increase}%`, 
      isJson: true 
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { isRealistic: true, marketRealityCheck: "Dados indisponíveis.", commentary: "Aprender sempre vale a pena." };
  }
};

export const getInactionAnalysis = async (decision: string, monthlyCost: number): Promise<InactionAnalysis> => {
  try {
    const text = await smartRunner({ 
      contents: `Custo da inação para "${decision}". Custo mensal: R$ ${monthlyCost}`, 
      isJson: true 
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { cumulativeCost6Months: 0, cumulativeCost1year: 0, cumulativeCost3years: 0, intangibleCosts: ["Erro IA"], callToAction: "Decida logo." };
  }
};

export const getDelegationAdvice = async (item: string, cost: number, hoursSaved: number, thl: number): Promise<{ text: string, archetype: NietzscheArchetype }> => {
  try {
    const text = await smartRunner({ 
      contents: `Avalie delegar "${item}" por R$ ${cost} (Salva ${hoursSaved}h). THL usuáro: ${thl}`, 
      isJson: true 
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { text: "Calcule o ROI manualmente.", archetype: "CAMEL" };
  }
};

export const getParetoAnalysis = async (tasks: string): Promise<ParetoResult> => {
  try {
    const text = await smartRunner({ contents: `Filtro Pareto 80/20 para: ${tasks}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { vitalFew: [], trivialMany: [] };
  }
};

export const getLifestyleAudit = async (item: string, price: number): Promise<LifestyleAudit> => {
  try {
    const text = await smartRunner({ contents: `Auditoria hedônica: "${item}" por R$ ${price}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { hoursOfLifeLost: 0, futureValueLost: 0, paretoAlternative: { name: "N/A", priceEstimate: 0, reasoning: "Offline" }, verdict: "WAIT" };
  }
};

export const getDashboardAlignmentAnalysis = async (timeData: any[], goals: YearlyCompassData): Promise<string> => {
  try {
    return await smartRunner({ contents: `Analise alinhamento tempo/metas: ${goals.goal1.text}`, isJson: false });
  } catch (e) {
    return "Mantenha o foco. (IA Offline)";
  }
};

export const getTimeWisdom = async (): Promise<string> => {
  try {
    return await smartRunner({ contents: "Aforismo curto sobre tempo (Nietzsche/Seneca).", isJson: false });
  } catch (e) {
    return "Memento Mori.";
  }
};

export const getPreMortemAnalysis = async (goal: string): Promise<PreMortemResult> => {
  try {
    const text = await smartRunner({ contents: `Pre-Mortem: "${goal}"`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { deathDate: "N/A", causeOfDeath: "Erro IA", autopsyReport: [] };
  }
};

export const getFutureSimulations = async (pathA: string, pathB: string): Promise<TimeTravelResult> => {
  try {
    const text = await smartRunner({ contents: `Simule A: ${pathA} vs B: ${pathB}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { pathA: { title: "A", memoir: "", regretLevel: 0 }, pathB: { title: "B", memoir: "", regretLevel: 0 }, synthesis: "Erro na simulação." };
  }
};

export const getEnergyAudit = async (tasks: string): Promise<EnergyAuditItem[]> => {
  try {
    const text = await smartRunner({ contents: `Auditoria de energia: ${tasks}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return [];
  }
};
