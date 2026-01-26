
import React, { useState, useRef, useEffect } from 'react';
import { CalculatedTHL, LifeContext } from '../types';
import { createSpecialistChat } from '../services/geminiService';
import type { GenerateContentResponse, Chat } from "@google/genai";
import { Send, User, Bot, Loader2, MessageSquare, Quote, List, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  thl: CalculatedTHL;
  lifeContext: LifeContext | null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// --- Custom Markdown Renderer Component ---
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  // Helper to parse inline formatting (bold, italic)
  const parseInline = (str: string) => {
    let formatted = str;
    // Bold: **text** -> <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400 font-bold">$1</strong>');
    // Italic: *text* -> <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-indigo-300 font-serif">$1</em>');
    return { __html: formatted };
  };

  // Split by double newlines to handle paragraphs/blocks
  const blocks = text.split(/\n\n+/);

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        
        // Handle Headings (### Title)
        if (trimmed.startsWith('###')) {
           return (
              <h3 key={idx} className="text-lg font-serif text-indigo-300 border-b border-indigo-500/30 pb-1 mb-2 mt-4 first:mt-0">
                 {trimmed.replace(/^###\s*/, '')}
              </h3>
           );
        }

        // Handle Blockquotes (> Quote)
        if (trimmed.startsWith('>')) {
           const content = trimmed.replace(/^>\s*/gm, '');
           return (
              <div key={idx} className="flex gap-3 bg-slate-900/60 border-l-4 border-indigo-500 p-4 rounded-r-lg my-3">
                 <Quote className="w-5 h-5 text-indigo-400 shrink-0 opacity-50" />
                 <p className="font-serif italic text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={parseInline(content)}></p>
              </div>
           );
        }

        // Handle Lists (lines starting with - or *)
        if (trimmed.match(/^[-*]\s/m)) {
           const items = trimmed.split('\n').filter(line => line.trim().match(/^[-*]\s/));
           return (
              <ul key={idx} className="space-y-2 my-2 bg-black/20 p-4 rounded-lg border border-white/5">
                 {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                       <span dangerouslySetInnerHTML={parseInline(item.replace(/^[-*]\s/, ''))}></span>
                    </li>
                 ))}
              </ul>
           );
        }

        // Default Paragraph
        return (
          <p key={idx} className="text-sm leading-7 text-slate-200" dangerouslySetInnerHTML={parseInline(trimmed)}></p>
        );
      })}
    </div>
  );
};

const SpecialistChat: React.FC<Props> = ({ thl, lifeContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Eu sou seu Estrategista. Analiso sua vida através de **Nietzsche** e **Pareto**. Onde dói a sua ineficiência hoje?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat session when vital context changes
  useEffect(() => {
    chatSessionRef.current = null;
  }, [thl.realTHL, lifeContext?.routineDescription, lifeContext?.assetsDescription]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Initialize chat only once or if context changes
      if (!chatSessionRef.current) {
         const contextString = lifeContext 
            ? `Rotina: ${lifeContext.routineDescription}. Ativos: ${lifeContext.assetsDescription}` 
            : "Usuário ainda não mapeou o contexto.";
         chatSessionRef.current = createSpecialistChat(thl.realTHL, contextString);
      }

      // Add placeholder for streaming message
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = "";
      for await (const chunk of result) {
         const c = chunk as GenerateContentResponse;
         if (c.text) {
            fullText += c.text;
            setMessages(prev => {
               const newArr = [...prev];
               newArr[newArr.length - 1] = { role: 'model', text: fullText };
               return newArr;
            });
         }
      }
    } catch (error: any) {
      console.error("Chat Error", error);
      let errorMsg = "O Oráculo silenciou. Verifique sua conexão.";
      
      // Detalhes técnicos amigáveis para o erro de API Key
      if (error.message?.includes('API key') || error.message?.includes('403')) {
        errorMsg = "ERRO CRÍTICO: Chave de API inválida ou ausente.\n\nVerifique se o arquivo .env contém uma das variáveis:\nVITE_GOOGLE_API_KEY\nVITE_API_KEY";
      } else if (error.message?.includes('429')) {
        errorMsg = "Tráfego intenso no Oráculo (Erro 429). Tente novamente em alguns segundos.";
      }

      setMessages(prev => {
         // Remove the empty loading placeholder if it exists and is empty
         const last = prev[prev.length - 1];
         const filtered = last.role === 'model' && last.text === '' ? prev.slice(0, -1) : prev;
         return [...filtered, { role: 'model', text: errorMsg, isError: true }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-5xl mx-auto pb-4">
      <div className="mb-6 text-center">
         <h2 className="text-2xl font-serif text-slate-100 flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            Conselho do Especialista
         </h2>
         <p className="text-slate-400 text-sm mt-1">
            Um diálogo socrático focado na sua Vontade de Potência.
         </p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
         {/* Background Noise/Gradient */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none"></div>

         <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
            {messages.map((msg, idx) => (
               <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-lg ${
                     msg.role === 'user' 
                        ? 'bg-slate-800 border-slate-700' 
                        : msg.isError ? 'bg-red-950 border-red-500/30' : 'bg-indigo-950 border-indigo-500/30'
                  }`}>
                     {msg.role === 'user' ? <User className="w-5 h-5 text-slate-300" /> : msg.isError ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Bot className="w-6 h-6 text-indigo-300" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 md:p-6 shadow-xl ${
                     msg.role === 'user' 
                        ? 'bg-slate-800 text-slate-200 rounded-tr-sm border border-slate-700' 
                        : msg.isError 
                            ? 'bg-red-950/20 text-red-200 rounded-tl-sm border border-red-500/20'
                            : 'bg-gradient-to-b from-slate-900 to-slate-900/95 text-indigo-50 rounded-tl-sm border border-indigo-500/10'
                  }`}>
                     {msg.role === 'model' && !msg.isError ? (
                        <div className="prose prose-invert max-w-none">
                           <FormattedMessage text={msg.text} />
                        </div>
                     ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                     )}
                     
                     {/* Blinking Cursor for Model */}
                     {msg.role === 'model' && loading && idx === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse"></span>
                     )}
                  </div>
               </div>
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 relative z-10">
            <div className="relative flex items-center max-w-4xl mx-auto">
               <input 
                  type="text"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-500 transition-all shadow-inner"
                  placeholder="Ex: Como posso delegar mais se não tenho dinheiro?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={loading}
               />
               <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-600/20"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
               </button>
            </div>
            <div className="text-center mt-3">
               <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Alimentado por Gemini 3 Flash • Filosofia Radical
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SpecialistChat;
