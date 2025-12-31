
import React, { useState, useEffect } from 'react';
import { CalculatedTHL, DelegationItem, AppView, LifeContext, YearlyCompassData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Sector } from 'recharts';
import { Sparkles, ArrowRightLeft, ArrowRight, Infinity, Flag, Activity, Moon, Briefcase, Car, Coffee, Dumbbell, Brain, Clock, Crown } from 'lucide-react';
import { getTimeWisdom } from '../services/geminiService';

interface Props {
  thl: CalculatedTHL;
  delegations: DelegationItem[];
  lifeContext: LifeContext | null;
  yearCompass?: YearlyCompassData;
  onViewChange?: (view: AppView) => void;
}

const Dashboard: React.FC<Props> = ({ thl, delegations, lifeContext, yearCompass, onViewChange }) => {
  const totalHoursBought = delegations.reduce((acc, curr) => acc + curr.hoursSaved, 0);
  const totalCost = delegations.reduce((acc, curr) => acc + curr.cost, 0);
  const potentialValueGenerated = totalHoursBought * thl.realTHL;
  const netProfit = potentialValueGenerated - totalCost;
  
  const [quote, setQuote] = useState<string>("");
  const [convertPrice, setConvertPrice] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  useEffect(() => {
    getTimeWisdom()
      .then(setQuote)
      .catch(() => setQuote("Amor Fati."));
  }, []);

  const chartData = [
    { name: 'Custo', value: totalCost, color: '#ef4444' },
    { name: 'Retorno', value: potentialValueGenerated, color: '#10b981' },
  ];

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

  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(0) : 0;
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

  // --- ZERO STATE (WELCOME) ---
  if (thl.realTHL === 0) {
    return (
      <div className="relative min-h-[85vh] overflow-hidden flex items-end justify-start p-8 md:p-16 animate-fade-in border border-slate-800 bg-black">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://i.postimg.cc/C1NN6wt7/Gemini-Generated-Image-pwcfvpwcfvpwcfvp.png" 
             alt="Zeus" 
             className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl space-y-6">
           <div className="inline-block bg-emerald-500 text-black px-4 py-1 font-bold text-xs uppercase tracking-[0.3em]">
              Sistema Operacional v6.0
           </div>
           
           <div>
             <h1 className="text-8xl md:text-9xl font-serif text-white tracking-tighter leading-[0.85] mb-2 mix-blend-difference">
                ZEUS
             </h1>
             <p className="text-2xl md:text-3xl text-slate-400 font-light border-l-2 border-emerald-500 pl-6 py-2">
                O tempo é o único ativo não renovável.<br/>
                <span className="text-white font-medium">Pare de desperdiçá-lo.</span>
             </p>
           </div>
           
           <button 
              onClick={() => onViewChange && onViewChange(AppView.THL_CALCULATOR)}
              className="group flex items-center gap-6 bg-white hover:bg-emerald-500 text-black px-12 py-6 font-bold text-xl tracking-widest transition-all duration-300 mt-8 border border-white hover:border-emerald-500"
           >
              INICIAR PROTOCOLO
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="space-y-6 animate-fade-in pb-12 bg-[#020617] min-h-screen">
       
       {/* BRUTAL HERO BANNER */}
       <div className="relative w-full h-[400px] border-y border-slate-800 overflow-hidden group">
          <div className="absolute inset-0 z-0">
             <img 
               src="https://i.postimg.cc/C1NN6wt7/Gemini-Generated-Image-pwcfvpwcfvpwcfvp.png" 
               alt="Zeus Banner" 
               className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
               style={{ objectPosition: '50% 30%' }}
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto">
             
             <h1 className="text-6xl md:text-8xl font-serif text-white leading-none tracking-tight mb-8">
                COMANDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-slate-500">CENTRAL</span>
             </h1>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-800 pt-8">
                <div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Valor da Hora (THL)</div>
                   <div className="text-4xl font-mono text-white font-bold tracking-tighter flex items-start gap-1">
                      <span className="text-lg text-emerald-500 mt-1">R$</span>
                      {thl.realTHL.toFixed(2)}
                   </div>
                </div>

                <div className="md:border-l md:border-slate-800 md:pl-8">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Renda Mensal Est.</div>
                   <div className="text-3xl font-mono text-slate-300">
                      R$ {(thl.realTHL * thl.monthlyTotalHours).toLocaleString()}
                   </div>
                </div>

                <div className="md:border-l md:border-slate-800 md:pl-8 flex items-center">
                    <div className="text-sm text-slate-400 italic">
                       "{quote || 'Amor Fati.'}"
                    </div>
                </div>
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: 24H PIE CHART */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 flex flex-col h-[450px]">
             <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Autópsia (24h)
               </h3>
             </div>
             
             <div className="flex-1 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart onMouseLeave={onPieLeave}>
                    <Pie
                      activeIndex={activeIndex !== null ? activeIndex : undefined}
                      activeShape={renderActiveShape}
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      stroke="none"
                    >
                      {timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '0px', color: '#fff' }}
                       itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    />
                 </PieChart>
               </ResponsiveContainer>
               
               {/* Center Text */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-4xl font-serif font-bold text-white">24</div>
                  <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Horas</div>
               </div>
             </div>

             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center text-[10px] uppercase tracking-widest text-slate-500">
                {timeData.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2 h-2" style={{ backgroundColor: item.color }}></div>
                      <span className={activeIndex === idx ? 'text-white font-bold' : ''}>{item.name}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* MIDDLE: METRICS GRID */}
          <div className="lg:col-span-2 grid grid-rows-2 gap-6">
             {/* ROW 1 */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Meta Financeira */}
                <div 
                   className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors group"
                   onClick={() => onViewChange && onViewChange(AppView.YEARLY_GOALS)}
                >
                   <div className="flex justify-between items-start">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Objetivo Norte</span>
                      <Flag className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                   </div>
                   
                   <div className="mt-4">
                      <div className="flex items-end gap-2 mb-2">
                         <div className="text-4xl font-mono text-white">{Math.min(goalProgress, 100).toFixed(0)}<span className="text-lg">%</span></div>
                      </div>
                      <div className="w-full bg-slate-800 h-1">
                         <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                      </div>
                   </div>
                   <div className="text-xs text-slate-500 mt-4 font-mono">
                      Meta: R$ {financialGoal.toLocaleString()} / mês
                   </div>
                </div>

                {/* Eterno Retorno */}
                <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between group hover:border-purple-500/50 transition-colors">
                   <div className="flex justify-between items-start">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Eterno Retorno</span>
                      <Infinity className="w-5 h-5 text-purple-500 group-hover:rotate-180 transition-transform duration-700" />
                   </div>
                   
                   <div className="mt-4 flex items-baseline gap-2">
                      <div className={`text-4xl font-mono ${eternalScore > 70 ? 'text-white' : 'text-slate-400'}`}>
                         {eternalScore}
                      </div>
                      <span className="text-sm text-slate-600">/ 100</span>
                   </div>
                   <div className="text-xs text-slate-500 mt-4 truncate">
                      Índice de satisfação existencial
                   </div>
                </div>
             </div>

             {/* ROW 2: Reality Converter */}
             <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-900/10 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-6 z-10">
                   <div className="bg-indigo-500 text-black p-1">
                      <ArrowRightLeft className="w-4 h-4" />
                   </div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Conversor de Realidade</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-end z-10">
                   <div className="flex-1 w-full">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">Preço do Item (R$)</label>
                      <input 
                         type="number" 
                         value={convertPrice}
                         onChange={(e) => setConvertPrice(e.target.value)}
                         placeholder="Digite o valor..."
                         className="w-full bg-black border border-slate-700 p-4 text-white focus:border-indigo-500 outline-none font-mono text-lg"
                      />
                   </div>
                   <div className="flex-1 bg-slate-800/30 p-4 border-l-2 border-indigo-500">
                      <div className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">Custo em Vida</div>
                      <div className="text-3xl font-serif text-white">
                         {hoursCost.toFixed(1)} <span className="text-sm font-sans text-slate-500">horas</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* ROI CHART SECTION */}
       <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          <div className="bg-slate-900 border border-slate-800 p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-500" /> Eficiência de Delegação
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Comparativo direto entre custo financeiro e valor de vida gerado.</p>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">ROI Calculado</div>
                    <div className={`text-2xl font-mono font-bold ${Number(roi) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                       {Number(roi) > 0 ? '+' : ''}{roi}%
                    </div>
                 </div>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={100} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                         cursor={{fill: 'rgba(255,255,255,0.05)'}}
                         contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', borderRadius: '0px' }}
                         formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                      />
                      <Bar dataKey="value" barSize={40}>
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
