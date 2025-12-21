
import { GoogleGenAI, Type } from "@google/genai";
import type { Chat } from "@google/genai";
import { FinancialProfile, CalculatedTHL, SunkCostScenario, ParetoResult, RazorAnalysis, EnergyAuditItem, SkillAnalysis, PreMortemResult, TimeTravelResult, InactionAnalysis, LifestyleAudit, ContextAnalysisResult, NietzscheArchetype } from "../types";

// --- CLIENT HELPER ---
const getClient = () => {
  // Conforme diretrizes: A chave deve vir exclusivamente de process.env.API_KEY
  // Assume-se que o ambiente (Vite/Next/etc) injeta essa variável corretamente.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- JSON PARSER HELPER ---
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) {
    throw new Error("A resposta da IA veio vazia.");
  }
  
  try {
    // Tentativa 1: Parse direto
    return JSON.parse(text);
  } catch (e1) {
    try {
      // Tentativa 2: Extrair de blocos de código markdown ```json ... ```
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
      
      // Tentativa 3: Encontrar o primeiro '{' e o último '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }

      // Tentativa 4: Encontrar primeiro '[' e último ']' (para arrays)
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
      
      throw new Error("Formato JSON não identificado.");
    } catch (e2) {
      console.error("Falha no Parse JSON:", text);
      throw new Error("Não foi possível processar a resposta da IA (Erro de Formatação).");
    }
  }
};

// --- CHAT ---
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

// --- ANALYSES ---

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
    });
    return response.text || "O Oráculo permaneceu em silêncio.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return `Erro ao consultar o oráculo: ${error.message || 'Falha desconhecida'}`;
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
    console.error("AI Error:", error);
    return { text: "Falha na conexão com a Sabedoria.", archetype: "CAMEL" };
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
    return { diplomatic: "Erro.", direct: "Erro.", alternative: "Erro." };
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
        maxOutputTokens: 4096, 
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
      hoursOfLifeLost: 0,
      futureValueLost: futureValue,
      paretoAlternative: data.paretoAlternative,
      verdict: data.verdict
    };
  } catch (e) {
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
  } catch (error: any) {
    console.error("analyzeLifeContext Error:", error);
    const msg = error.message || "Erro desconhecido";
    
    let userHint = "";
    if (msg.includes("API key")) {
      userHint = " Chave de API inválida.";
    }

    return {
      delegationSuggestions: [], sunkCostSuspects: [], lifestyleRisks: [],
      summary: `FALHA NA INTELIGÊNCIA: Não foi possível processar seus dados. ${msg}${userHint}`,
      eternalReturnScore: 0, eternalReturnAnalysis: "Indisponível",
      matrixCoordinates: { x: 50, y: 50, quadrantLabel: "Erro de Conexão" }
    };
  }
};
