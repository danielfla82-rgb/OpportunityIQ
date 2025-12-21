import React, { useState, useEffect } from 'react';
import { LifeContext, ContextAnalysisResult, CalculatedTHL } from '../types';
import { analyzeLifeContext } from '../services/geminiService';
import { Book, Car, Clock, Sparkles, Loader2, CheckCircle2, AlertTriangle, Infinity } from 'lucide-react';

interface Props {
  thl: CalculatedTHL;
  initialContext: LifeContext | null;
  onAnalysisComplete: (result: ContextAnalysisResult, context: LifeContext) => void;
}

const LifeContextBuilder: React.FC<Props> = ({ thl, initialContext, onAnalysisComplete }) => {
  const [routine, setRoutine] = useState(initialContext?.routineDescription || "");
  const [assets, setAssets] = useState(initialContext?.assetsDescription || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialContext) {
        setRoutine(initialContext.routineDescription);
        setAssets(initialContext.assetsDescription);
    }
  }, [initialContext]);

  const handleAnalyze = async () => {
    if (!routine.trim() && !assets.trim()) return;
    
    setLoading(true);
    const result = await analyzeLifeContext(routine, assets, thl.realTHL);
    
    const contextData: LifeContext = {
        routineDescription: routine,
        assetsDescription: assets,
        lastUpdated: new Date().toISOString(),
        eternalReturnScore: result.eternalReturnScore,
        eternalReturnText: result.eternalReturnAnalysis
    };
    
    onAnalysisComplete(result, contextData);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in pb-12">
      
      {/* Introduction */}
      <div className="lg:col-span-2 text-center max-w-2xl mx-auto mb-4">
         <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <Book className="w-8 h-8 text-indigo-400" />
         </div>
         <h2 className="text-3xl font-serif text-white mb-4">Mapeamento de Contexto</h2>
         <p className="text-slate-400 leading-relaxed">
            O OpportunityIQ não é apenas uma calculadora. É um sistema operacional. 
            Descreva sua vida abaixo e a IA irá encontrar <strong className="text-indigo-400">gargalos de tempo</strong>, <strong className="text-red-400">custos ocultos</strong> e aplicar o teste do <strong className="text-purple-400">Eterno Retorno</strong>.
         </p>
      </div>

      {/* Input Form */}
      <div className="space-y-6">
         <div className="glass-panel p-6 rounded-xl border-l-4 border-indigo-500">
            <div className="flex items-center gap-2 mb-4">
               <Clock className="w-5 h-5 text-indigo-400" />
               <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm">A Rotina (Semana Típica)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
               O que você faz desde que acorda? Quanto tempo gasta no trânsito, cozinhando, em reuniões inúteis, limpando a casa? Seja honesto sobre o tempo desperdiçado.
            </p>
            <textarea 
               className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-slate-200 h-48 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
               placeholder="Ex: Acordo às 7h, pego 1h de trânsito. Trabalho 9h por dia. No sábado perco a manhã toda limpando o apartamento e fazendo mercado. Domingo fico exausto..."
               value={routine}
               onChange={(e) => setRoutine(e.target.value)}
            />
         </div>

         <div className="glass-panel p-6 rounded-xl border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 mb-4">
               <Car className="w-5 h-5 text-emerald-400" />
               <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm">Inventário (Bens & Passivos)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
               O que você possui que custa dinheiro ou tempo? Carros, casa de praia, assinaturas, equipamentos caros parados.
            </p>
            <textarea 
               className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-slate-200 h-48 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
               placeholder="Ex: Tenho um SUV financiado que gasta muito. Assino 5 streamings mas só vejo 1. Tenho uma esteira que virou cabide."
               value={assets}
               onChange={(e) => setAssets(e.target.value)}
            />
         </div>
      </div>

      {/* Action / Preview Area */}
      <div className="flex flex-col justify-center space-y-8">
         <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700"></div>
            
            <h3 className="text-xl font-serif text-white mb-6 relative z-10">O que a IA vai fazer?</h3>
            
            <ul className="space-y-4 relative z-10">
               <li className="flex items-start gap-3">
                  <div className="bg-indigo-500/20 p-1.5 rounded text-indigo-400 mt-0.5">
                     <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                     <strong className="text-slate-200 block text-sm">Popular Matriz de Delegação</strong>
                     <span className="text-slate-500 text-xs">Vai calcular automaticamente se vale a pena contratar faxina ou Uber baseado no seu relato.</span>
                  </div>
               </li>
               <li className="flex items-start gap-3">
                  <div className="bg-red-500/20 p-1.5 rounded text-red-400 mt-0.5">
                     <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                     <strong className="text-slate-200 block text-sm">Detectar Custos Irrecuperáveis</strong>
                     <span className="text-slate-500 text-xs">Vai alertar sobre aquele projeto ou bem que está drenando sua vida.</span>
                  </div>
               </li>
               <li className="flex items-start gap-3">
                  <div className="bg-purple-500/20 p-1.5 rounded text-purple-400 mt-0.5">
                     <Infinity className="w-4 h-4" />
                  </div>
                  <div>
                     <strong className="text-slate-200 block text-sm">Teste do Eterno Retorno</strong>
                     <span className="text-slate-500 text-xs">Calcularemos seu índice de aceitação da vida (0-100).</span>
                  </div>
               </li>
            </ul>

            <button 
               onClick={handleAnalyze}
               disabled={loading || (!routine && !assets)}
               className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 relative z-10"
            >
               {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
               {loading ? "Processando sua Vida..." : "Gerar Diagnóstico Nietzscheano"}
            </button>
         </div>
      </div>
    </div>
  );
};

export default LifeContextBuilder;