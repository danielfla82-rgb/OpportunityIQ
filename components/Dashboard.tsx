
import React, { useState, useEffect } from 'react';
import { CalculatedTHL, DelegationItem, AppView, LifeContext, YearlyCompassData, ContextAnalysisResult } from '../types';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, ScatterChart, Scatter, XAxis, YAxis, ZAxis, ReferenceLine } from 'recharts';
import { Sparkles, ArrowRightLeft, ArrowRight, Infinity, Flag, Activity, Moon, Briefcase, Car, Coffee, Dumbbell, Brain, Clock, Crown, Target, CheckCircle2, Mountain, Rocket, Eye, BarChart2 } from 'lucide-react';
import { getTimeWisdom, getDashboardAlignmentAnalysis } from '../services/geminiService';

interface Props {
  thl: CalculatedTHL;
  delegations: DelegationItem[];
  lifeContext: LifeContext | null;
  yearCompass?: YearlyCompassData;
  analysisResult?: ContextAnalysisResult | null;
  onViewChange?: (view: AppView) => void;
}

const Dashboard: React.FC<Props> = ({ thl, delegations, lifeContext, yearCompass, analysisResult, onViewChange }) => {
  const [quote, setQuote] = useState<string>("");
  const [convertPrice, setConvertPrice] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [alignmentAnalysis, setAlignmentAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  
  useEffect(() => {
    getTimeWisdom()
      .then(setQuote)
      .catch(() => setQuote("Amor Fati."));
  }, []);

  // --- TIME DISTRIBUTION LOGIC ---
  const dailySleep = lifeContext?.sleepHours || 7.5;
  const dailyPhysical = (lifeContext?.physicalActivityMinutes || 0) / 60;
  const dailyStudy = (lifeContext?.studyMinutes || 0) / 60;
  const dailyWork = thl.monthlyTotalHours > 0 ? (thl.monthlyTotalHours - thl.monthlyCommuteHours) / 30 : 5.7; 
  const dailyCommute = thl.monthlyTotalHours > 0 ? thl.monthlyCommuteHours / 30 : 0.7; 
  const committedTime = dailySleep + dailyWork + dailyCommute + dailyPhysical + dailyStudy;
  const dailyFreeTime = Math.max(0, 24 - committedTime);

  const timeData = [
    { name: 'Sono', value: dailySleep, color: '#6366f1', icon: Moon },
    { name: 'Trabalho', value: dailyWork, color: '#f59e0b', icon: Briefcase },
    { name: 'Trânsito', value: dailyCommute, color: '#ef4444', icon: Car },
    { name: 'Bio/Treino', value: dailyPhysical, color: '#10b981', icon: Dumbbell },
    { name: 'Estudo', value: dailyStudy, color: '#d946ef', icon: Brain },
    { name: 'Soberania', value: dailyFreeTime, color: '#06b6d4', icon: Coffee },
  ].filter(item => item.value > 0); 

  useEffect(() => {
    if (yearCompass && timeData.length > 0) {
       setLoadingAnalysis(true);
       getDashboardAlignmentAnalysis(timeData, yearCompass)
         .then(setAlignmentAnalysis)
         .catch(() => setAlignmentAnalysis("O foco determina a realidade."))
         .finally(() => setLoadingAnalysis(false));
    }
  }, [lifeContext, yearCompass, thl.realTHL]); 

  const price = parseFloat(convertPrice) || 0;
  const hoursCost = thl.realTHL > 0 ? price / thl.realTHL : 0;

  const eternalScore = lifeContext?.eternalReturnScore ?? 0;
  const financialGoal = yearCompass?.financialGoal?.targetMonthlyIncome || 0;
  const currentIncome = thl.realTHL * thl.monthlyTotalHours; 
  const goalProgress = financialGoal > 0 ? (currentIncome / financialGoal) * 100 : 0;

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 10} outerRadius={outerRadius + 12} fill={fill} opacity={0.3} />
      </g>
    );
  };

  const goalIcons = [Mountain, Rocket, Crown];

  // --- WELCOME MODE (New User) ---
  if (thl.realTHL === 0 && !forceShow) {
    return (
      <div className="relative min-h-[90vh] overflow-hidden flex items-center justify-center p-8 border border-slate-800 bg-black">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://i.postimg.cc/C1NN6wt7/Gemini-Generated-Image-pwcfvpwcfvpwcfvp.png" 
             alt="Zeus" 
             className="w-full h-full object-cover opacity-30 grayscale"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl text-center space-y-8 animate-fade-in-up">
           <h1 className="text-6xl md:text-8xl font-serif text-white tracking-tighter leading-none mix-blend-overlay">
              ZEUS
           </h1>
           <p className="text-xl md:text-2xl text-slate-400 font-light border-l-2 border-emerald-500 pl-6 py-2 text-left mx-auto max-w-lg">
              Você ainda não calculou o valor da sua vida.<br/>
              <span className="text-white font-medium">O protocolo começa agora.</span>
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button 
                 onClick={() => onViewChange && onViewChange(AppView.THL_CALCULATOR)}
                 className="group flex items-center gap-4 bg-white hover:bg-emerald-400 hover:text-black hover:border-emerald-400 text-black px-10 py-5 font-bold text-lg tracking-widest transition-all duration-300 border border-white"
              >
                 INICIAR PROTOCOLO
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>

              <button 
                 onClick={() => setForceShow(true)}
                 className="group flex items-center gap-2 bg-transparent hover:bg-white/5 text-slate-500 hover:text-white px-8 py-5 font-medium text-xs tracking-widest transition-all duration-300 uppercase"
              >
                 <Eye className="w-4 h-4" />
                 Apenas Visualizar
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  // Matrix Coordinates Logic
  const coords = analysisResult?.matrixCoordinates || { x: 50, y: 50, quadrantLabel: 'Em Análise' };
  const matrixData = [{ x: coords.x, y: coords.y, z: 100 }];

  return (
    <div className="space-y-8 animate-fade-in pb-16 bg-[#020617] min-h-screen">
       
       {/* HEADER: COMANDO CENTRAL */}
       <header className="px-6 md:px-12 pt-8 pb-4 flex flex-col md:flex-row justify-between items-end border-b border-slate-800/50">
          <div>
             <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight flex items-center gap-3">
                COMANDO <span className="text-emerald-500">CENTRAL</span>
             </h1>
             <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Operacional
             </p>
          </div>
          <div className="text-right mt-4 md:mt-0">
             <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Valor da Hora (THL)</div>
             <div className="text-3xl font-mono text-white font-bold flex items-center justify-end gap-1">
                <span className="text-sm text-emerald-500">R$</span> {thl.realTHL.toFixed(2)}
             </div>
          </div>
       </header>

       {/* SECTION 1: GOALS (PRIORITY) */}
       <div className="px-4 md:px-12">
          <div className="flex justify-between items-end mb-4">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Progresso Estratégico (Grandes Pedras)
             </h3>
             <button 
                onClick={() => onViewChange && onViewChange(AppView.YEARLY_GOALS)}
                className="text-[10px] bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-white px-3 py-1.5 rounded transition-colors"
             >
                EDITAR METAS
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[1, 2, 3].map((num) => {
                const key = `goal${num}` as keyof YearlyCompassData;
                const goal = yearCompass ? (yearCompass as any)[key] : { text: "", completed: false, indicator: "" };
                const GoalIcon = goalIcons[num - 1];
                
                return (
                   <div key={num} className={`relative p-6 rounded-xl border transition-all duration-300 group overflow-hidden ${goal.completed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}>
                      {goal.completed && <div className="absolute top-0 right-0 p-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>}
                      
                      <div className="flex flex-col h-full justify-between gap-4">
                         <div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                               <GoalIcon className={`w-3 h-3 ${goal.completed ? 'text-emerald-500' : 'text-slate-600'}`} />
                               Pedra #{num}
                            </div>
                            <p className={`text-sm font-medium leading-relaxed ${goal.completed ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'}`}>
                               {goal.text || "Definir meta na Bússola"}
                            </p>
                         </div>
                         
                         {goal.indicator && (
                            <div className="pt-3 border-t border-white/5">
                               <div className="text-[10px] text-slate-500 uppercase mb-1">KPI</div>
                               <div className="text-xs text-indigo-300 font-mono">{goal.indicator}</div>
                            </div>
                         )}
                      </div>
                   </div>
                );
             })}
          </div>
       </div>

       {/* SECTION 2: ANALYTICS GRID */}
       <div className="px-4 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: POWER MATRIX WIDGET */}
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden">
             <div className="flex justify-between items-center mb-4 z-10">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" /> Matriz de Potência
               </h3>
               {analysisResult ? (
                  <span className="text-[10px] text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                     {coords.x.toFixed(0)} | {coords.y.toFixed(0)}
                  </span>
               ) : (
                  <span className="text-[10px] text-amber-500 flex items-center gap-1">
                     <Clock className="w-3 h-3" /> Pendente
                  </span>
               )}
             </div>

             {analysisResult ? (
                <div className="flex-1 relative min-h-[250px] bg-black/20 rounded-lg border border-slate-800/50 mb-4">
                   {/* Labels Overlays */}
                   <div className="absolute top-2 left-2 text-[8px] text-amber-500/70 font-bold uppercase tracking-wider z-10 pointer-events-none">Camelo</div>
                   <div className="absolute top-2 right-2 text-[8px] text-emerald-500/70 font-bold uppercase tracking-wider z-10 text-right pointer-events-none">Übermensch</div>
                   <div className="absolute bottom-2 left-2 text-[8px] text-slate-600 font-bold uppercase tracking-wider z-10 pointer-events-none">Último Homem</div>
                   <div className="absolute bottom-2 right-2 text-[8px] text-slate-600 font-bold uppercase tracking-wider z-10 text-right pointer-events-none">Viajante</div>

                   <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                         <XAxis type="number" dataKey="x" domain={[-10, 110]} hide />
                         <YAxis type="number" dataKey="y" domain={[-10, 110]} hide />
                         <ZAxis range={[100, 100]} />
                         <ReferenceLine x={50} stroke="#334155" strokeDasharray="3 3" />
                         <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                         <Scatter data={matrixData} fill="#10b981">
                            <Cell fill="#10b981" />
                         </Scatter>
                      </ScatterChart>
                   </ResponsiveContainer>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-lg mb-4">
                   <p className="text-xs text-slate-500 mb-4">Execute o diagnóstico para ver sua posição.</p>
                   <button 
                      onClick={() => onViewChange && onViewChange(AppView.LIFE_CONTEXT)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded transition-colors"
                   >
                      Mapear Contexto
                   </button>
                </div>
             )}

             <div className="mt-auto">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Arquétipo Atual</div>
                <div className="text-lg font-serif text-white">
                   {analysisResult?.matrixCoordinates?.quadrantLabel || "Não Identificado"}
                </div>
             </div>
          </div>

          {/* MIDDLE: TIME AUTOPSY */}
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col">
             <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Autópsia (24h)
               </h3>
             </div>
             
             <div className="h-[200px] relative shrink-0 my-4">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart onMouseLeave={onPieLeave}>
                    <Pie
                      activeIndex={activeIndex !== null ? activeIndex : undefined}
                      activeShape={renderActiveShape}
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      stroke="none"
                    >
                      {timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-xl font-serif font-bold text-white">24</div>
                  <div className="text-[8px] uppercase tracking-widest text-emerald-500 font-bold">Horas</div>
               </div>
             </div>

             <div className="flex flex-wrap gap-2 justify-center mb-4">
                {timeData.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className={`text-[9px] uppercase tracking-wider ${activeIndex === idx ? 'text-white' : 'text-slate-500'}`}>{item.name}</span>
                   </div>
                ))}
             </div>

             <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-auto">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                   <Target className="w-3 h-3" /> Análise IA
                </h4>
                {loadingAnalysis ? (
                   <div className="flex items-center gap-2 text-slate-600 text-xs animate-pulse">
                      <Sparkles className="w-3 h-3" /> Processando...
                   </div>
                ) : (
                   <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-3">
                      "{alignmentAnalysis || "Sem dados suficientes."}"
                   </p>
                )}
             </div>
          </div>

          {/* RIGHT: FINANCIAL & UTILS */}
          <div className="lg:col-span-1 grid grid-rows-2 gap-6">
             {/* Financial Goal */}
             <div 
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between cursor-pointer hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                onClick={() => onViewChange && onViewChange(AppView.YEARLY_GOALS)}
             >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Flag className="w-24 h-24 text-emerald-500" />
                </div>
                
                <div className="flex justify-between items-start z-10">
                   <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Objetivo Norte</span>
                </div>
                
                <div className="z-10">
                   <div className="flex items-baseline gap-1 mb-2">
                      <div className="text-4xl font-mono text-white font-bold">{Math.min(goalProgress, 100).toFixed(0)}</div>
                      <span className="text-lg text-emerald-500">%</span>
                   </div>
                   <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                   </div>
                   <div className="text-[10px] text-slate-500 mt-2 font-mono flex justify-between">
                      <span>Atual: R$ {(thl.realTHL * thl.monthlyTotalHours).toLocaleString()}</span>
                      <span>Meta: R$ {financialGoal.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             {/* Reality Converter */}
             <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 z-10">
                   <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Conversor de Realidade</h3>
                </div>

                <div className="flex flex-col gap-3 z-10">
                   <div>
                      <input 
                         type="number" 
                         value={convertPrice}
                         onChange={(e) => setConvertPrice(e.target.value)}
                         placeholder="Preço (R$)..."
                         className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono text-sm"
                      />
                   </div>
                   <div className="flex items-center gap-2 bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20">
                      <span className="text-2xl font-serif text-white">
                         {hoursCost.toFixed(1)} 
                      </span>
                      <span className="text-xs text-indigo-300 uppercase tracking-wide mt-1">Horas de Vida</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
