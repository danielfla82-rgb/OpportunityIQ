
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
const getApiKey = () => {
  // 1. Try standard Vite environment variables (Preferred)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    if ((import.meta as any).env.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
    if ((import.meta as any).env.API_KEY) return (import.meta as any).env.API_KEY;
  }
  
  // 2. Try Node/Process environment (for some build systems)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
  }
  
  // 3. Try Window Polyfill (Last resort)
  if (typeof window !== 'undefined' && (window as any).process?.env) {
    if ((window as any).process.env.VITE_API_KEY) return (window as any).process.env.VITE_API_KEY;
    if ((window as any).process.env.API_KEY) return (window as any).process.env.API_KEY;
  }
  
  return '';
};

const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key missing. Please ensure VITE_API_KEY is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- JSON PARSER HELPER ---
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) {
    throw new Error("A resposta da IA veio vazia.");
  }
  
  // 1. Tenta parse direto
  try {
    return JSON.parse(text);
  } catch (e) {
    // 2. Tenta extrair de blocos de código
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (e2) {
        // continue
      }
    }

    // 3. Tenta encontrar o primeiro { e o último }
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
    } catch (e3) {
       // continue
    }

    // 4. Tenta encontrar Array [ ... ]
    try {
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
    } catch (e4) {
      // continue
    }
    
    console.error("Falha fatal no Parse JSON. Texto recebido:", text);
    throw new Error("Não foi possível processar a resposta da IA (Erro de Formatação JSON).");
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

export const analyzeAsset = async (name: string, description: string, value: number, year: number): Promise<AssetItem['aiAnalysis']> => {
  const ai = getClient();
  const prompt = `
    Analise este bem patrimonial: "${name}" (${description}), comprado em ${year} por R$${value}.
    Seja tolerante com erros de digitação no nome do produto (Ex: "Samsumg" = "Samsung").
    Estime com base no mercado brasileiro atual:
    1. Valor atual de mercado (Brasil).
    2. Tendência (Valorizando/Depreciando).
    3. Custo mensal oculto estimado (manutenção, impostos, depreciação, custo de oportunidade).
    4. Liquidez (0 a 100, onde 100 é dinheiro na mão).
    Retorne JSON válido. Se não identificar, faça uma estimativa conservadora baseada na categoria.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Asset Analysis Error", error);
    return {
      currentValueEstimated: value * 0.8, // Fallback estimate
      depreciationTrend: 'DEPRECIATING',
      liquidityScore: 50,
      maintenanceCostMonthlyEstimate: value * 0.01,
      commentary: "Estimativa automática (IA indisponível)."
    };
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

export const getLifestyleAudit = async (item: string, price: number): Promise<LifestyleAudit> => {
  const ai = getClient();
  const prompt = `
    Auditoria de compra hedônica para: "${item}" (R$${price}).
    Identifique se é hedônico, dê um veredito (BUY, WAIT, DOWNGRADE) e sugira uma alternativa Pareto (80/20) mais barata.
    Retorne JSON estrito.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paretoAlternative: { 
              type: Type.OBJECT, 
              properties: { 
                 name: { type: Type.STRING }, 
                 priceEstimate: { type: Type.NUMBER }, 
                 reasoning: { type: Type.STRING } 
              } 
            },
            verdict: { type: Type.STRING, enum: ["BUY", "WAIT", "DOWNGRADE"] }
          }
        }
      }
    });
    const data = cleanAndParseJSON(response.text);
    const futureValue = price * Math.pow(1.07, 10);
    return {
      hoursOfLifeLost: 0, // Calculated on frontend
      futureValueLost: futureValue,
      paretoAlternative: data.paretoAlternative,
      verdict: data.verdict
    };
  } catch (e: any) {
    console.error("Lifestyle Audit Error:", e);
    // Return a graceful error object instead of crashing
    return { 
        hoursOfLifeLost: 0, 
        futureValueLost: 0, 
        paretoAlternative: { 
            name: "Erro na Análise", 
            priceEstimate: 0, 
            reasoning: "A IA não conseguiu processar este item. Tente simplificar o nome." 
        }, 
        verdict: "WAIT" 
    };
  }
};

export const analyzeLifeContext = async (routine: string, assets: string | AssetItem[], thl: number, profile: FinancialProfile, sleepHours: number = 7): Promise<ContextAnalysisResult> => {
  const ai = getClient();
  
  // Format assets for the prompt depending on input type
  let assetsString = "";
  if (Array.isArray(assets)) {
    if (assets.length === 0) {
      assetsString = "Nenhum ativo significativo cadastrado.";
    } else {
      assetsString = assets.map(a => 
        `- ${a.name} (${a.purchaseYear}): R$${a.purchaseValue}. Análise: ${a.aiAnalysis?.commentary || 'Sem análise'}. Estimativa Mensal de Manutenção: R$${a.aiAnalysis?.maintenanceCostMonthlyEstimate || 0}`
      ).join('\n');
    }
  } else {
    assetsString = assets;
  }

  // SYSTEM INSTRUCTION FOR ROBUST MATRIX CALCULATION
  const prompt = `
  Você é o Auditor Central do OpportunityIQ. Seu papel é realizar uma Auditoria Forense Existencial.
  
  === DADOS DO ALVO ===
  1. PERFIL FINANCEIRO:
     - Renda Líquida Atual: R$ ${profile.netIncome} / mês
     - Renda Aspiracional: R$ ${profile.aspirationalIncome} / mês (GAP: ${profile.aspirationalIncome - profile.netIncome})
     - THL (Valor da Hora): R$ ${thl.toFixed(2)}
  
  2. ROTINA DECLARADA (INPUT DE TEMPO):
     "${routine}"
     - Sono Médio: ${sleepHours}h
  
  3. ATIVOS (INVENTÁRIO):
     ${assetsString}

  === MISSÃO ===
  Forneça um Resumo Executivo BRUTAL e DIRETO (máx 3 frases). Exemplo: "Você vive como rico mas ganha como pobre. Sua rotina é escrava do trânsito."
  Detecte INCONSISTÊNCIAS (Dissonância Cognitiva, Alavancagem Negativa).
  
  === REGRAS DE CÁLCULO DA MATRIZ (0-100) ===
  EIXO X: AUTONOMIA
  EIXO Y: EFICIÊNCIA

  === SAÍDA ESPERADA (JSON) ===
  Garanta que o campo "summary" NUNCA venha vazio ou genérico. Se os dados forem poucos, assuma "Dados insuficientes para diagnóstico completo, mas atenção à falta de clareza."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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

// --- NEW FUNCTION IMPLEMENTATIONS ---

export const getSunkCostAnalysis = async (scenario: SunkCostScenario, thl: CalculatedTHL): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Analise este cenário de Custo Irrecuperável (Sunk Cost Fallacy):
    Projeto: "${scenario.title}"
    Descrição do apego: "${scenario.description}"
    Já investido: R$${scenario.investedMoney || 0} e ${scenario.investedTimeMonths || 0} meses.
    Custo Futuro Estimado: R$${scenario.projectedFutureCostMoney || 0} e ${scenario.projectedFutureCostTime || 0} horas.
    
    THL do Usuário (Valor da Hora): R$${thl.realTHL.toFixed(2)}.

    Calcule o prejuízo real de continuar vs parar.
    Use a filosofia "Amor Fati" e racionalidade econômica.
    Seja brutalmente honesto. Dê um veredito em texto corrido (Markdown).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Sem resposta.";
  } catch (error) {
    return "Erro ao analisar custos.";
  }
};

export const getRefusalScripts = async (request: string): Promise<{diplomatic: string, direct: string, alternative: string}> => {
  const ai = getClient();
  const prompt = `
    Crie 3 scripts para recusar este pedido/convite: "${request}".
    1. Diplomático (Manter a relação).
    2. Direto (Essencialista puro).
    3. Alternativa (Negociar termos).
    Retorne JSON.
  `;

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
    return { diplomatic: "Não posso.", direct: "Não.", alternative: "Talvez depois." };
  }
};

export const getSkillAnalysis = async (skillName: string, currentTHL: number, estimatedIncreasePct: number): Promise<SkillAnalysis> => {
  const ai = getClient();
  const prompt = `
    Analise o ROI de aprender: "${skillName}".
    THL Atual: R$${currentTHL}. Expectativa de aumento: ${estimatedIncreasePct}%.
    O mercado paga isso? É realista?
    Retorne JSON com validação de realidade e comentário curto.
  `;

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
            marketRealityCheck: { type: Type.STRING },
            commentary: { type: Type.STRING }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return { isRealistic: true, marketRealityCheck: "Erro na análise.", commentary: "Considere pesquisar mais." };
  }
};

export const getInactionAnalysis = async (decision: string, monthlyCost: number): Promise<InactionAnalysis> => {
  const ai = getClient();
  const prompt = `
    Calcule o custo da inação para: "${decision}".
    Custo mensal estimado (financeiro + emocional): R$${monthlyCost}.
    Projete custos acumulados (6 meses, 1 ano, 3 anos).
    Liste custos intangíveis.
    Crie um Call to Action agressivo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
     return { 
       cumulativeCost6Months: monthlyCost * 6, 
       cumulativeCost1year: monthlyCost * 12, 
       cumulativeCost3years: monthlyCost * 36, 
       intangibleCosts: ["Estresse", "Ansiedade"], 
       callToAction: "Decida agora." 
     };
  }
};

export const getDashboardAlignmentAnalysis = async (timeData: any[], goals: YearlyCompassData): Promise<string> => {
  const ai = getClient();
  const timeSummary = timeData.map(t => `${t.name}: ${t.value.toFixed(1)}h`).join(', ');
  const goalsSummary = `1: ${goals.goal1.text}, 2: ${goals.goal2.text}, 3: ${goals.goal3.text}`;
  
  const prompt = `
    Atue como um estrategista essencialista.
    Analise o alinhamento entre a rotina diária e as metas do usuário.
    Rotina (24h): ${timeSummary}
    Metas Anuais (Bússola): ${goalsSummary}
    
    Critique: O tempo está sendo gasto onde as metas exigem? Há contradição óbvia?
    Seja curto (máx 2 frases). Ex: "Você quer correr uma maratona mas dedica 0h a treino. Sua prioridade real é o trabalho, não a meta."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Sem dados suficientes para análise de alinhamento.";
  } catch (error) {
    return "O Oráculo está recalculando suas prioridades...";
  }
};
