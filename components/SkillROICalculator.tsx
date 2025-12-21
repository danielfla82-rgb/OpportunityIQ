import React, { useState } from 'react';
import { CalculatedTHL, SkillAnalysis } from '../types';
import { getSkillAnalysis } from '../services/geminiService';
import { TrendingUp, GraduationCap, Clock, DollarSign, ArrowRight, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface Props {
  thl: CalculatedTHL;
}

const SkillROICalculator: React.FC<Props> = ({ thl }) => {
  const [skillName, setSkillName] = useState("");
  const [courseCost, setCourseCost] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [estimatedIncrease, setEstimatedIncrease] = useState("10"); // percent
  
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateROI = () => {
    const costMoney = parseFloat(courseCost) || 0;
    const hours = parseFloat(studyHours) || 0;
    const increasePct = parseFloat(estimatedIncrease) || 0;

    // Investment Basis
    const opportunityCost = hours * thl.realTHL;
    const totalInvestment = costMoney + opportunityCost;

    // Gains
    const currentAnnualEarnings = thl.realTHL * thl.monthlyTotalHours * 12; // Approximation
    const newTHL = thl.realTHL * (1 + (increasePct / 100));
    const newAnnualEarnings = newTHL * thl.monthlyTotalHours * 12;
    const annualDelta = newAnnualEarnings - currentAnnualEarnings;
    
    const monthsToBreakEven = annualDelta > 0 ? (totalInvestment / (annualDelta / 12)) : 0;
    
    // Projection Data (5 years)
    const data = [];
    for (let i = 1; i <= 5; i++) {
        data.push({
            year: `Ano ${i}`,
            linear: currentAnnualEarnings * i,
            leveraged: (newAnnualEarnings * i) - totalInvestment
        });
    }

    return { totalInvestment, opportunityCost, newTHL, annualDelta, monthsToBreakEven, data };
  };

  const handleAnalyze = async () => {
    if (!skillName) return;
    setLoading(true);
    const result = await getSkillAnalysis(skillName, thl.realTHL, parseFloat(estimatedIncrease));
    setAnalysis(result);
    setLoading(false);
  };

  const stats = calculateROI();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Simulador de Alavancagem
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Educação é alavancagem. Calcule o retorno composto de aprender uma nova habilidade.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
           <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Habilidade Alvo</label>
                <input 
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                   placeholder="Ex: Python, Inglês, Negociação"
                   value={skillName}
                   onChange={e => setSkillName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Custo (Dinheiro)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 w-3 h-3 text-slate-600" />
                        <input 
                           type="number"
                           className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-7 text-slate-200"
                           value={courseCost}
                           onChange={e => setCourseCost(e.target.value)}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Horas Estudo</label>
                    <div className="relative">
                        <Clock className="absolute left-2 top-2.5 w-3 h-3 text-slate-600" />
                        <input 
                           type="number"
                           className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-7 text-slate-200"
                           value={studyHours}
                           onChange={e => setStudyHours(e.target.value)}
                        />
                    </div>
                 </div>
              </div>
              <div>
                 <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Aumento Estimado (%)</label>
                 <input 
                    type="range"
                    min="1" max="100"
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    value={estimatedIncrease}
                    onChange={e => setEstimatedIncrease(e.target.value)}
                 />
                 <div className="text-right text-emerald-400 font-mono text-sm mt-1">+{estimatedIncrease}% na THL</div>
              </div>

              <button 
                 onClick={handleAnalyze}
                 disabled={loading || !skillName}
                 className="w-full bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-700 text-emerald-100 font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
               >
                 {loading ? <Brain className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4" />}
                 {loading ? "Validando..." : "Validar com IA"}
               </button>
           </div>

           {analysis && (
             <div className={`p-4 rounded-xl border ${analysis.isRealistic ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                   {analysis.isRealistic ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingUp className="w-4 h-4 text-amber-400" />}
                   Análise de Mercado
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{analysis.commentary}</p>
                <p className="text-xs text-slate-400 italic">"{analysis.marketRealityCheck}"</p>
             </div>
           )}
        </div>

        {/* Stats & Chart */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                 <div className="text-xs text-slate-500">Investimento Total</div>
                 <div className="text-lg font-mono text-white">R$ {stats.totalInvestment.toFixed(0)}</div>
                 <div className="text-[10px] text-slate-600">Inclui custo de oportunidade</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                 <div className="text-xs text-slate-500">Nova THL</div>
                 <div className="text-lg font-mono text-emerald-400">R$ {stats.newTHL.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                 <div className="text-xs text-slate-500">Ganho Anual Extra</div>
                 <div className="text-lg font-mono text-emerald-400">+R$ {stats.annualDelta.toFixed(0)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                 <div className="text-xs text-slate-500">Break-even</div>
                 <div className="text-lg font-mono text-white">{stats.monthsToBreakEven.toFixed(1)} <span className="text-xs text-slate-500">meses</span></div>
              </div>
           </div>

           <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 h-80">
              <h3 className="text-sm text-slate-400 mb-4">Projeção Patrimonial Acumulada (5 Anos)</h3>
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={stats.data}>
                    <XAxis dataKey="year" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                       formatter={(val: number) => [`R$ ${val.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="linear" name="Sem a Habilidade" stroke="#64748b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="leveraged" name="Com Alavancagem" stroke="#10b981" strokeWidth={3} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SkillROICalculator;