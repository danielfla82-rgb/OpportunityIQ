
/**
 * ARQUITETURA DE CONFIGURAÇÃO DE IA
 * Centraliza a gestão de chaves e estratégias de fallback.
 */

// Chave fornecida manualmente para fallback (Hardcoded conforme solicitação)
// NOTA DE SEGURANÇA: Em produção real, evite commitar chaves no código.
const FALLBACK_KEY = "AIzaSyCYQnFsbssa6-324JjV9nbMhAEriRrEpKE";

/**
 * Recupera a API Key com estratégia de prioridade:
 * 1. Variável de Ambiente (Vite/Process)
 * 2. Fallback Manual
 */
export const getGeminiApiKey = (): string => {
  // Tenta recuperar do import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_API_KEY) {
    return (import.meta as any).env.VITE_GOOGLE_API_KEY;
  }
  
  // Tenta recuperar do process.env (Node/Next/Polyfill)
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }

  // Fallback final
  return FALLBACK_KEY;
};

/**
 * Estratégia Smart Runner (Cascata de Modelos)
 * Prioridade: Inteligência/Velocidade do 2.0 -> Estabilidade do 1.5
 */
export const MODEL_CASCADE = [
  'gemini-2.0-flash',        // Primário: Mais rápido e capaz
  'gemini-2.0-flash-exp',    // Secundário: Versão experimental (caso a stable não esteja roll-outed)
  'gemini-1.5-flash',        // Fallback 1: Modelo estável anterior
  'gemini-1.5-flash-latest'  // Fallback 2: Legacy stable
];

export const SYSTEM_INSTRUCTIONS = {
  DEFAULT: "Você é Zeus, um estrategista estoico e brutalmente racional. Responda com precisão cirúrgica.",
  JSON_MODE: "Retorne APENAS JSON válido. Sem markdown, sem explicações adicionais."
};
