
import React, { useState } from 'react';
import { SunkCostScenario, CalculatedTHL } from '../types';
import { Brain, AlertOctagon, RefreshCcw, Heart } from 'lucide-react';
import { getSunkCostAnalysis } from '../services/geminiService';

interface Props {
  thl: CalculatedTHL;
}

const SunkCostSolver: React.FC<Props> = ({ thl }) => {
  const [scenario, setScenario] = useState<Partial<SunkCostScenario>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!scenario.title || !scenario.description) return;
    
    setLoading(true);
    const analysis = await getSunkCostAnalysis(scenario as SunkCostScenario, thl);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in h-full">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-slate-100 mb-2">Amor Fati: Solucionador de Custos</h2>
          <p className="text-slate-400 text-sm">
            "Não queira nada diferente do que é, nem no futuro, nem no passado, nem por toda a eternidade." — Nietzsche.
            A IA vai te ajudar a aceitar a perda e focar na Potência.
          </p>
        </div>

        <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Nome do Projeto / Carreira</label>
            <input 
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-indigo-500 outline-none"
              placeholder="Ex: Curso de Medicina, Startup X..."
              value={scenario.title || ''}
              onChange={e => setScenario({...scenario, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Passado (O que já foi, foi)</label>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200"
                placeholder="R$ Investido"
                value={scenario.investedMoney || ''}
                onChange={e => setScenario({...scenario, investedMoney: parseFloat(e.target.value)})}
              />
              <input 
                type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200"
                placeholder="Meses"
                value={scenario.investedTimeMonths || ''}
                onChange={e => setScenario({...scenario, investedTimeMonths: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
             <label className="block text-xs text-indigo-400 uppercase tracking-wide mb-2">Futuro (Onde sua vontade pode agir)</label>
             <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200"
                  placeholder="R$ Futuros"
                  value={scenario.projectedFutureCostMoney || ''}
                  onChange={e => setScenario({...scenario, projectedFutureCostMoney: parseFloat(e.target.value)})}
                />
                 <input 
                  type="number"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200"
                  placeholder="Horas Futuras"
                  value={scenario.projectedFutureCostTime || ''}
                  onChange={e => setScenario({...scenario, projectedFutureCostTime: parseFloat(e.target.value)})}
                />
             </div>
          </div>

           <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">O Dilema</label>
            <textarea 
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 h-24 focus:border-indigo-500 outline-none"
              placeholder="Por que é difícil largar?"
              value={scenario.description || ''}
              onChange={e => setScenario({...scenario, description: e.target.value})}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCcw className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
            {loading ? "Filosofando..." : "Consultar Oráculo"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-3 flex flex-col h-full">
        {result ? (
          <div className="bg-slate-900 border border-indigo-900/50 rounded-xl p-8 relative overflow-hidden flex-1 animate-fade-in-up">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertOctagon className="w-48 h-48 text-indigo-500" />
            </div>
            
            <h3 className="text-xl font-serif text-indigo-300 mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6" /> Veredito de Amor Fati
            </h3>
            
            <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-white max-w-none leading-relaxed">
               <div className="whitespace-pre-line text-lg font-serif">
                 {result}
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="text-sm text-slate-500">Custo de Oportunidade Calculado</div>
               <div className="text-2xl font-mono text-white mt-1">
                 R$ {((scenario.projectedFutureCostTime || 0) * thl.realTHL).toLocaleString()} 
                 <span className="text-base text-slate-500 font-sans ml-2">em potencial produtivo perdido</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <div className="text-center text-slate-600 max-w-xs">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aceite seu destino, mas não seja escravo do seu passado. Preencha os dados.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SunkCostSolver;
