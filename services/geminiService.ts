
import { GoogleGenAI, Type } from "@google/genai";
import type { Chat } from "@google/genai";
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

// --- CLIENT HELPER ---
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- RESILIENCE ENGINE (FALLBACK & RETRY) ---

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * High-Availability Prompt Execution
 * Cascata: Flash 3 (Smartest) -> Flash Lite (Fastest) -> Flash Latest (Most Stable)
 */
async function executeWithResilience(params: {
  contents: string | any,
  systemInstruction?: string,
  responseSchema?: any,
  isJson?: boolean
}) {
  const ai = getClient();
  // Ampliando a rede para cobrir mais modelos gratuitos estáveis
  const models = ['gemini-3-flash-preview', 'gemini-flash-lite-latest', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of models) {
    let retries = 0;
    const maxRetries = 1; // 1 retentativa por modelo para não travar a UI

    while (retries <= maxRetries) {
      try {
        const config: any = {
          systemInstruction: params.systemInstruction,
          temperature: 0.7,
        };

        if (params.isJson) {
          config.responseMimeType = "application/json";
          if (params.responseSchema) {
            config.responseSchema = params.responseSchema;
          }
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: config
        });

        if (response.text) return response.text;
        throw new Error("Resposta vazia");

      } catch (error: any) {
        lastError = error;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('finishReason: OTHER');
        
        if (isRateLimit && retries < maxRetries) {
          retries++;
          await sleep(1500); // Espera curta para tentar o mesmo modelo
          continue;
        }
        
        console.warn(`Modelo ${modelName} falhou, tentando fallback...`);
        break; // Tenta o próximo modelo da lista 'models'
      }
    }
  }

  throw lastError; // Se chegar aqui, todos os modelos da gratuidade falharam
}

// --- JSON PARSER ---
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) throw new Error("Texto vazio");
  try {
    return JSON.parse(text);
  } catch (e) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    }
    throw e;
  }
};

// --- LOGICA DE BACKUP LOCAL (QUANDO A API ZERA) ---

const getLocalAnalysisFallback = (routine: string, thl: number): ContextAnalysisResult => {
  const isHighIncome = thl > 100;
  return {
    delegationSuggestions: [
      { id: 'f-1', name: 'Faxina e Organização', cost: 200, hoursSaved: 8, frequency: 'weekly', category: 'cleaning', archetype: 'CAMEL' },
      { id: 'f-2', name: 'Assistente Virtual / IA', cost: 150, hoursSaved: 10, frequency: 'monthly', category: 'admin', archetype: 'CAMEL' }
    ],
    sunkCostSuspects: [],
    lifestyleRisks: ["Risco de Burnout por falta de delegação"],
    summary: `[MODO SEGURANÇA] Sua THL de R$ ${thl.toFixed(2)} indica que você deve delegar qualquer tarefa que custe menos que isso. Foque em recuperar seu tempo.`,
    eternalReturnScore: 50,
    eternalReturnAnalysis: "Você está no modo automático. O Eterno Retorno exige intenção.",
    matrixCoordinates: { x: 50, y: 50, quadrantLabel: "O Leão em Transição" }
  };
};

// --- SERVICES ---

export const analyzeAsset = async (name: string, description: string, value: number, year: number): Promise<AssetItem['aiAnalysis']> => {
  try {
    const text = await executeWithResilience({
      contents: `Analise o bem "${name}" (${description}), comprado por R$${value} em ${year}. Estime valor atual e custos mensais.`,
      isJson: true
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return {
      currentValueEstimated: value * 0.9,
      depreciationTrend: 'STABLE',
      liquidityScore: 50,
      maintenanceCostMonthlyEstimate: value * 0.005,
      commentary: "Estimativa baseada em depreciação padrão (API Offline)."
    };
  }
};

export const getPhilosophicalAnalysis = async (dilemma: string): Promise<RazorAnalysis> => {
  try {
    const text = await executeWithResilience({
      contents: `Analise o dilema "${dilemma}" usando as Navalhas de Occam, Inversão e Regret.`,
      isJson: true
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return {
      occam: "A solução mais simples geralmente é a correta. Remova o excesso.",
      inversion: "Considere o que aconteceria se você não fizesse nada.",
      regret: "Você se arrependerá dessa escolha em 10 anos?",
      synthesis: "IA em repouso. Confie na sua intuição estoica: aceite o que não pode mudar, mude o que pode."
    };
  }
};

export const analyzeLifeContext = async (routine: string, assets: AssetItem[], thl: number, profile: FinancialProfile, sleepHours: number = 7): Promise<ContextAnalysisResult> => {
  try {
    const text = await executeWithResilience({
      contents: `Auditoria Forense. Renda: R$ ${profile.netIncome}, THL: R$ ${thl.toFixed(2)}, Sono: ${sleepHours}h. Rotina: "${routine}"`,
      isJson: true,
      systemInstruction: "Você é Zeus. Use as Metamorfoses de Nietzsche. Retorne JSON."
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    console.error("API Esgotada, usando Inteligência Local.");
    return getLocalAnalysisFallback(routine, thl);
  }
};

export const createSpecialistChat = (thl: number, context: string): Chat => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview', // Chat sempre tenta o melhor primeiro
    config: { systemInstruction: `Persona: Nietzsche + Pareto. THL: R$ ${thl.toFixed(2)}. Contexto: ${context}` },
  });
};

export const getSunkCostAnalysis = async (scenario: SunkCostScenario, thl: CalculatedTHL): Promise<string> => {
  try {
    return await executeWithResilience({ contents: `Analise Sunk Cost: ${scenario.title}. THL: ${thl.realTHL}`, isJson: false });
  } catch (e) {
    return "O passado é imutável. Se o custo futuro de continuar é maior que o benefício, abandone o navio. O orgulho é o imposto mais caro que você paga.";
  }
};

export const getRefusalScripts = async (request: string): Promise<{ diplomatic: string, direct: string, alternative: string }> => {
  try {
    const text = await executeWithResilience({ contents: `Gere scripts para dizer NÃO a: "${request}"`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { diplomatic: "Agradeço, mas no momento meu foco está em prioridades críticas.", direct: "Não posso aceitar esse compromisso agora.", alternative: "Não posso ajudar nisso, mas talvez este recurso te ajude." };
  }
};

export const getSkillAnalysis = async (skill: string, currentTHL: number, increase: number): Promise<SkillAnalysis> => {
  try {
    const text = await executeWithResilience({ contents: `ROI da skill "${skill}" para aumentar THL em ${increase}%`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { isRealistic: true, marketRealityCheck: "Habilidades raras e valiosas sempre aumentam a THL.", commentary: "Aprenda algo que o mercado não consiga automatizar facilmente." };
  }
};

export const getInactionAnalysis = async (decision: string, monthlyCost: number): Promise<InactionAnalysis> => {
  try {
    const text = await executeWithResilience({ contents: `Custo da inação para "${decision}". Custo mensal: R$ ${monthlyCost}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { cumulativeCost6Months: monthlyCost * 6, cumulativeCost1year: monthlyCost * 12, cumulativeCost3years: monthlyCost * 36, intangibleCosts: ["Estresse", "Perda de Oportunidade"], callToAction: "Decida rápido. O tempo não perdoa a indecisão." };
  }
};

export const getDelegationAdvice = async (item: string, cost: number, hoursSaved: number, thl: number): Promise<{ text: string, archetype: NietzscheArchetype }> => {
  try {
    const text = await executeWithResilience({ contents: `Avalie delegar "${item}" por R$ ${cost}. THL: ${thl}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { text: cost/hoursSaved < thl ? "Delegue imediatamente. Você está lucrando tempo." : "Faça você mesmo por enquanto ou otimize o processo.", archetype: "CAMEL" };
  }
};

export const getParetoAnalysis = async (tasks: string): Promise<ParetoResult> => {
  try {
    const text = await executeWithResilience({ contents: `Filtro Pareto 80/20 para: ${tasks}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { vitalFew: [{ task: "Identificar seus 20% principais", impact: "Alto" }], trivialMany: [{ task: "Tarefas operacionais", action: "DELEGATE", reasoning: "Baixo ROI" }] };
  }
};

export const getLifestyleAudit = async (item: string, price: number): Promise<LifestyleAudit> => {
  try {
    const text = await executeWithResilience({ contents: `Auditoria hedônica: "${item}" por R$ ${price}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { hoursOfLifeLost: 0, futureValueLost: price * 2, paretoAlternative: { name: "Investir o Valor", priceEstimate: 0, reasoning: "Acumule capital em vez de bens depreciáveis." }, verdict: "WAIT" };
  }
};

export const getDashboardAlignmentAnalysis = async (timeData: any[], goals: YearlyCompassData): Promise<string> => {
  try {
    return await executeWithResilience({ contents: `Analise alinhamento tempo/metas: ${goals.goal1.text}`, isJson: false });
  } catch (e) {
    return "Mantenha o foco no seu Norte Financeiro. Pequenos ajustes diários geram resultados compostos.";
  }
};

export const getTimeWisdom = async (): Promise<string> => {
  try {
    return await executeWithResilience({ contents: "Aforismo curto sobre tempo.", isJson: false });
  } catch (e) {
    return "Torna-te quem tu és.";
  }
};

export const getPreMortemAnalysis = async (goal: string): Promise<PreMortemResult> => {
  try {
    const text = await executeWithResilience({ contents: `Pre-Mortem: "${goal}"`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { deathDate: "Futuro próximo", causeOfDeath: "Falta de execução disciplinada", autopsyReport: [{ cause: "Distração", prevention: "Foco total no 80/20" }] };
  }
};

export const getFutureSimulations = async (pathA: string, pathB: string): Promise<TimeTravelResult> => {
  try {
    const text = await executeWithResilience({ contents: `Simule A: ${pathA} vs B: ${pathB}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { pathA: { title: "Caminho A", memoir: "...", regretLevel: 5 }, pathB: { title: "Caminho B", memoir: "...", regretLevel: 5 }, synthesis: "Escolha o caminho que exige mais de você." };
  }
};

export const getEnergyAudit = async (tasks: string): Promise<EnergyAuditItem[]> => {
  try {
    const text = await executeWithResilience({ contents: `Auditoria de energia: ${tasks}`, isJson: true });
    return cleanAndParseJSON(text);
  } catch (e) {
    return [];
  }
};
