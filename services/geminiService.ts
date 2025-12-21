
import { GoogleGenAI, Type } from "@google/genai";
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
  // Don't crash if key is missing, just provide a dummy one to instantiate the client. 
  // Calls will fail gracefully later with 400/403.
  return new GoogleGenAI({ apiKey: key || 'dummy_key' });
};

// --- HELPER: ROBUST JSON PARSER ---
// AI models often wrap JSON in markdown blocks (```json ... ```). This helper strips them.
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) throw new Error("Empty response from AI");
  
  try {
    // 1. Remove markdown code blocks
    let cleaned = text.replace(/```json\n?|```/g, '').trim();
    
    // 2. Find the first '{' or '[' and the last '}' or ']'
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const start = (firstBrace === -1) ? firstBracket : (firstBracket === -1) ? firstBrace : Math.min(firstBrace, firstBracket);
    
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const end = Math.max(lastBrace, lastBracket);

    if (start >= 0 && end >= 0) {
      cleaned = cleaned.substring(start, end + 1);
    }

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Logic Error:", e, "Original Text:", text);
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
    
    Dados do Usuário:
    - THL Atual: R$ ${thl.toFixed(2)}/hora.
    - Contexto de Vida: ${context}
    
    Diretrizes de Estilo:
    1. Seja direto, profundo e levemente provocativo.
    2. Use conceitos como "Custo de Oportunidade", "Vontade de Potência", "Via Negativa".
    3. Não dê conselhos genéricos de autoajuda ("acredite em si mesmo"). Dê conselhos táticos e filosóficos.
    4. Respostas curtas são melhores que longas.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const getSunkCostAnalysis = async (
  scenario: SunkCostScenario,
  thl: CalculatedTHL
): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    Atue como um Filósofo Estrategista inspirado em Friedrich Nietzsche e Economia Comportamental.
    
    Analise este dilema de custo irrecuperável com o conceito de "Amor Fati" (Amar o destino, inclusive os erros, pois eles forjaram quem você é).
    Não trate o passado apenas como perda, mas como uma fundação necessária que agora deve ser superada pela "Vontade de Potência".
    
    Projeto: "${scenario.title}"
    Descrição: ${scenario.description}
    
    Dados:
    - THL Real: R$ ${thl.realTHL.toFixed(2)}/h
    - Passado (Irrecuperável): ${scenario.investedTimeMonths} meses, R$ ${scenario.investedMoney}
    - Futuro (Se persistir): R$ ${scenario.projectedFutureCostMoney} e ${scenario.projectedFutureCostTime} horas
    
    DIRETRIZES:
    1. Aplique a navalha do Custo de Oportunidade brutalmente.
    2. Se for para ABANDONAR: Use tom de "Amor Fati". Aceite a perda sem ressentimento e liberte a energia para o novo.
    3. Se for para PIVOTAR/PERSEVERAR: Exija uma razão baseada em poder futuro, não em apego passado.
    4. Seja curto, poético e cortante.

    Veredito final (Máx 2 parágrafos):
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });
    
    return response.text || "O Oráculo está em silêncio. Tente novamente.";
  } catch (error) {
    console.error("Erro na análise neural:", error);
    return "O oráculo neural está temporariamente indisponível. Verifique sua chave de API.";
  }
};

export const getDelegationAdvice = async (
  item: string,
  cost: number,
  hoursSaved: number,
  thl: number
): Promise<{ text: string, archetype: NietzscheArchetype }> => {
  const ai = getClient();
  const profit = (thl * hoursSaved) - cost;
  
  const prompt = `
    Use a metáfora das "Três Metamorfoses" de Nietzsche (Assim Falou Zaratustra) para classificar esta tarefa de delegação.
    
    Tarefa: "${item}"
    Custo: R$ ${cost}
    Horas Salvas: ${hoursSaved}h
    Lucro de Tempo: R$ ${profit.toFixed(2)}
    
    Classifique em:
    - CAMEL (Camelo): Um peso que você carrega pelos outros ou por obrigação. Deve ser DELEGADO para você virar Leão. (Geralmente tarefas repetitivas, baixo valor).
    - LION (Leão): Uma batalha necessária para conquistar liberdade. (Tarefas difíceis, alto valor, mas talvez delegáveis).
    - CHILD (Criança): Criação pura, o "Sim" à vida. O objetivo final. (Coisas que você ama fazer).

    Retorne JSON estrito:
    {
      "text": "Frase curta (máx 15 palavras) com um 'Neuro Nudge' ou 'Amor Fati' sobre delegar isso.",
      "archetype": "CAMEL" | "LION" | "CHILD"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return {
      text: "Erro ao consultar Zaratustra.",
      archetype: "CAMEL"
    };
  }
};

export const getTimeWisdom = async (): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Gere um aforismo original estilo Nietzsche ou Estoico sobre Vontade de Potência, Tempo e Morte (Memento Mori).
    Máximo 20 palavras. Sem aspas. Em Português.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Torna-te quem tu és.";
  } catch (error) {
    return "O tempo é um círculo plano.";
  }
};

export const getRefusalScripts = async (request: string): Promise<{diplomatic: string, direct: string, alternative: string}> => {
  const ai = getClient();
  const prompt = `
    O usuário precisa dizer "NÃO" para proteger seu tempo (Vontade de Potência).
    O pedido recebido foi: "${request}".
    
    Gere 3 scripts:
    1. Diplomático (Máscara social)
    2. Nietzscheano Direto (Afirmação da própria vontade, sem culpa cristã)
    3. A "Negociação Suave" (Diz não agora, oferece alternativa)
    
    Retorne JSON estrito: { "diplomatic": "...", "direct": "...", "alternative": "..." }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return {
      diplomatic: "Agradeço, mas não posso.",
      direct: "Minha vontade aponta para outra direção agora.",
      alternative: "Não posso, mas talvez X possa."
    };
  }
};

export const getParetoAnalysis = async (tasks: string): Promise<ParetoResult> => {
  const ai = getClient();
  const prompt = `
    Analise a lista de tarefas fornecida aplicando o Princípio de Pareto (80/20).
    Identifique os 20% das tarefas (Vital Few) que geram a maior parte do valor/impacto.
    O restante (Trivial Many) deve ser classificado para ELIMINAR, DELEGAR ou AUTOMATIZAR.

    Lista de Tarefas:
    ${tasks}

    Retorne JSON estrito:
    {
      "vitalFew": [{"task": "Nome da tarefa", "impact": "Por que é alto impacto"}],
      "trivialMany": [{"task": "Nome da tarefa", "action": "ELIMINATE" | "DELEGATE" | "AUTOMATE", "reasoning": "Breve justificativa"}]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error(error);
    return {
      vitalFew: [],
      trivialMany: []
    };
  }
};

export const getPhilosophicalAnalysis = async (dilemma: string): Promise<RazorAnalysis> => {
  const ai = getClient();
  const prompt = `
    Analise o seguinte dilema usando 3 Modelos Mentais:
    Dilema: "${dilemma}"

    1. Navalha de Occam: Qual é a solução mais simples?
    2. A Inversão (Via Negativa): O que EVITAR a todo custo?
    3. Minimização de Arrependimento (Eterno Retorno): Se você tivesse que viver essa escolha infinitas vezes, qual escolheria?

    Retorne JSON estrito:
    {
      "occam": "Texto curto",
      "inversion": "Texto curto",
      "regret": "Texto curto",
      "synthesis": "Veredito final curto"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return {
      occam: "Simplifique.",
      inversion: "Evite a ruína.",
      regret: "Escolha o que você amaria repetir.",
      synthesis: "Aja."
    };
  }
};

export const getPreMortemAnalysis = async (goal: string): Promise<PreMortemResult> => {
  const ai = getClient();
  const prompt = `
    Exercício de VIA NEGATIVA (Pre-Mortem Estoico).
    
    O usuário tem o objetivo: "${goal}".
    Imagine que estamos 12 meses no futuro. O PROJETO FRACASSOU.
    
    Liste 4 causas específicas de estupidez, negligência ou omissão.
    
    Retorne JSON estrito:
    {
       "deathDate": "Data futura",
       "causeOfDeath": "Frase dramática",
       "autopsyReport": [
         {"cause": "Causa específica", "prevention": "Antídoto (Via Negativa)"}
       ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return {
       deathDate: "Futuro",
       causeOfDeath: "Desconhecida",
       autopsyReport: []
    };
  }
};

export const getFutureSimulations = async (pathA: string, pathB: string): Promise<TimeTravelResult> => {
  const ai = getClient();
  const prompt = `
    Exercício de ETERNO RETORNO (Nietzsche).
    
    Dúvida:
    A: ${pathA}
    B: ${pathB}
    
    Imagine viver cada caminho repetidamente por toda a eternidade.
    Qual causa náusea? Qual causa aceitação (Amor Fati)?

    Retorne JSON estrito:
    {
      "pathA": { "title": "Caminho A", "memoir": "Descrição sensorial do eterno retorno deste caminho", "regretLevel": 1-10 },
      "pathB": { "title": "Caminho B", "memoir": "Descrição sensorial do eterno retorno deste caminho", "regretLevel": 1-10 },
      "synthesis": "Qual caminho você gritaria 'Da Capo!' (De novo!)?"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return {
      pathA: { title: pathA, memoir: "Erro.", regretLevel: 5 },
      pathB: { title: pathB, memoir: "Erro.", regretLevel: 5 },
      synthesis: "Erro."
    };
  }
};

export const getEnergyAudit = async (tasks: string): Promise<EnergyAuditItem[]> => {
  const ai = getClient();
  const prompt = `
    Classifique as tarefas com base em Energia Vital.
    Tarefas: ${tasks}

    Classifique em:
    - GENIUS (Alto Valor, Ganha Energia)
    - TRAP (Baixo Valor, Ganha Energia)
    - GRIND (Alto Valor, Drena Energia)
    - DUMP (Baixo Valor, Drena Energia)

    Retorne JSON estrito Array<EnergyAuditItem>.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanAndParseJSON(response.text) || [];
  } catch (error) {
    return [];
  }
};

export const getSkillAnalysis = async (skill: string, currentTHL: number, increasePercent: number): Promise<SkillAnalysis> => {
  const ai = getClient();
  const prompt = `
    Analise o ROI de aprender: "${skill}".
    Atual: R$ ${currentTHL}/h. Meta: +${increasePercent}%.

    Retorne JSON estrito: { "isRealistic": boolean, "commentary": "...", "marketRealityCheck": "..." }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanAndParseJSON(response.text);
  } catch (error) {
    return { isRealistic: true, commentary: "Sem dados.", marketRealityCheck: "N/A" };
  }
};

export const getInactionAnalysis = async (decision: string, monthlyCost: number): Promise<InactionAnalysis> => {
  const ai = getClient();
  const prompt = `
    Analise a INAÇÃO para: "${decision}". Custo mensal R$ ${monthlyCost}.
    Use a ideia de que "não escolher é escolher".
    Retorne JSON estrito: { "intangibleCosts": string[], "callToAction": string }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const data = cleanAndParseJSON(response.text);
    return {
      cumulativeCost6Months: monthlyCost * 6,
      cumulativeCost1year: monthlyCost * 12,
      cumulativeCost3years: monthlyCost * 36,
      intangibleCosts: data.intangibleCosts || [],
      callToAction: data.callToAction || "Decida."
    };
  } catch (error) {
    return { cumulativeCost6Months: 0, cumulativeCost1year: 0, cumulativeCost3years: 0, intangibleCosts: [], callToAction: "Erro." };
  }
};

export const getLifestyleAudit = async (item: string, price: number): Promise<LifestyleAudit> => {
  const ai = getClient();
  const futureValue = price * Math.pow(1.07, 10);
  const prompt = `
    Analise compra de "${item}" (R$ ${price}). Combata o consumismo de rebanho.
    Retorne JSON estrito: { "paretoAlternative": { "name": string, "priceEstimate": number, "reasoning": string }, "verdict": "BUY"|"WAIT"|"DOWNGRADE" }
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const data = cleanAndParseJSON(response.text);
    return {
      hoursOfLifeLost: 0,
      futureValueLost: futureValue,
      paretoAlternative: data.paretoAlternative || { name: "N/A", priceEstimate: 0, reasoning: "N/A" },
      verdict: data.verdict || "WAIT"
    };
  } catch (e) {
    return { hoursOfLifeLost: 0, futureValueLost: futureValue, paretoAlternative: { name: "N/A", priceEstimate: 0, reasoning: "" }, verdict: "WAIT" };
  }
};

export const analyzeLifeContext = async (routine: string, assets: string, thl: number): Promise<ContextAnalysisResult> => {
  const ai = getClient();
  
  const prompt = `
    Analise este contexto de vida sob a ótica da Eficiência Radical, das 3 Metamorfoses e do ETERNO RETORNO de Nietzsche.
    
    Dados:
    THL: R$ ${thl.toFixed(2)}/h
    Rotina: "${routine}"
    Ativos: "${assets}"

    Tarefas:
    1. Identifique oportunidades de delegação.
    2. Identifique custos irrecuperáveis.
    3. Identifique riscos de estilo de vida.
    4. CALCULE O "ÍNDICE DO ETERNO RETORNO" (0-100): Se o usuário tivesse que repetir essa exata rotina para sempre, quão infernal (0) ou divino (100) seria?
    5. POSICIONE NA MATRIZ DE POTÊNCIA (Coordenadas X/Y 0-100):
       - Eixo X (Autonomia): O quanto o usuário controla a própria agenda? 0 = Escravo da rotina, 100 = Soberano do tempo.
       - Eixo Y (Eficiência): O quão bem ele aloca recursos/energia? 0 = Desperdício total, 100 = Máquina de alavancagem.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // No thinking budget for pure JSON tasks to ensure structure
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
                  category: { type: Type.STRING },
                }
              }
            },
            sunkCostSuspects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                }
              }
            },
            lifestyleRisks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summary: { type: Type.STRING },
            eternalReturnScore: { type: Type.INTEGER },
            eternalReturnAnalysis: { type: Type.STRING },
            matrixCoordinates: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.INTEGER },
                y: { type: Type.INTEGER },
                quadrantLabel: { type: Type.STRING }
              }
            }
          },
          required: ["delegationSuggestions", "sunkCostSuspects", "lifestyleRisks", "summary", "eternalReturnScore", "eternalReturnAnalysis", "matrixCoordinates"]
        }
      }
    });
    
    // With schema validation, cleanAndParseJSON might be redundant but safe
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return {
      delegationSuggestions: [],
      sunkCostSuspects: [],
      lifestyleRisks: [],
      summary: "Erro na análise neural. O oráculo falhou em estruturar a visão. Tente simplificar o texto.",
      eternalReturnScore: 50,
      eternalReturnAnalysis: "Dados insuficientes.",
      matrixCoordinates: { x: 50, y: 50, quadrantLabel: "Indefinido (Erro)" }
    };
  }
};
