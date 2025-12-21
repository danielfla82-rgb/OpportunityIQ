import React, { useState } from 'react';
import { RazorAnalysis, PreMortemResult, TimeTravelResult } from '../types';
import { getPhilosophicalAnalysis, getPreMortemAnalysis, getFutureSimulations } from '../services/geminiService';
import { Sparkles, Scissors, EyeOff, Hourglass, Lightbulb, Scale, Skull, ArrowRightLeft, BookOpen, ShieldAlert } from 'lucide-react';

type Tab = 'ORACLE' | 'PREMORTEM' | 'TIMETRAVEL';

const MentalRazors: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ORACLE');
  const [loading, setLoading] = useState(false);

  // Oracle State
  const [dilemma, setDilemma] = useState("");
  const [oracleResult, setOracleResult] = useState<RazorAnalysis | null>(null);

  // PreMortem State
  const [goal, setGoal] = useState("");
  const [preMortemResult, setPreMortemResult] = useState<PreMortemResult | null>(null);

  // TimeTravel State
  const [pathA, setPathA] = useState("");
  const [pathB, setPathB] = useState("");
  const [timeResult, setTimeResult] = useState<TimeTravelResult | null>(null);

  const handleOracle = async () => {
    if (!dilemma.trim()) return;
    setLoading(true);
    const result = await getPhilosophicalAnalysis(dilemma);
    setOracleResult(result);
    setLoading(false);
  };

  const handlePreMortem = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    const result = await getPreMortemAnalysis(goal);
    setPreMortemResult(result);
    setLoading(false);
  };

  const handleTimeTravel = async () => {
    if (!pathA.trim() || !pathB.trim()) return;
    setLoading(true);
    const result = await getFutureSimulations(pathA, pathB);
    setTimeResult(result);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
          <Scale className="w-6 h-6 text-purple-400" />
          O Oráculo das Navalhas
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Ferramentas filosóficas para cortar a complexidade e revelar a verdade.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('ORACLE')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'ORACLE' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Scissors className="w-4 h-4" /> O Triunvirato
        </button>
        <button
          onClick={() => setActiveTab('PREMORTEM')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'PREMORTEM' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <EyeOff className="w-4 h-4" /> Via Negativa (Pre-Mortem)
        </button>
        <button
          onClick={() => setActiveTab('TIMETRAVEL')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'TIMETRAVEL' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Hourglass className="w-4 h-4" /> Minimização de Arrependimento
        </button>
      </div>

      <div className="flex-1">
        {/* TAB 1: ORACLE (Original) */}
        {activeTab === 'ORACLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col">
                <label className="block text-xs text-slate-500 uppercase tracking-widest mb-3">Qual é o seu dilema difícil?</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 h-48 focus:ring-1 focus:ring-purple-500 outline-none resize-none mb-4"
                  placeholder="Ex: Devo aceitar a proposta de emprego que paga mais mas é presencial? Ou continuo no remoto ganhando menos?"
                  value={dilemma}
                  onChange={(e) => setDilemma(e.target.value)}
                />
                <button 
                  onClick={handleOracle}
                  disabled={loading || !dilemma.trim()}
                  className="w-full bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-700 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Sparkles className="animate-spin w-5 h-5" /> : <Scissors className="w-5 h-5" />}
                  {loading ? "Afíando as Navalhas..." : "Cortar a Complexidade"}
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-5 overflow-y-auto pr-1">
              {!oracleResult && !loading && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center min-h-[300px]">
                  <Scissors className="w-16 h-16 text-slate-700 mb-4 opacity-50" />
                  <p className="text-slate-500 max-w-xs">Análise rápida sob 3 lentes: Simplicidade, Inversão e Longo Prazo.</p>
                </div>
              )}
              {oracleResult && (
                <>
                  <div className="bg-slate-900 border-l-4 border-emerald-500 p-6 rounded-r-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-serif text-white">A Navalha de Occam</h3>
                    </div>
                    <p className="text-slate-300 text-sm">{oracleResult.occam}</p>
                  </div>
                  <div className="bg-slate-900 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <EyeOff className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-serif text-white">Via Negativa</h3>
                    </div>
                    <p className="text-slate-300 text-sm">{oracleResult.inversion}</p>
                  </div>
                  <div className="bg-slate-900 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Hourglass className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-serif text-white">Minimização de Arrependimento</h3>
                    </div>
                    <p className="text-slate-300 text-sm">{oracleResult.regret}</p>
                  </div>
                  <div className="mt-6 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 p-6 rounded-xl text-center">
                    <h3 className="text-sm uppercase tracking-widest text-purple-300 mb-2 font-bold">Veredito Sintético</h3>
                    <p className="text-xl font-serif text-white italic">"{oracleResult.synthesis}"</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRE-MORTEM */}
        {activeTab === 'PREMORTEM' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col">
                 <div className="mb-4">
                    <h3 className="text-amber-400 font-serif text-lg mb-1">A Inversão Estoica</h3>
                    <p className="text-xs text-slate-400">Em vez de tentar ser inteligente, evite ser estúpido. O que vai destruir seu plano?</p>
                 </div>
                <label className="block text-xs text-slate-500 uppercase tracking-widest mb-3">Qual é o seu Grande Plano?</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 h-48 focus:ring-1 focus:ring-amber-500 outline-none resize-none mb-4"
                  placeholder="Ex: Lançar minha startup de SaaS no próximo mês e ficar rico."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
                <button 
                  onClick={handlePreMortem}
                  disabled={loading || !goal.trim()}
                  className="w-full bg-amber-900/40 hover:bg-amber-900/60 text-amber-100 border border-amber-700/50 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Skull className="animate-spin w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  {loading ? "Simulando o Desastre..." : "Realizar Autópsia do Futuro"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6 overflow-y-auto">
              {!preMortemResult && !loading && (
                 <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center min-h-[300px]">
                    <Skull className="w-16 h-16 text-slate-700 mb-4 opacity-50" />
                    <p className="text-slate-500 max-w-xs">Imagine que já deu errado. Por que falhou?</p>
                 </div>
              )}
              {preMortemResult && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-xl text-center">
                    <div className="text-xs text-red-400 uppercase tracking-widest mb-1">Data do Óbito</div>
                    <div className="text-2xl font-serif text-white mb-2">{preMortemResult.deathDate}</div>
                    <div className="text-red-200 italic">"{preMortemResult.causeOfDeath}"</div>
                  </div>

                  <div className="space-y-4">
                     {preMortemResult.autopsyReport.map((item, idx) => (
                       <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex gap-4">
                          <div className="text-2xl font-serif text-slate-600">0{idx+1}</div>
                          <div>
                             <h4 className="text-white font-medium mb-1">Causa da Morte: <span className="text-red-400">{item.cause}</span></h4>
                             <div className="flex items-center gap-2 text-sm text-emerald-400 mt-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>Antídoto: {item.prevention}</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TIME TRAVEL */}
        {activeTab === 'TIMETRAVEL' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col">
                 <div className="mb-4">
                    <h3 className="text-blue-400 font-serif text-lg mb-1">O Leito de Morte</h3>
                    <p className="text-xs text-slate-400">Projete-se aos 80 anos. Qual escolha causará menos dor na alma?</p>
                 </div>
                 
                 <div className="space-y-4 mb-4">
                   <div>
                     <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Caminho A</label>
                     <input 
                       className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 outline-none focus:border-blue-500"
                       placeholder="Ex: Pedir demissão e viajar o mundo"
                       value={pathA}
                       onChange={e => setPathA(e.target.value)}
                     />
                   </div>
                   <div className="flex justify-center">
                      <ArrowRightLeft className="w-4 h-4 text-slate-600 rotate-90" />
                   </div>
                   <div>
                     <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Caminho B</label>
                     <input 
                       className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 outline-none focus:border-blue-500"
                       placeholder="Ex: Ficar no emprego seguro e ser promovido"
                       value={pathB}
                       onChange={e => setPathB(e.target.value)}
                     />
                   </div>
                 </div>

                <button 
                  onClick={handleTimeTravel}
                  disabled={loading || !pathA.trim() || !pathB.trim()}
                  className="w-full bg-blue-900/40 hover:bg-blue-900/60 text-blue-100 border border-blue-700/50 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Hourglass className="animate-spin w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  {loading ? "Viajando no Tempo..." : "Ler Memórias Futuras"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6 overflow-y-auto">
              {!timeResult && !loading && (
                 <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center min-h-[300px]">
                    <Hourglass className="w-16 h-16 text-slate-700 mb-4 opacity-50" />
                    <p className="text-slate-500 max-w-xs">Veja suas decisões através dos olhos do seu eu idoso.</p>
                 </div>
              )}

              {timeResult && (
                <div className="animate-fade-in grid grid-cols-1 gap-6">
                   <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                      <h4 className="text-xs text-blue-400 uppercase tracking-widest mb-2">Memória do Caminho A</h4>
                      <h3 className="text-xl font-serif text-white mb-4">{timeResult.pathA.title}</h3>
                      <p className="text-slate-300 italic font-serif leading-relaxed text-sm">"{timeResult.pathA.memoir}"</p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                         <span className="text-xs text-slate-500">Nível de Arrependimento</span>
                         <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => (
                               <div key={i} className={`w-2 h-2 rounded-full ${i < timeResult.pathA.regretLevel ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                      <h4 className="text-xs text-blue-400 uppercase tracking-widest mb-2">Memória do Caminho B</h4>
                      <h3 className="text-xl font-serif text-white mb-4">{timeResult.pathB.title}</h3>
                      <p className="text-slate-300 italic font-serif leading-relaxed text-sm">"{timeResult.pathB.memoir}"</p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                         <span className="text-xs text-slate-500">Nível de Arrependimento</span>
                         <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => (
                               <div key={i} className={`w-2 h-2 rounded-full ${i < timeResult.pathB.regretLevel ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 p-6 rounded-xl text-center">
                     <h3 className="text-sm uppercase tracking-widest text-blue-300 mb-2 font-bold">Conselho do seu Eu de 80 Anos</h3>
                     <p className="text-lg font-serif text-white">{timeResult.synthesis}</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalRazors;