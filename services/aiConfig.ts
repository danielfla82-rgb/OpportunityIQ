
/**
 * ARQUITETURA DE CONFIGURAÇÃO DE IA
 * Centraliza a gestão de chaves e estratégias de fallback.
 */

/**
 * Recupera a API Key.
 * Conforme diretrizes, deve usar exclusivamente process.env.API_KEY.
 */
export const getGeminiApiKey = (): string => {
  // Garante o uso da variável de ambiente injetada pelo sistema
  const key = process.env.API_KEY;
  return key ? key.trim() : '';
};

/**
 * Estratégia Smart Runner (Cascata de Modelos)
 * Prioridade: Gemini 3 Flash -> Gemini 3 Pro
 * Se o primeiro falhar (404/500), o sistema tenta o próximo automaticamente.
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
