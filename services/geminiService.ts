
import { GoogleGenAI, Type, Schema } from "@google/genai";
import type { Chat } from "@google/genai";
import { FinancialProfile, CalculatedTHL, SunkCostScenario, ParetoResult, RazorAnalysis, EnergyAuditItem, SkillAnalysis, PreMortemResult, TimeTravelResult, InactionAnalysis, LifestyleAudit, ContextAnalysisResult, NietzscheArchetype } from "../types";

// Safety check for environment variable access to prevent crash
const getApiKey = () => {
  try {
    // 1. Check process.env (Standard Node/Vite define)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    // 2. Check window.process.env (Our polyfill)
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.API_KEY) {
      // @ts-ignore
      return window.process.env.API_KEY;
    }
    // 3. Check standard Vite import.meta
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env or import.meta.env", e);
  }
  return '';
};

const getClient = () => {
  const key = getApiKey();
  if (!key) console.warn("API Key is missing. AI features will fail.");
  return new GoogleGenAI({ apiKey: key || 'dummy_key' });
};

// --- HELPER: ROBUST JSON PARSER ---
// Still useful as a fallback for the raw text response property if schema strictly fails (rare)
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) {
    console.error("GeminiService: Received empty response text.");
    throw new Error("Empty response from AI");
  }
  try {
    // Remove markdown code blocks if present (even with responseSchema, sometimes redundancy occurs)
    let cleaned = text.replace(/```json\n?|```/g, '').trim();
    
    // Locate valid JSON boundaries
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    
    if (firstBrace === -1 && firstBracket === -1) {
        // Attempt to parse directly in case it's a raw primitive or malformed
        return JSON.parse(cleaned);
    }

    const start = (firstBrace === -1) ? firstBracket : (firstBracket === -1) ? firstBrace : Math.min(firstBrace, firstBracket);
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const end = Math.max(lastBrace, lastBracket);
    
    if (start >= 0 && end >= 0) {
      cleaned = cleaned.substring(start, end + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Logic Error. Raw Text:", text, e);
    throw e;
  }
};

// --- CHAT FUNCTIONALITY ---
export const createSpecialistChat = (thl: number, context: string): Chat => {
  const ai = getClient();
  const systemInstruction = `
    Você é o Especialista OpportunityIQ.
    Sua persona é uma fusão de Friedrich Nietzsche (Vontade de Potência, Amor Fati), Greg McKeown (Essencialismo) e um Economista Comportamental.
    Seu objetivo: Ajudar o usuário a otimizar sua vida radicalmente, aumentando sua THL (Taxa Horária Líquida) e sua autonomia.
    Dados do Usuário: THL Atual: R$ ${thl.toFixed(2)}/hora. Contexto: ${context}
    Diretrizes: Seja direto, profundo e levemente provocativo. Use "Custo de Oportunidade", "Vontade de Potência", "Via Negativa".
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
  });
};

export const getSunkCostAnalysis = async (scenario: SunkCostScenario, thl: CalculatedTHL): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Atue como um Filósofo Estrategista. Analise este dilema de custo irrecuperável.
    Projeto: "${scenario.title}" (${scenario.description}).
    Dados: THL R$ ${thl.realTHL.toFixed(2)}/h. Investido: ${scenario.investedTimeMonths} meses, R$ ${scenario.investedMoney}. 
    Futuro estimado: R$ ${scenario.projectedFutureCostMoney} e ${scenario.projectedFutureCostTime} horas.
    Use "Amor Fati" e "Custo de Oportunidade". Dê um veredito curto e brutal (máx 2 parágrafos).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        // FIX: Must set maxOutputTokens > thinkingBudget to allow room for the answer
        thinkingConfig: { thinkingBudget: 1024 },
        maxOutputTokens: 2048
      } 
    });
    return response.text || "Sem resposta.";
  } catch (error) {
    console.error("getSunkCostAnalysis Error:", error);
    return "O Oráculo está mudo (Erro de API). Verifique sua chave ou tente novamente.";
  }
};

export const getDelegationAdvice = async (item: string, cost: number, hoursSaved: number, thl: number): Promise<{ text: string, archetype: NietzscheArchetype }> => {
  const ai = getClient();
  const prompt = `Classifique "${item}" (Custo R$${cost}, Salva ${hoursSaved}h) nas 3 Metamorfoses de Nietzsche (CAMEL, LION, CHILD).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            archetype: { type: Type.STRING, enum: ["CAMEL", "LION", "CHILD"] }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getDelegationAdvice Error:", error);
    return { text: "Zaratustra não respondeu.", archetype: "CAMEL" };
  }
};

export const getTimeWisdom = async (): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Aforismo curto estilo Nietzsche sobre Tempo/Morte. Sem aspas.",
    });
    return response.text || "Amor Fati.";
  } catch (error) {
    // Silent fail for ambient features is acceptable
    return "Torna-te quem tu és.";
  }
};

export const getRefusalScripts = async (request: string): Promise<{diplomatic: string, direct: string, alternative: string}> => {
  const ai = getClient();
  const prompt = `Gere 3 scripts de recusa para: "${request}". 1. Diplomático, 2. Direto (Nietzscheano), 3. Alternativa.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diplomatic: { type: Type.STRING },
            direct: { type: Type.STRING },
            alternative: { type: Type.STRING }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getRefusalScripts Error:", error);
    return { diplomatic: "Não posso.", direct: "Não.", alternative: "Não agora." };
  }
};

export const getParetoAnalysis = async (tasks: string): Promise<ParetoResult> => {
  const ai = getClient();
  const prompt = `Analise tasks (Pareto 80/20): ${tasks}. Separe Vital Few vs Trivial Many.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vitalFew: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { task: { type: Type.STRING }, impact: { type: Type.STRING } } } },
            trivialMany: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { task: { type: Type.STRING }, action: { type: Type.STRING, enum: ["ELIMINATE", "DELEGATE", "AUTOMATE"] }, reasoning: { type: Type.STRING } } } }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getParetoAnalysis Error:", error);
    return { vitalFew: [], trivialMany: [] };
  }
};

export const getPhilosophicalAnalysis = async (dilemma: string): Promise<RazorAnalysis> => {
  const ai = getClient();
  const prompt = `Analise o dilema "${dilemma}" com Navalha de Occam, Via Negativa e Minimização de Arrependimento.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // FIX: Added output tokens limit for safety when combined with thinking if enabled later
        maxOutputTokens: 2048,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            occam: { type: Type.STRING },
            inversion: { type: Type.STRING },
            regret: { type: Type.STRING },
            synthesis: { type: Type.STRING }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getPhilosophicalAnalysis Error:", error);
    return { occam: "Erro.", inversion: "Erro.", regret: "Erro.", synthesis: "Erro na API." };
  }
};

export const getPreMortemAnalysis = async (goal: string): Promise<PreMortemResult> => {
  const ai = getClient();
  const prompt = `Pre-Mortem (Via Negativa) para o objetivo: "${goal}". Imagine que falhou em 12 meses.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deathDate: { type: Type.STRING },
            causeOfDeath: { type: Type.STRING },
            autopsyReport: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cause: { type: Type.STRING }, prevention: { type: Type.STRING } } } }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getPreMortemAnalysis Error:", error);
    return { deathDate: "Futuro", causeOfDeath: "Erro API", autopsyReport: [] };
  }
};

export const getFutureSimulations = async (pathA: string, pathB: string): Promise<TimeTravelResult> => {
  const ai = getClient();
  const prompt = `Simule Caminho A: "${pathA}" vs Caminho B: "${pathB}" sob a ótica do arrependimento na velhice.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4000, // Ensure enough tokens for a detailed simulation
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pathA: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, memoir: { type: Type.STRING }, regretLevel: { type: Type.NUMBER } } },
            pathB: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, memoir: { type: Type.STRING }, regretLevel: { type: Type.NUMBER } } },
            synthesis: { type: Type.STRING }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getFutureSimulations Error:", error);
    return { pathA: { title: "A", memoir: "Erro", regretLevel: 5 }, pathB: { title: "B", memoir: "Erro", regretLevel: 5 }, synthesis: "Erro" };
  }
};

export const getEnergyAudit = async (tasks: string): Promise<EnergyAuditItem[]> => {
  const ai = getClient();
  const prompt = `Classifique tarefas em GENIUS, TRAP, GRIND, DUMP: ${tasks}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getEnergyAudit Error:", error);
    return [];
  }
};

export const getSkillAnalysis = async (skill: string, currentTHL: number, increasePercent: number): Promise<SkillAnalysis> => {
  const ai = getClient();
  const prompt = `Analise ROI de aprender "${skill}". THL atual ${currentTHL}, Meta +${increasePercent}%.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRealistic: { type: Type.BOOLEAN },
            commentary: { type: Type.STRING },
            marketRealityCheck: { type: Type.STRING }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("getSkillAnalysis Error:", error);
    return { isRealistic: false, commentary: "Erro ao analisar.", marketRealityCheck: "Verifique conexão." };
  }
};

export const getInactionAnalysis = async (decision: string, monthlyCost: number): Promise<InactionAnalysis> => {
  const ai = getClient();
  const prompt = `Analise a inação de: "${decision}" (Custo mensal R$${monthlyCost}).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intangibleCosts: { type: Type.ARRAY, items: { type: Type.STRING } },
            callToAction: { type: Type.STRING }
          }
        }
      }
    });
    const data = cleanAndParseJSON(response.text);
    return {
      cumulativeCost6Months: monthlyCost * 6,
      cumulativeCost1year: monthlyCost * 12,
      cumulativeCost3years: monthlyCost * 36,
      intangibleCosts: data.intangibleCosts || [],
      callToAction: data.callToAction || "Aja."
    };
  } catch (error) {
    console.error("getInactionAnalysis Error:", error);
    return { cumulativeCost6Months: 0, cumulativeCost1year: 0, cumulativeCost3years: 0, intangibleCosts: [], callToAction: "Erro" };
  }
};

export const getLifestyleAudit = async (item: string, price: number): Promise<LifestyleAudit> => {
  const ai = getClient();
  const prompt = `Auditoria de compra: "${item}" (R$${price}). É hedônico? Alternativa Pareto?`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paretoAlternative: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, priceEstimate: { type: Type.NUMBER }, reasoning: { type: Type.STRING } } },
            verdict: { type: Type.STRING, enum: ["BUY", "WAIT", "DOWNGRADE"] }
          }
        }
      }
    });
    const data = cleanAndParseJSON(response.text);
    const futureValue = price * Math.pow(1.07, 10);
    return {
      hoursOfLifeLost: 0, // Calculated in UI
      futureValueLost: futureValue,
      paretoAlternative: data.paretoAlternative,
      verdict: data.verdict
    };
  } catch (e) {
    console.error("getLifestyleAudit Error:", e);
    return { hoursOfLifeLost: 0, futureValueLost: 0, paretoAlternative: { name: "N/A", priceEstimate: 0, reasoning: "" }, verdict: "WAIT" };
  }
};

export const analyzeLifeContext = async (routine: string, assets: string, thl: number): Promise<ContextAnalysisResult> => {
  const ai = getClient();
  const prompt = `Analise contexto de vida: Rotina "${routine}", Ativos "${assets}", THL R$${thl}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // No thinking budget needed here, strict schema is enough
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            delegationSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, cost: { type: Type.NUMBER }, hoursSaved: { type: Type.NUMBER }, frequency: { type: Type.STRING }, category: { type: Type.STRING } } } },
            sunkCostSuspects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } },
            lifestyleRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            eternalReturnScore: { type: Type.NUMBER },
            eternalReturnAnalysis: { type: Type.STRING },
            matrixCoordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, quadrantLabel: { type: Type.STRING } } }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("analyzeLifeContext Error:", error);
    return {
      delegationSuggestions: [], sunkCostSuspects: [], lifestyleRisks: [],
      summary: "Erro na análise (verifique console).", eternalReturnScore: 50, eternalReturnAnalysis: "Indisponível",
      matrixCoordinates: { x: 50, y: 50, quadrantLabel: "Indefinido" }
    };
  }
};
