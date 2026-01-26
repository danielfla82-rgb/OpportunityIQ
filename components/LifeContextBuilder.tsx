
import React, { useState, useEffect } from 'react';
import { LifeContext, ContextAnalysisResult, CalculatedTHL, AssetItem, AppView, FinancialProfile } from '../types';
import { analyzeLifeContext } from '../services/geminiService';
import { Book, Car, Clock, Sparkles, Loader2, CheckCircle2, AlertTriangle, Moon, Sun, Dumbbell, Brain, Wallet, ChevronRight } from 'lucide-react';

interface Props {
  thl: CalculatedTHL;
  profile: FinancialProfile;
  initialContext: LifeContext | null;
  assets: AssetItem[]; 
  onAnalysisComplete: (result: ContextAnalysisResult, context: LifeContext) => void;
  onUpdate?: (updates: Partial<LifeContext>) => void; // New prop for real-time saving
  onNavigate: (view: AppView) => void;
}

const LifeContextBuilder: React.FC<Props> = ({ thl, profile, initialContext, assets, onAnalysisComplete, onUpdate, onNavigate }) => {
  const [routine, setRoutine] = useState(initialContext?.routineDescription || "");
  const [sleepHours, setSleepHours] = useState(initialContext?.sleepHours || 7);
  const [physicalMinutes, setPhysicalMinutes] = useState(initialContext?.physicalActivityMinutes || 0);
  const [studyMinutes, setStudyMinutes] = useState(initialContext?.studyMinutes || 0);
  const [loading, setLoading] = useState(false);

  // Sync state when props change (initial load), ensuring no loop
  useEffect(() => {
    if (initialContext) {
        setRoutine(prev => initialContext.routineDescription !== prev ? initialContext.routineDescription || "" : prev);
        setSleepHours(prev => initialContext.sleepHours !== prev ? initialContext.sleepHours || 7 : prev);
        setPhysicalMinutes(prev => initialContext.physicalActivityMinutes !== prev ? initialContext.physicalActivityMinutes || 0 : prev);
        setStudyMinutes(prev => initialContext.studyMinutes !== prev ? initialContext.studyMinutes || 0 : prev);
    }
  }, [initialContext]);

  // Real-time propagation of changes to parent (auto-save behavior logic resides in parent)
  useEffect(() => {
    if (onUpdate) {
        // Debounce logic could be added here, but parent handles debounced save
        onUpdate({
            routineDescription: routine,
            sleepHours,
            physicalActivityMinutes: physicalMinutes,
            studyMinutes
        });
    }
  }, [routine, sleepHours, physicalMinutes, studyMinutes, onUpdate]);

  const handleAnalyze = async () => {
    if (!routine.trim()) return;
    
    setLoading(true);
    // Pass entire assets array AND full profile to analysis service for better context
    const result = await analyzeLifeContext(routine, assets, thl.realTHL, profile, sleepHours);
    
    const contextData: LifeContext = {
        routineDescription: routine,
        assetsDescription: `Inventário Atualizado: ${assets.length} itens.`,
        sleepHours: sleepHours,
        physicalActivityMinutes: physicalMinutes,
        studyMinutes: studyMinutes,
        lastUpdated: new Date().toISOString(),
        eternalReturnScore: result.eternalReturnScore,
        eternalReturnText: result.eternalReturnAnalysis
    };
    
    onAnalysisComplete(result, contextData);
    setLoading(false);
  };

  // 24h Calculation for "Free Time" preview
  const workHoursDaily = (thl.monthlyTotalHours - thl.monthlyCommuteHours) / 30;
  const commuteHoursDaily = thl.monthlyCommuteHours / 30;
  const physicalHours = physicalMinutes / 60;
  const studyHours = studyMinutes / 60;
  const committedTime = sleepHours + workHoursDaily + commuteHoursDaily + physicalHours + studyHours;
  const trueFreeTimeDaily = Math.max(0, 24 - committedTime);

  // Asset Summary (Safe Array Access)
  const safeAssets = assets || [];
  const netWorth = safeAssets.reduce((acc, curr) => acc + (curr.aiAnalysis?.currentValueEstimated || curr.purchaseValue), 0);
  const liabilities = safeAssets.reduce((acc, curr) => acc + (curr.aiAnalysis?.maintenanceCostMonthlyEstimate || 0), 0);

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
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm">A Rotina (Semana Típica)</h3>
               </div>
               <span className="text-[10px] text-emerald-400 flex items-center gap-1 opacity-70">
                  <CheckCircle2 className="w-3 h-3" /> Salvo Auto
               </span>
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

         {/* Asset Integration Card */}
         <div className="glass-panel p-6 rounded-xl border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm">Inventário de Bens</h3>
                </div>
                {safeAssets.length > 0 && (
                   <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900">
                      R$ {netWorth.toLocaleString()}
                   </span>
                )}
            </div>
            
            {safeAssets.length === 0 ? (
               <div className="text-center py-6 bg-slate-950/30 rounded-lg border border-dashed border-slate-800">
                  <p className="text-xs text-slate-500 mb-3">
                     Você ainda não cadastrou seus bens (carro, imóveis, eletrônicos).
                     O cadastro permite que a IA calcule custos de manutenção ocultos.
                  </p>
                  <button 
                     onClick={() => onNavigate(AppView.ASSET_INVENTORY)}
                     className="text-sm bg-emerald-900/30 text-emerald-300 px-4 py-2 rounded hover:bg-emerald-900/50 transition-colors flex items-center gap-2 mx-auto"
                  >
                     Cadastrar Bens Agora <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            ) : (
               <div className="bg-slate-950/30 rounded-lg p-4 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-slate-400">{safeAssets.length} Itens Cadastrados</span>
                     <span className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Passivo: R${liabilities}/mês</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                     {safeAssets.slice(0, 3).map(a => (
                        <span key={a.id} className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-300 whitespace-nowrap">
                           {a.name}
                        </span>
                     ))}
                     {safeAssets.length > 3 && <span className="text-[10px] text-slate-500 self-center">+{safeAssets.length - 3}</span>}
                  </div>
                  <button 
                     onClick={() => onNavigate(AppView.ASSET_INVENTORY)}
                     className="w-full mt-3 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 rounded border border-slate-700 transition-colors"
                  >
                     Gerenciar Inventário
                  </button>
               </div>
            )}
         </div>

         {/* Bio-Rhythm & Growth */}
         <div className="glass-panel p-6 rounded-xl border-l-4 border-blue-500 space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <Moon className="w-5 h-5 text-blue-400" />
               <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm">Investimento em Si Mesmo (Diário)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Sleep */}
               <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Sono Médio (Horas)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        min="4" max="12" step="0.5"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-center text-white focus:border-blue-500 outline-none"
                     />
                  </div>
               </div>

               {/* Physical Activity */}
               <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2 flex items-center gap-1"><Dumbbell className="w-3 h-3"/> Treino (Min)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        min="0" max="300" step="15"
                        value={physicalMinutes}
                        onChange={(e) => setPhysicalMinutes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-center text-white focus:border-emerald-500 outline-none"
                     />
                  </div>
               </div>

                {/* Study */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2 flex items-center gap-1"><Brain className="w-3 h-3"/> Estudo (Min)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        min="0" max="300" step="15"
                        value={studyMinutes}
                        onChange={(e) => setStudyMinutes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-center text-white focus:border-amber-500 outline-none"
                     />
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Soberania Restante (Tempo Livre Real)</span>
                <div className="text-sm font-bold text-indigo-400 flex items-center gap-2 bg-indigo-950/30 px-3 py-1.5 rounded border border-indigo-500/20">
                   <Sun className="w-4 h-4" />
                   {trueFreeTimeDaily.toFixed(1)}h / dia
                </div>
            </div>
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
                     <strong className="text-slate-200 block text-sm">Auditoria Forense</strong>
                     <span className="text-slate-500 text-xs">A IA vai cruzar sua Renda Declarada com seus Bens para encontrar "estilo de vida insustentável" ou "alavancagem oculta".</span>
                  </div>
               </li>
               <li className="flex items-start gap-3">
                  <div className="bg-red-500/20 p-1.5 rounded text-red-400 mt-0.5">
                     <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                     <strong className="text-slate-200 block text-sm">Detecção de Inconsistências</strong>
                     <span className="text-slate-500 text-xs">Vai verificar se sua rotina (input de tempo) é compatível com sua meta financeira (output desejado).</span>
                  </div>
               </li>
               <li className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-1.5 rounded text-blue-400 mt-0.5">
                     <Moon className="w-4 h-4" />
                  </div>
                  <div>
                     <strong className="text-slate-200 block text-sm">Cálculo de Matriz de Potência</strong>
                     <span className="text-slate-500 text-xs">Determinará sua posição exata entre Escravidão e Soberania (Eixo X/Y).</span>
                  </div>
               </li>
            </ul>

            <button 
               onClick={handleAnalyze}
               disabled={loading || !routine}
               className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 relative z-10"
            >
               {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
               {loading ? "Iniciando Auditoria Neural..." : "Gerar Diagnóstico Nietzscheano"}
            </button>
         </div>
      </div>
    </div>
  );
};

export default LifeContextBuilder;
