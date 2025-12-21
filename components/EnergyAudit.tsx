import React, { useState } from 'react';
import { EnergyAuditItem } from '../types';
import { getEnergyAudit } from '../services/geminiService';
import { Battery, BatteryCharging, Zap, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const EnergyAudit: React.FC = () => {
  const [inputTasks, setInputTasks] = useState("");
  const [items, setItems] = useState<EnergyAuditItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!inputTasks.trim()) return;
    setLoading(true);
    const result = await getEnergyAudit(inputTasks);
    setItems(result);
    setLoading(false);
  };

  const Quadrant = ({ title, type, items, colorClass, icon: Icon }: any) => (
    <div className={`border rounded-xl p-4 h-full ${colorClass} flex flex-col`}>
      <div className="flex items-center gap-2 mb-3 border-b border-black/10 dark:border-white/10 pb-2">
        <Icon className="w-5 h-5" />
        <h3 className="font-serif font-bold uppercase tracking-wider text-sm">{title}</h3>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto max-h-60">
        {items.map((item: EnergyAuditItem, idx: number) => (
          <div key={idx} className="bg-black/20 p-2 rounded text-sm relative group">
             <div className="font-medium">{item.task}</div>
             <div className="text-[10px] opacity-70 mt-1">{item.advice}</div>
          </div>
        ))}
        {items.length === 0 && <span className="text-xs opacity-50 italic">Nada aqui...</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in h-full">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-slate-100 flex items-center gap-2">
            <Battery className="w-6 h-6 text-yellow-400" />
            Matriz de Energia
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie sua energia, não apenas seu tempo. O que você faz bem (Valor) e o que te energiza?
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col">
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-3">Liste suas atividades recorrentes</label>
          <textarea 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 h-48 focus:ring-1 focus:ring-yellow-500 outline-none resize-none mb-4"
            placeholder={`Ex:\n- Criar estratégia de vendas\n- Preencher planilhas de despesas\n- Mentoria com time\n- Responder Slack`}
            value={inputTasks}
            onChange={(e) => setInputTasks(e.target.value)}
          />
          <button 
             onClick={handleAudit}
             disabled={loading || !inputTasks.trim()}
             className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
             {loading ? "Auditando Energia..." : "Classificar Atividades"}
           </button>
        </div>
      </div>

      <div className="lg:col-span-3">
        {!items.length && !loading && (
           <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 p-8 text-center min-h-[400px]">
             <p className="text-slate-500 max-w-xs">
               Descubra sua Zona de Genialidade e elimine o que te drena.
             </p>
           </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* High Value, Gain Energy */}
            <Quadrant 
              title="Zona de Genialidade" 
              type="GENIUS" 
              items={items.filter(i => i.quadrant === 'GENIUS')}
              colorClass="bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
              icon={Zap}
            />
            
            {/* High Value, Drain Energy */}
            <Quadrant 
              title="O Grind (Sistematize)" 
              type="GRIND" 
              items={items.filter(i => i.quadrant === 'GRIND')}
              colorClass="bg-amber-900/40 border-amber-500/50 text-amber-100"
              icon={AlertTriangle}
            />

            {/* Low Value, Gain Energy */}
            <Quadrant 
              title="A Armadilha (Cuidado)" 
              type="TRAP" 
              items={items.filter(i => i.quadrant === 'TRAP')}
              colorClass="bg-blue-900/40 border-blue-500/50 text-blue-100"
              icon={BatteryCharging}
            />

            {/* Low Value, Drain Energy */}
            <Quadrant 
              title="O Lixo (Elimine)" 
              type="DUMP" 
              items={items.filter(i => i.quadrant === 'DUMP')}
              colorClass="bg-red-900/40 border-red-500/50 text-red-100"
              icon={Trash2}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyAudit;