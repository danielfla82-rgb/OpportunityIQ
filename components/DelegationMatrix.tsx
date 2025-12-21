
import React, { useState, useRef, useEffect } from 'react';
import { DelegationItem, CalculatedTHL, NietzscheArchetype } from '../types';
import { Plus, Trash2, Zap, Brain, Flame, Info, Package, Sparkles, Sword } from 'lucide-react';
import { getDelegationAdvice } from '../services/geminiService';
import { Tooltip } from 'react-tooltip';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Props {
  thl: CalculatedTHL;
  delegations: DelegationItem[];
  setDelegations: React.Dispatch<React.SetStateAction<DelegationItem[]>>;
}

interface AdviceData {
  text: string;
  archetype: NietzscheArchetype;
}

interface RowData {
  items: DelegationItem[];
  thl: CalculatedTHL;
  advices: Record<string, AdviceData>;
  loadingAdvice: string | null;
  remove: (id: string) => void;
}

const ArchetypeIcon = ({ type }: { type: NietzscheArchetype }) => {
  switch (type) {
    case 'CAMEL':
      return (
        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/50" title="O Camelo: Carrega pesos. Deve ser delegado.">
          <Package className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Camelo</span>
        </div>
      );
    case 'LION':
      return (
        <div className="flex items-center gap-1.5 text-red-500 bg-red-950/30 px-2 py-1 rounded border border-red-900/50" title="O Leão: Conquista liberdade. Faça com fúria ou delegue.">
          <Sword className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Leão</span>
        </div>
      );
    case 'CHILD':
      return (
        <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50" title="A Criança: Criação pura. O objetivo da vida.">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Criança</span>
        </div>
      );
    default:
      return null;
  }
};

const Row = ({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { items, thl, advices, loadingAdvice, remove } = data;
  const item = items[index];

  const calculateROI = (item: DelegationItem) => {
    const serviceHourlyCost = item.cost / item.hoursSaved;
    const delta = thl.realTHL - serviceHourlyCost;
    const totalProfit = delta * item.hoursSaved;
    const isPositive = delta > 0;
    
    return { delta, totalProfit, isPositive, serviceHourlyCost };
  };

  const { totalProfit, isPositive, serviceHourlyCost } = calculateROI(item);
  const adviceData = advices[item.id];
  
  const itemStyle = {
    ...style,
    height: (style.height as number) - 16,
    left: 0,
    right: 0,
  };

  return (
    <div style={itemStyle} className={`bg-slate-900 border ${isPositive ? 'border-emerald-500/20' : 'border-slate-800'} rounded-lg p-5 transition-all hover:border-slate-700 relative overflow-hidden group`}>
      {isPositive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 h-full">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-lg text-slate-200 truncate">{item.name}</h3>
            {adviceData && <ArchetypeIcon type={adviceData.archetype} />}
          </div>
          <div className="text-sm text-slate-500 mt-1 truncate">
            Custo: R${item.cost} | Salva: {item.hoursSaved}h | Custo/h do Serviço: R${serviceHourlyCost.toFixed(2)}
          </div>
          
          {(loadingAdvice === item.id || adviceData) && (
            <div className={`mt-4 flex items-start gap-3 p-3 rounded border backdrop-blur-sm animate-fade-in ${isPositive ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className={`mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {loadingAdvice === item.id ? <Zap className="w-4 h-4 animate-pulse" /> : <Brain className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isPositive ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {isPositive ? 'Amor Fati (Nietzsche)' : 'Conselho Racional'}
                  </div>
                  <div className={`text-sm italic line-clamp-2 ${isPositive ? 'text-emerald-100' : 'text-slate-300'}`}>
                      {loadingAdvice === item.id ? "Consultando Zaratustra..." : `"${adviceData?.text}"`}
                  </div>
                </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
            <div className="text-right">
              <div className="text-xs text-slate-500">Lucro/Prejuízo Real</div>
              <div className={`text-xl font-mono flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''} R$ {totalProfit.toFixed(2)}
                {isPositive && <Flame className="w-4 h-4 animate-pulse text-orange-500" />}
              </div>
            </div>
            <button 
            onClick={() => remove(item.id)}
            className="text-slate-600 hover:text-red-400 transition-colors p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

const DelegationMatrix: React.FC<Props> = ({ thl, delegations, setDelegations }) => {
  const [newItem, setNewItem] = useState<Partial<DelegationItem>>({
    frequency: 'monthly',
    category: 'other'
  });
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);
  const [advices, setAdvices] = useState<Record<string, AdviceData>>({});
  
  const listRef = useRef<List>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [advices, loadingAdvice, delegations]);

  const handleAdd = async () => {
    if (!newItem.name || !newItem.cost || !newItem.hoursSaved) return;

    const id = Date.now().toString();
    const item: DelegationItem = {
      id,
      name: newItem.name,
      cost: Number(newItem.cost),
      hoursSaved: Number(newItem.hoursSaved),
      frequency: newItem.frequency as any,
      category: newItem.category as any
    };

    setDelegations(prev => [...prev, item]);
    setNewItem({ frequency: 'monthly', category: 'other', name: '', cost: 0, hoursSaved: 0 });

    setLoadingAdvice(id);
    const result = await getDelegationAdvice(item.name, item.cost, item.hoursSaved, thl.realTHL);
    setAdvices(prev => ({ ...prev, [id]: result }));
    setLoadingAdvice(null);
  };

  const remove = (id: string) => {
    setDelegations(prev => prev.filter(i => i.id !== id));
  };

  const getItemSize = (index: number) => {
    const item = delegations[index];
    const hasAdvice = advices[item.id] || loadingAdvice === item.id;
    return hasAdvice ? 260 : 160;
  };

  const itemData: RowData = {
    items: delegations,
    thl,
    advices,
    loadingAdvice,
    remove
  };

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-serif text-slate-100">Matriz das Metamorfoses</h2>
          <p className="text-slate-400 text-sm mt-1">Classifique suas cargas: Camelo (Delegar), Leão (Fazer) ou Criança (Criar).</p>
        </div>
        <div className="text-right">
          <div 
             className="text-xs text-slate-500 uppercase tracking-widest cursor-help flex items-center justify-end gap-1.5 transition-colors hover:text-slate-300"
             data-tooltip-id="thl-info"
          >
             Sua THL Referência <Info className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono text-emerald-400">R$ {thl.realTHL.toFixed(2)}</div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shrink-0">
        <div className="md:col-span-1">
          <label className="block text-xs text-slate-400 mb-1">Tarefa / Carga</label>
          <input 
            type="text" 
            placeholder="Ex: Faxina, Uber, VA"
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200"
            value={newItem.name || ''}
            onChange={e => setNewItem({...newItem, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Custo Total (R$)</label>
          <input 
            type="number" 
            placeholder="0.00"
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200"
            value={newItem.cost || ''}
            onChange={e => setNewItem({...newItem, cost: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Horas Salvas</label>
          <input 
            type="number" 
            placeholder="0"
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200"
            value={newItem.hoursSaved || ''}
            onChange={e => setNewItem({...newItem, hoursSaved: parseFloat(e.target.value)})}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="bg-slate-100 hover:bg-white text-slate-900 font-medium py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 h-[38px]"
        >
          <Plus className="w-4 h-4" /> Classificar
        </button>
      </div>

      {/* Virtualized List Container */}
      <div className="flex-1 min-h-[400px]">
        {delegations.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                itemCount={delegations.length}
                itemSize={getItemSize}
                width={width}
                itemData={itemData}
                className="no-scrollbar"
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
            <div className="text-center py-12 text-slate-600">
              O espírito está livre de cargas por enquanto.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegationMatrix;
