
import { GoogleGenAI, Type } from "@google/genai";
import type { Chat, GenerateContentParameters } from "@google/genai";
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
/**
 * Guidelines: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
 */
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- RESILIENCE ENGINE (FALLBACK & RETRY) ---

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Executes a prompt with automatic retry and model fallback.
 * Primary: gemini-3-flash-preview
 * Fallback: gemini-flash-lite-latest
 */
async function executeWithResilience(params: {
  contents: string | any,
  systemInstruction?: string,
  responseSchema?: any,
  isJson?: boolean
}) {
  const ai = getClient();
  const models = ['gemini-3-flash-preview', 'gemini-flash-lite-latest'];
  let lastError: any = null;

  for (const modelName of models) {
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const config: any = {
          systemInstruction: params.systemInstruction,
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

        if (!response.text) throw new Error("IA retornou texto vazio.");
        return response.text;

      } catch (error: any) {
        lastError = error;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('finishReason: OTHER');
        
        if (isRateLimit && retries < maxRetries) {
          retries++;
          const waitTime = Math.pow(2, retries) * 1000;
          console.warn(`Rate limit no modelo ${modelName}. Tentativa ${retries}/${maxRetries} em ${waitTime}ms...`);
          await sleep(waitTime);
          continue;
        }
        
        // Se falhou por outro motivo ou esgotou retentativas, tenta o próximo modelo (fallback)
        console.warn(`Falha no modelo ${modelName}, tentando próximo da cascata...`);
        break; 
      }
    }
  }

  console.error("Todos os modelos e retentativas falharam:", lastError);
  throw lastError;
}

// --- JSON PARSER HELPER ---
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) throw new Error("Texto vazio para parse.");
  try {
    return JSON.parse(text);
  } catch (e) {
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch?.[1]) {
      try { return JSON.parse(codeBlockMatch[1]); } catch (e2) {}
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (e3) {}
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      try { return JSON.parse(text.substring(firstBracket, lastBracket + 1)); } catch (e4) {}
    }
    throw new Error("Falha no parse JSON resiliente.");
  }
};

// --- REIMPLEMENTED SERVICES ---

export const analyzeAsset = async (name: string, description: string, value: number, year: number): Promise<AssetItem['aiAnalysis']> => {
  const prompt = `Analise este bem: "${name}" (${description}), comprado em ${year} por R$${value}. Estime valor atual (Brasil), tendência, custo mensal e liquidez.`;
  
  try {
    const text = await executeWithResilience({
      contents: prompt,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentValueEstimated: { type: Type.NUMBER },
          depreciationTrend: { type: Type.STRING, enum: ["APPRECIATING", "DEPRECIATING", "STABLE"] },
          liquidityScore: { type: Type.NUMBER },
          maintenanceCostMonthlyEstimate: { type: Type.NUMBER },
          commentary: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (error) {
    return {
      currentValueEstimated: value * 0.8,
      depreciationTrend: 'DEPRECIATING',
      liquidityScore: 50,
      maintenanceCostMonthlyEstimate: value * 0.01,
      commentary: "Estimativa de segurança (IA Offline)."
    };
  }
};

export const getPhilosophicalAnalysis = async (dilemma: string): Promise<RazorAnalysis> => {
  const prompt = `Analise o dilema "${dilemma}" com Navalha de Occam, Via Negativa e Minimização de Arrependimento.`;
  try {
    const text = await executeWithResilience({
      contents: prompt,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          occam: { type: Type.STRING },
          inversion: { type: Type.STRING },
          regret: { type: Type.STRING },
          synthesis: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (error) {
    return { 
      occam: "Simplifique o problema.", 
      inversion: "O que acontece se você não agir?", 
      regret: "Você se arrependerá disso em 10 anos?", 
      synthesis: "IA Temporariamente Indisponível. Use a intuição." 
    };
  }
};

export const analyzeLifeContext = async (routine: string, assets: AssetItem[], thl: number, profile: FinancialProfile, sleepHours: number = 7): Promise<ContextAnalysisResult> => {
  const assetsString = assets.length > 0 
    ? assets.map(a => `- ${a.name}: R$${a.purchaseValue}`).join('\n') 
    : "Sem ativos significativos.";

  const prompt = `Auditoria Forense Existencial. Renda: R$ ${profile.netIncome}, THL: R$ ${thl.toFixed(2)}, Sono: ${sleepHours}h. Rotina: "${routine}". Ativos: ${assetsString}`;
  
  try {
    const text = await executeWithResilience({
      contents: prompt,
      systemInstruction: "Você é o Auditor Central Zeus. Forneça diagnóstico brutal e JSON estrito.",
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          delegationSuggestions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                id: { type: Type.STRING }, 
                name: { type: Type.STRING }, 
                cost: { type: Type.NUMBER }, 
                hoursSaved: { type: Type.NUMBER }, 
                frequency: { type: Type.STRING }, 
                category: { type: Type.STRING } 
              } 
            } 
          },
          sunkCostSuspects: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                title: { type: Type.STRING }, 
                description: { type: Type.STRING } 
              } 
            } 
          },
          lifestyleRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          eternalReturnScore: { type: Type.NUMBER },
          eternalReturnAnalysis: { type: Type.STRING },
          matrixCoordinates: { 
            type: Type.OBJECT, 
            properties: { 
              x: { type: Type.NUMBER }, 
              y: { type: Type.NUMBER }, 
              quadrantLabel: { type: Type.STRING } 
            } 
          }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (error: any) {
    return {
      delegationSuggestions: [], sunkCostSuspects: [], lifestyleRisks: [],
      summary: "Falha de rede na Auditoria Neural. Tente novamente mais tarde.",
      eternalReturnScore: 50, eternalReturnAnalysis: "Indisponível",
      matrixCoordinates: { x: 50, y: 50, quadrantLabel: "Offline" }
    };
  }
};

// --- CHAT ---
export const createSpecialistChat = (thl: number, context: string): Chat => {
  const ai = getClient();
  const systemInstruction = `Persona: Nietzsche + Greg McKeown + Economista. Foco: Aumentar THL (R$ ${thl.toFixed(2)}) e Autonomia. Contexto: ${context}`;
  
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
  });
};

// --- NEW EXPORTS TO FIX ERRORS ---

/**
 * Analyzes sunk cost scenarios using AI.
 */
export const getSunkCostAnalysis = async (scenario: SunkCostScenario, thl: CalculatedTHL): Promise<string> => {
  const prompt = `Analise este cenário de Custo Irrecuperável (Sunk Cost Fallacy):
  Projeto: ${scenario.title}
  Dilema: ${scenario.description}
  Investido até agora: R$ ${scenario.investedMoney || 0} e ${scenario.investedTimeMonths || 0} meses.
  Custos futuros para conclusão: R$ ${scenario.projectedFutureCostMoney || 0} e ${scenario.projectedFutureCostTime || 0} horas.
  Minha THL atual é R$ ${thl.realTHL.toFixed(2)}/h.
  Forneça uma análise brutal e libertadora baseada no Amor Fati de Nietzsche.`;

  try {
    return await executeWithResilience({
      contents: prompt,
      isJson: false
    });
  } catch (e) {
    return "O passado é imutável. Concentre-se no custo de oportunidade futuro. Se o retorno esperado não supera os custos futuros, abandone o navio.";
  }
};

/**
 * Generates refusal scripts for the Essentialist Negotiator.
 */
export const getRefusalScripts = async (request: string): Promise<{ diplomatic: string, direct: string, alternative: string }> => {
  const prompt = `Como um negociador essencialista, gere 3 formas de dizer NÃO a este pedido: "${request}".
  1. Diplomático (polido e empático)
  2. Direto (curto e sem justificativas excessivas)
  3. Alternativa (oferecendo uma via que não consome seu tempo)`;

  try {
    const text = await executeWithResilience({
      contents: prompt,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diplomatic: { type: Type.STRING },
          direct: { type: Type.STRING },
          alternative: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return {
      diplomatic: "Infelizmente, meu foco atual está em prioridades inadiáveis e não poderei ajudar agora.",
      direct: "Não consigo aceitar esse compromisso no momento.",
      alternative: "Não posso participar, mas talvez este documento/recurso possa te ajudar."
    };
  }
};

/**
 * Validates the realism of learning a new skill for ROI.
 */
export const getSkillAnalysis = async (skill: string, currentTHL: number, increase: number): Promise<SkillAnalysis> => {
  const prompt = `Valide se aprender a habilidade "${skill}" pode realisticamente aumentar a Taxa Horária Real (THL) de R$ ${currentTHL.toFixed(2)} em ${increase}%.`;

  try {
    const text = await executeWithResilience({
      contents: prompt,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isRealistic: { type: Type.BOOLEAN },
          marketRealityCheck: { type: Type.STRING },
          commentary: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return {
      isRealistic: true,
      marketRealityCheck: "O mercado de educação e skills é sempre incerto.",
      commentary: "Aprender novas habilidades costuma gerar ROI positivo no longo prazo, mas os ganhos imediatos variam."
    };
  }
};

/**
 * Calculates cumulative costs of inaction.
 */
export const getInactionAnalysis = async (decision: string, monthlyCost: number): Promise<InactionAnalysis> => {
  const prompt = `Calcule o custo total da inação (status quo) para esta decisão adiada: "${decision}".
  Custo mensal estimado (financeiro + mental convertido via THL): R$ ${monthlyCost.toFixed(2)}.`;

  try {
    const text = await executeWithResilience({
      contents: prompt,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cumulativeCost6Months: { type: Type.NUMBER },
          cumulativeCost1year: { type: Type.NUMBER },
          cumulativeCost3years: { type: Type.NUMBER },
          intangibleCosts: { type: Type.ARRAY, items: { type: Type.STRING } },
          callToAction: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return {
      cumulativeCost6Months: monthlyCost * 6,
      cumulativeCost1year: monthlyCost * 12,
      cumulativeCost3years: monthlyCost * 36,
      intangibleCosts: ["Drenagem de energia mental", "Perda de janelas de oportunidade"],
      callToAction: "O custo da inércia é o maior imposto que você paga. Decida hoje."
    };
  }
};

// --- REMAINING WRAPPERS ---

export const getDelegationAdvice = async (item: string, cost: number, hoursSaved: number, thl: number): Promise<{ text: string, archetype: NietzscheArchetype }> => {
  try {
    const text = await executeWithResilience({
      contents: `Classifique "${item}" (Custo R$${cost}, Salva ${hoursSaved}h, THL R$${thl}) nas Metamorfoses de Nietzsche.`,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          archetype: { type: Type.STRING, enum: ["CAMEL", "LION", "CHILD"] }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { text: "Delegue se o custo/h for menor que sua THL.", archetype: "CAMEL" };
  }
};

export const getParetoAnalysis = async (tasks: string): Promise<ParetoResult> => {
  try {
    const text = await executeWithResilience({
      contents: `Analise tasks (Pareto 80/20): ${tasks}.`,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vitalFew: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { task: { type: Type.STRING }, impact: { type: Type.STRING } } } },
          trivialMany: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { task: { type: Type.STRING }, action: { type: Type.STRING, enum: ["ELIMINATE", "DELEGATE", "AUTOMATE"] }, reasoning: { type: Type.STRING } } } }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { vitalFew: [], trivialMany: [] };
  }
};

export const getLifestyleAudit = async (item: string, price: number): Promise<LifestyleAudit> => {
  try {
    const text = await executeWithResilience({
      contents: `Auditoria hedônica: "${item}" (R$${price}).`,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          paretoAlternative: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, priceEstimate: { type: Type.NUMBER }, reasoning: { type: Type.STRING } } },
          verdict: { type: Type.STRING, enum: ["BUY", "WAIT", "DOWNGRADE"] }
        }
      }
    });
    const data = cleanAndParseJSON(text);
    return { hoursOfLifeLost: 0, futureValueLost: price * 1.96, ...data };
  } catch (e) {
    return { hoursOfLifeLost: 0, futureValueLost: 0, paretoAlternative: { name: "N/A", priceEstimate: 0, reasoning: "IA Offline" }, verdict: "WAIT" };
  }
};

export const getDashboardAlignmentAnalysis = async (timeData: any[], goals: YearlyCompassData): Promise<string> => {
  if (!goals.goal1.text) return "Defina metas anuais para análise.";
  try {
    return await executeWithResilience({
      contents: `Analise alinhamento entre Rotina (${JSON.stringify(timeData)}) e Metas (${goals.goal1.text}). Curto e direto.`,
      isJson: false
    });
  } catch (e) {
    return "Foque no essencial. Suas ações de hoje definem seu amanhã.";
  }
};

export const getTimeWisdom = async (): Promise<string> => {
  try {
    return await executeWithResilience({ contents: "Um aforismo curto de Nietzsche sobre tempo.", isJson: false });
  } catch (e) {
    return "Amor Fati.";
  }
};

export const getPreMortemAnalysis = async (goal: string): Promise<PreMortemResult> => {
  try {
    const text = await executeWithResilience({
      contents: `Pre-Mortem para: "${goal}".`,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          deathDate: { type: Type.STRING },
          causeOfDeath: { type: Type.STRING },
          autopsyReport: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cause: { type: Type.STRING }, prevention: { type: Type.STRING } } } }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { deathDate: "Futuro", causeOfDeath: "IA Indisponível", autopsyReport: [] };
  }
};

export const getFutureSimulations = async (pathA: string, pathB: string): Promise<TimeTravelResult> => {
  try {
    const text = await executeWithResilience({
      contents: `Simule Caminho A: "${pathA}" vs B: "${pathB}".`,
      isJson: true,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pathA: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, memoir: { type: Type.STRING }, regretLevel: { type: Type.NUMBER } } },
          pathB: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, memoir: { type: Type.STRING }, regretLevel: { type: Type.NUMBER } } },
          synthesis: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return { pathA: { title: "A", memoir: "...", regretLevel: 5 }, pathB: { title: "B", memoir: "...", regretLevel: 5 }, synthesis: "Escolha com consciência." };
  }
};

export const getEnergyAudit = async (tasks: string): Promise<EnergyAuditItem[]> => {
  try {
    const text = await executeWithResilience({
      contents: `Classifique em GENIUS, TRAP, GRIND, DUMP: ${tasks}`,
      isJson: true,
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            energy: { type: Type.STRING, enum: ["GAIN", "DRAIN"] },
            value: { type: Type.STRING, enum: ["HIGH", "LOW"] },
            quadrant: { type: Type.STRING, enum: ["GENIUS", "TRAP", "GRIND", "DUMP"] },
            advice: { type: Type.STRING }
          }
        }
      }
    });
    return cleanAndParseJSON(text);
  } catch (e) {
    return [];
  }
};
