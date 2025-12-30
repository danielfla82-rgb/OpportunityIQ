
import React, { useState } from 'react';
import { SunkCostScenario, CalculatedTHL } from '../types';
import { Brain, AlertOctagon, RefreshCcw, Heart, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
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
    <div className="animate-fade-in h-full flex flex-col">
       <div className="mb-6">
          <h2 className="text-2xl font-serif text-slate-100 mb-2">Amor Fati: Solucionador de Custos</h2>
          <p className="text-slate-400 text-sm">
            "Não queira nada diferente do que é, nem no futuro, nem no passado, nem por toda a eternidade." — Nietzsche.
          </p>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section (Left) */}
        <div className="lg:col-span-4 space-y-6">
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
              <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Passado (Já perdido)</label>
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
              <label className="block text-xs text-indigo-400 uppercase tracking-wide mb-2">Futuro Estimado (Para concluir)</label>
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
              <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">O Dilema (Seja Honesto)</label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 h-24 focus:border-indigo-500 outline-none"
                placeholder="Por que é difícil largar? O que você sente que vai perder?"
                value={scenario.description || ''}
                onChange={e => setScenario({...scenario, description: e.target.value})}
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? <RefreshCcw className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
              {loading ? "Filosofando..." : "Consultar Oráculo"}
            </button>
          </div>
        </div>

        {/* Output Section (Middle/Right) */}
        <div className="lg:col-span-5 flex flex-col">
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
                <p>Preencha os dados à esquerda para libertar sua Vontade de Potência.</p>
              </div>
            </div>
          )}
        </div>

        {/* Educational Sidebar (Right) */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-indigo-300">
                 <BookOpen className="w-4 h-4" />
                 <h3 className="font-bold text-sm uppercase tracking-wider">O Manual do Estoico</h3>
              </div>
              <div className="space-y-4 text-sm text-slate-400">
                 <div>
                    <strong className="text-slate-200 block mb-1">O que é a Falácia?</strong>
                    É a tendência irracional de continuar em algo só porque você já investiu muito (tempo/dinheiro), mesmo que o futuro pareça ruim.
                 </div>
                 <div>
                    <strong className="text-slate-200 block mb-1">Passado vs. Futuro</strong>
                    O dinheiro investido já se foi. O tempo gasto não volta. A única coisa que importa para a decisão racional é: <em className="text-indigo-400">"Quanto MAIS isso vai me custar?"</em>
                 </div>
                 <div>
                    <strong className="text-slate-200 block mb-1">Como preencher?</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                       <li>Seja brutal com os números futuros.</li>
                       <li>No "Dilema", explique o apego emocional (orgulho, medo de falhar).</li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                 <AlertCircle className="w-4 h-4" />
                 <h3 className="font-bold text-sm uppercase tracking-wider">Exemplo</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                 "Gastei 4 anos numa faculdade que odeio. Faltam 2 anos. Se eu sair agora, 'joguei fora' 4 anos?"
                 <br/><br/>
                 <span className="text-indigo-400 not-italic font-bold flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Resposta: Não.
                 </span>
                 Você comprou 4 anos de aprendizado sobre o que NÃO quer. Ficar mais 2 anos é pagar para sofrer mais.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SunkCostSolver;
