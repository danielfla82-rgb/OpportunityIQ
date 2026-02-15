
/**
 * ARQUITETURA DE CONFIGURAÇÃO DE IA
 * Centraliza a gestão de chaves e estratégias de fallback.
 */

/**
 * Recupera a API Key.
 * Implementa estratégia de busca robusta para garantir funcionamento em diversos ambientes (Vite, Next, etc).
 */
export const getGeminiApiKey = (): string => {
  let key = '';

  // 1. Tenta variáveis injetadas pelo Vite (import.meta.env)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_GOOGLE_API_KEY) key = import.meta.env.VITE_GOOGLE_API_KEY;
      // @ts-ignore
      else if (import.meta.env.VITE_API_KEY) key = import.meta.env.VITE_API_KEY;
      // @ts-ignore
      else if (import.meta.env.GOOGLE_API_KEY) key = import.meta.env.GOOGLE_API_KEY;
      // @ts-ignore
      else if (import.meta.env.API_KEY) key = import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors accessing import.meta
  }

  // 2. Se não encontrou, tenta process.env (Node/System/Webpack)
  if (!key && typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_GOOGLE_API_KEY) key = process.env.VITE_GOOGLE_API_KEY;
    else if (process.env.VITE_API_KEY) key = process.env.VITE_API_KEY;
    else if (process.env.GOOGLE_API_KEY) key = process.env.GOOGLE_API_KEY;
    else if (process.env.API_KEY) key = process.env.API_KEY;
  }

  return key ? key.trim() : '';
};

/**
 * Estratégia Smart Runner (Cascata de Modelos)
 * Prioridade ajustada para modelos Flash (Velocidade/Custo) conforme solicitado.
 */
export const MODEL_CASCADE = [
  'gemini-3-flash-preview',  // Novo padrão: Rápido e estável
  'gemini-3-pro-preview',    // Fallback: Raciocínio complexo
  'gemini-flash-latest',     // Fallback: Legado (1.5 Flash)
];

export const SYSTEM_INSTRUCTIONS = {
  DEFAULT: "Você é Zeus, um estrategista estoico e brutalmente racional. Responda com precisão cirúrgica.",
  JSON_MODE: "Retorne APENAS JSON válido. Sem markdown, sem explicações adicionais. Estrutura estrita."
};
