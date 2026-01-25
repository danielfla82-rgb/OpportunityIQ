
/**
 * ARQUITETURA DE CONFIGURAÇÃO DE IA
 * Centraliza a gestão de chaves e estratégias de fallback.
 */

/**
 * Recupera a API Key.
 * Tenta process.env (padrão) e fallbacks para Vite (import.meta.env).
 */
export const getGeminiApiKey = (): string => {
  // 1. Tenta variável de ambiente padrão (Node/System)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY.trim();
  }

  // 2. Tenta variável injetada pelo Vite (Padrão VITE_)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY.trim();
    // @ts-ignore
    if (import.meta.env.API_KEY) return import.meta.env.API_KEY.trim();
  }

  return '';
};

/**
 * Estratégia Smart Runner (Cascata de Modelos)
 */
export const MODEL_CASCADE = [
  'gemini-3-flash-preview',  // Primário: Rápido e inteligente
  'gemini-3-pro-preview',    // Fallback: Mais robusto
  'gemini-flash-latest'      // Legacy: Último recurso
];

export const SYSTEM_INSTRUCTIONS = {
  DEFAULT: "Você é Zeus, um estrategista estoico e brutalmente racional. Responda com precisão cirúrgica.",
  JSON_MODE: "Retorne APENAS JSON válido. Sem markdown, sem explicações adicionais."
};
