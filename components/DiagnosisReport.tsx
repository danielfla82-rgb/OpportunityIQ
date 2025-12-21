
import React, { useState } from 'react';
import { ContextAnalysisResult, CalculatedTHL, AppView, FinancialProfile } from '../types';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock, DollarSign, TrendingUp, ShieldAlert, FileText, Download, BrainCircuit, ShoppingBag, Infinity, Target, BarChart2, Info, X } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell, AreaChart, Area, ComposedChart } from 'recharts';

interface Props {
  result: ContextAnalysisResult;
  thl: CalculatedTHL;
  profile?: FinancialProfile; // Optional to prevent breaking if not passed immediately, though logic depends on it
  onApply: () => void;
  onBack: () => void;
  onNavigate: (view: AppView) => void;
}

const DiagnosisReport: React.FC<Props> = ({ result, thl, profile, onApply, onBack, onNavigate }) => {
  const [showMatrixInfo, setShowMatrixInfo] = useState(false);

  // Calculations for the report
  const potentialHoursReclaimed = result.delegationSuggestions.reduce((acc, curr) => acc + curr.hoursSaved, 0);
  const estimatedCost = result.delegationSuggestions.reduce((acc, curr) => acc + curr.cost, 0);
  const valueGenerated = potentialHoursReclaimed * thl.realTHL;
  const netPotentialGain = valueGenerated - estimatedCost;

  // Chart Data Preparation
  const coords = result.matrixCoordinates || { x: 50, y: 50, quadrantLabel: 'Em Análise' };
  const matrixData = [{ x: coords.x, y: coords.y, z: 100, label: 'Você' }];

  // IBGE Logic (Approximation based on PNAD 2023/24)
  const getIBGEContext = (income: number) => {
    if (income >= 28000) return { percentile: 99, label: "Top 1% (Elite Econômica)", color: "text-emerald-400" };
    if (income >= 15000) return { percentile: 95, label: "Top 5% (Classe A)", color: "text-emerald-300" };
    if (income >= 7500) return { percentile: 90, label: "Top 10% (Classe B)", color: "text-blue-400" };
    if (income >= 3500) return { percentile: 70, label: "Classe C+ (Média Alta)", color: "text-amber-400" };
    if (income >= 2000) return { percentile: 50, label: "Classe C (Média)", color: "text-slate-300" };
    return { percentile: 30, label: "Classe D/E", color: "text-red-400" };
  };

  const ibge = profile ? getIBGEContext(profile.netIncome) : null;

  // Generate Bell Curve Data
  const generateBellCurveData = () => {
     const data = [];
     const mean = 50;
     const stdDev = 15;
     
     for (let i = 0; i <= 100; i += 2) {
        // Gaussian function
        const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - mean) / stdDev, 2));
        data.push({
           percentile: i,
           density: density * 1000 // scale up for chart
        });
     }
     return data;
  };

  const bellCurveData = generateBellCurveData();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/50">
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-white">Diagnóstico Operacional de Vida</h2>
          <p className="text-slate-400 text-sm">Análise baseada na sua rotina e ativos declarados.</p>
        </div>
      </div>

      {/* Top Row: Matrix & IBGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
         {/* Chart Section */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4" /> Matriz de Potência
               </h3>
               <button 
                  onClick={() => setShowMatrixInfo(true)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/30 px-2 py-1 rounded border border-indigo-900/50"
               >
                  <Info className="w-3 h-3" /> Filosofia
               </button>
            </div>
            
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                     <XAxis type="number" dataKey="x" name="Autonomia" domain={[0, 100]} tick={false} axisLine={{ stroke: '#475569' }} />
                     <YAxis type="number" dataKey="y" name="Eficiência" domain={[0, 100]} tick={false} axisLine={{ stroke: '#475569' }} />
                     <ZAxis type="number" dataKey="z" range={[100, 100]} />
                     <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={() => null} />
                     <ReferenceLine x={50} stroke="#334155" strokeDasharray="3 3" />
                     <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                     
                     {/* Labels for Quadrants */}
                     <text x="5%" y="95%" className="text-[10px] fill-slate-600 font-bold uppercase">Último Homem</text>
                     <text x="5%" y="10%" className="text-[10px] fill-slate-600 font-bold uppercase">O Camelo</text>
                     <text x="95%" y="95%" className="text-[10px] fill-slate-600 font-bold uppercase text-end" textAnchor="end">Viajante</text>
                     <text x="95%" y="10%" className="text-[10px] fill-emerald-500/50 font-bold uppercase text-end" textAnchor="end">Übermensch</text>

                     <Scatter data={matrixData} fill="#8884d8">
                        {matrixData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill="#10b981" />
                        ))}
                     </Scatter>
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
               <div className="text-xl font-serif text-white">{coords.quadrantLabel}</div>
               <div className="text-xs text-slate-500">Autonomia: {coords.x}% | Eficiência: {coords.y}%</div>
            </div>

            {/* Matrix Info Modal/Overlay */}
            {showMatrixInfo && (
               <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-10 p-6 rounded-xl overflow-y-auto animate-fade-in flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="text-lg font-serif text-white">As Três Metamorfoses</h4>
                     <button onClick={() => setShowMatrixInfo(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-300">
                     <div>
                        <strong className="text-amber-400 block">O Camelo (Baixa Autonomia, Alta Carga)</strong>
                        Carrega o peso dos "Tu Deves". Eficiente em cumprir ordens, mas escravo da rotina.
                     </div>
                     <div>
                        <strong className="text-red-400 block">O Leão (Alta Autonomia, Luta Constante)</strong>
                        O espírito que conquista a liberdade. Diz "Eu Quero". Destrói velhos valores, mas ainda reage a eles.
                     </div>
                     <div>
                        <strong className="text-emerald-400 block">A Criança / Übermensch (Alta Autonomia, Alta Criação)</strong>
                        O novo começo. Diz "Sim" à vida. Criação pura, jogo, roda que gira por si mesma.
                     </div>
                     <div>
                        <strong className="text-slate-500 block">O Último Homem (Baixa Autonomia, Baixa Eficiência)</strong>
                        Busca apenas conforto e segurança. "Piscamos o olho e dizemos que inventamos a felicidade."
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* IBGE & Eternal Return */}
         <div className="space-y-6">
            {/* IBGE Card with Bell Curve */}
            {ibge && (
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BarChart2 className="w-4 h-4" /> Distribuição de Renda (Brasil)
                  </h3>
                  
                  <div className="h-32 w-full -ml-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={bellCurveData}>
                           <Area type="monotone" dataKey="density" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" strokeWidth={2} />
                           {/* User Position Line */}
                           <ReferenceLine x={ibge.percentile} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Você', fill: '#10b981', fontSize: 10 }} />
                           <XAxis dataKey="percentile" type="number" hide domain={[0, 100]} />
                           <YAxis hide />
                        </ComposedChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-3">
                     <div>
                        <div className={`text-xl font-serif ${ibge.color}`}>{ibge.label}</div>
                        <div className="text-xs text-slate-500">Percentil {ibge.percentile}%</div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs text-slate-500">Sua THL</div>
                        <div className="font-mono text-white">R$ {thl.realTHL.toFixed(2)}/h</div>
                     </div>
                  </div>
               </div>
            )}

            {/* Eternal Return Score */}
            {result.eternalReturnScore !== undefined && (
               <div className="bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/20 p-6 rounded-xl relative overflow-hidden">
                  <div className="flex items-start justify-between relative z-10">
                     <div className="flex-1 pr-4">
                        <h3 className="text-purple-400 font-serif font-bold text-lg mb-2 flex items-center gap-2">
                           <Infinity className="w-5 h-5" /> Eterno Retorno
                        </h3>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                           "Da Capo!" (De novo!)
                        </div>
                        <p className="text-slate-300 italic text-sm leading-relaxed">"{result.eternalReturnAnalysis}"</p>
                     </div>
                     <div className="text-right shrink-0">
                        <div className="text-4xl font-mono text-white font-bold">{result.eternalReturnScore}/100</div>
                        <div className="text-xs text-purple-400 mt-1">Aceitação</div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="w-32 h-32 text-slate-100" />
         </div>
         <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Resumo Executivo</h3>
         <p className="text-lg text-slate-200 font-serif leading-relaxed italic">
            "{result.summary}"
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Opportunity Column */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-emerald-400 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5" />
                 Oportunidades Detectadas
              </h3>
              <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-900">
                 {result.delegationSuggestions.length} Sugestões
              </span>
           </div>

           <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <div className="text-xs text-slate-500 uppercase">Tempo Resgatável</div>
                    <div className="text-2xl font-mono text-white">{potentialHoursReclaimed}h <span className="text-sm text-slate-500">/mês</span></div>
                 </div>
                 <div>
                    <div className="text-xs text-slate-500 uppercase">Lucro Potencial</div>
                    <div className="text-2xl font-mono text-emerald-400">+R$ {netPotentialGain.toFixed(0)}</div>
                 </div>
              </div>
              <div className="text-xs text-slate-400 border-t border-emerald-500/10 pt-3">
                 Ao delegar essas tarefas, você "compra" horas pagando menos que sua THL.
              </div>
           </div>

           <div className="space-y-3">
              {result.delegationSuggestions.map((item, idx) => (
                 <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center group hover:border-emerald-500/30 transition-colors">
                    <div>
                       <div className="font-medium text-slate-200">{item.name}</div>
                       <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" /> Salva {item.hoursSaved}h
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <DollarSign className="w-3 h-3" /> Custa R${item.cost}
                       </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors">
                       <CheckCircle2 className="w-4 h-4 text-slate-900 opacity-0 group-hover:opacity-100" />
                    </div>
                 </div>
              ))}
              {result.delegationSuggestions.length === 0 && (
                 <div className="text-center p-4 text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-lg">
                    Nenhuma oportunidade óbvia de delegação encontrada.
                 </div>
              )}
           </div>
        </div>

        {/* Risk Column */}
        <div className="space-y-6">
           <h3 className="text-lg font-serif text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Pontos de Atenção
           </h3>

           {/* Sunk Cost Warnings */}
           <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Suspeitas de Custo Irrecuperável</h4>
              {result.sunkCostSuspects.map((item, idx) => (
                 <div key={idx} className="bg-amber-950/10 border border-amber-500/20 p-4 rounded-lg flex flex-col gap-3">
                    <div>
                        <div className="text-amber-200 font-medium mb-1">{item.title}</div>
                        <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate(AppView.SUNK_COST)}
                      className="text-xs bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 py-2 px-3 rounded border border-amber-700/50 flex items-center justify-center gap-2 transition-colors w-full"
                    >
                        <BrainCircuit className="w-3 h-3" />
                        Resolver Viés na Ferramenta
                    </button>
                 </div>
              ))}
              {result.sunkCostSuspects.length === 0 && (
                 <p className="text-slate-500 text-sm">Nenhum projeto crítico detectado.</p>
              )}
           </div>

           {/* Lifestyle Risks */}
           <div className="space-y-4 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Riscos de Estilo de Vida</h4>
              {result.lifestyleRisks.map((risk, idx) => (
                 <div key={idx} className="bg-red-950/10 border border-red-500/20 p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">{risk}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate(AppView.LIFESTYLE_INFLATOR)}
                      className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-200 py-2 px-3 rounded border border-red-700/50 flex items-center justify-center gap-2 transition-colors w-full"
                    >
                        <ShoppingBag className="w-3 h-3" />
                        Auditar Compra no Corretor
                    </button>
                 </div>
              ))}
               {result.lifestyleRisks.length === 0 && (
                 <p className="text-slate-500 text-sm">Estilo de vida parece compatível.</p>
              )}
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-4 justify-end mt-12 z-50">
         <button 
           onClick={onBack}
           className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
         >
           Voltar e Refinar
         </button>
         <button 
           onClick={onApply}
           className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
         >
           <Download className="w-5 h-5" />
           Implementar Plano Operacional
         </button>
      </div>
    </div>
  );
};

export default DiagnosisReport;
