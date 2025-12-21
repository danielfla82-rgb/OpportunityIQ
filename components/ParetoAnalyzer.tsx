import React, { useState } from 'react';
import { ParetoResult } from '../types';
import { getParetoAnalysis } from '../services/geminiService';
import { ArrowDownAZ, Star, Trash2, User, Bot, Loader2, Target } from 'lucide-react';

const ParetoAnalyzer: React.FC = () => {
  const [tasks, setTasks] = useState("");
  const [result, setResult] = useState<ParetoResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!tasks.trim()) return;
    setLoading(true);
    const analysis = await getParetoAnalysis(tasks);
    setResult(analysis);
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'ELIMINATE': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'DELEGATE': return <User className="w-4 h-4 text-amber-500" />;
      case 'AUTOMATE': return <Bot className="w-4 h-4 text-cyan-500" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch(action) {
      case 'ELIMINATE': return 'Eliminar';
      case 'DELEGATE': return 'Delegar';
      case 'AUTOMATE': return 'Automatizar';
      default: return action;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in h-full">
      {/* Input */}
      <div className="lg:col-span-2 space-y-6">
        <div>
           <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            Analisador de Pareto
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            20% das suas ações geram 80% dos resultados. Liste tudo o que você precisa fazer e a IA vai separar o ouro do cascalho.
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col h-[500px]">
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-3">Lista de Tarefas (Uma por linha)</label>
          <textarea 
            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
            placeholder={`Ex:\n- Fazer relatório mensal\n- Responder e-mail do cliente X\n- Comprar café\n- Planejamento estratégico 2025\n- Reunião de alinhamento semanal`}
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
          />
          <button 
             onClick={handleAnalyze}
             disabled={loading || !tasks.trim()}
             className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowDownAZ className="w-5 h-5" />}
             {loading ? "Aplicando Filtro 80/20..." : "Priorizar Agora"}
           </button>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-6 overflow-y-auto">
        {!result && !loading && (
           <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center min-h-[500px]">
             <Target className="w-16 h-16 text-slate-700 mb-4" />
             <p className="text-slate-500 max-w-xs">
               A maioria das coisas não importa. Descubra o que realmente move a agulha.
             </p>
           </div>
        )}

        {result && (
          <>
            {/* The Vital Few */}
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  <h3 className="text-lg font-serif text-emerald-200">Os 20% Vitais (Foco Total)</h3>
               </div>
               <div className="space-y-3 relative z-10">
                 {result.vitalFew.map((item, idx) => (
                   <div key={idx} className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-lg">
                      <div className="font-medium text-white text-lg">{item.task}</div>
                      <div className="text-emerald-400/80 text-sm mt-1">{item.impact}</div>
                   </div>
                 ))}
                 {result.vitalFew.length === 0 && <p className="text-slate-500 italic">Nenhuma tarefa de alto impacto identificada.</p>}
               </div>
            </div>

            {/* The Trivial Many */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
               <div className="flex items-center gap-2 mb-4 text-slate-400">
                  <h3 className="text-sm uppercase tracking-widest font-bold">Os 80% Triviais (Delegar/Eliminar)</h3>
               </div>
               <div className="space-y-3">
                 {result.trivialMany.map((item, idx) => (
                   <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800 gap-3">
                      <div className="flex-1">
                        <div className="text-slate-300 line-through decoration-slate-600">{item.task}</div>
                        <div className="text-xs text-slate-600 mt-1">{item.reasoning}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded bg-slate-900 border border-slate-700 shrink-0">
                         {getActionIcon(item.action)}
                         <span className="text-slate-400">{getActionLabel(item.action)}</span>
                      </div>
                   </div>
                 ))}
                 {result.trivialMany.length === 0 && <p className="text-slate-500 italic">Lista limpa.</p>}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParetoAnalyzer;