import React, { useState, useEffect, useRef } from 'react';
import { MonthlyNote, MonthlyMetrics, MonthlyTags } from '../types';
import { 
  Calendar, Save, CheckCircle2, PenLine, ChevronLeft, ChevronRight, 
  Edit3, Bold, Italic, List, Image as ImageIcon, Download, Palette, 
  Maximize2, X, Trash2, Plus, BarChart2, Tag, Wand2, ChevronDown, ChevronUp, Check, Layout
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface Props {
  notes: MonthlyNote[];
  onSave: (note: MonthlyNote) => void;
}

const MONTHS = [
  { num: 1, name: 'Janeiro' },
  { num: 2, name: 'Fevereiro' },
  { num: 3, name: 'Março' },
  { num: 4, name: 'Abril' },
  { num: 5, name: 'Maio' },
  { num: 6, name: 'Junho' },
  { num: 7, name: 'Julho' },
  { num: 8, name: 'Agosto' },
  { num: 9, name: 'Setembro' },
  { num: 10, name: 'Outubro' },
  { num: 11, name: 'Novembro' },
  { num: 12, name: 'Dezembro' },
];

const TEXT_COLORS = [
  { color: '#e2e8f0', label: 'Padrão' }, // Slate-200
  { color: '#34d399', label: 'Verde' },  // Emerald-400
  { color: '#f472b6', label: 'Rosa' },   // Pink-400
  { color: '#fbbf24', label: 'Ouro' },   // Amber-400
  { color: '#60a5fa', label: 'Azul' },   // Blue-400
  { color: '#f87171', label: 'Vermelho' } // Red-400
];

// --- EXPANDED CONSTANTS FOR STRUCTURED DATA ---

const TAG_OPTIONS = {
  context: [
    "Rotina Estável", "Viagem Trabalho", "Férias", "Mudança de Casa", 
    "Crise Familiar", "Término Relacionamento", "Doença/Lesão", 
    "Prazo Agressivo", "Promoção", "Demissão", "Dívida Inesperada",
    "Novo Hobby", "Networking Intenso", "Estudo Pesado"
  ],
  sentiment: [
    "Focado (Flow)", "Confiante", "Grato", "Resiliente", "Empolgado",
    "Disperso (Brain Fog)", "Ansioso", "Exausto", "Frustrado", "Solitário", "Indiferente"
  ],
  macro: [
    "Grande Avanço", "Produtivo", "Manutenção", 
    "Estagnado", "Caos Total", "Regressão", "Recuperação"
  ]
};

// Logic for Auto-NPS based on tags
const TAG_IMPACTS: Record<string, Partial<MonthlyMetrics>> = {
  "Doença/Lesão": { energyPhysical: 2, sleepQuality: 4, jobPerformance: 4 },
  "Viagem Trabalho": { energyPhysical: 5, sleepQuality: 5, studyConsistency: 3 },
  "Prazo Agressivo": { jobPerformance: 9, mentalClarity: 6, sleepQuality: 4, energyPhysical: 4 },
  "Férias": { energyPhysical: 9, mentalClarity: 9, jobPerformance: 0, studyConsistency: 2 },
  "Estudo Pesado": { studyConsistency: 10, studyQuality: 8, mentalClarity: 7 },
  "Focado (Flow)": { mentalClarity: 10, jobPerformance: 9, studyQuality: 10 },
  "Disperso (Brain Fog)": { mentalClarity: 2, studyQuality: 3, jobPerformance: 4 },
  "Exausto": { energyPhysical: 2, mentalClarity: 3, sleepQuality: 3 },
  "Ansioso": { sleepQuality: 3, mentalClarity: 4 },
  "Confiante": { jobPerformance: 8, mentalClarity: 8 },
  "Grande Avanço": { jobPerformance: 10, studyQuality: 10 },
  "Caos Total": { mentalClarity: 2, sleepQuality: 2, studyConsistency: 1 }
};

const METRIC_LABELS: Record<keyof MonthlyMetrics, { label: string, tooltips: string[] }> = {
  energyPhysical: { 
    label: "Energia Física", 
    tooltips: ["0-3: Sedentário/Doente", "4-7: Cansaço Moderado", "8-10: Alta Performance"]
  },
  mentalClarity: { 
    label: "Clareza Mental", 
    tooltips: ["0-3: Brain Fog Intenso", "4-7: Foco Oscilante", "8-10: Deep Work"]
  },
  jobPerformance: { 
    label: "Performance Trabalho", 
    tooltips: ["0-4: Risco (PIP)", "5-7: Entrega Padrão", "8-10: Promoção/Destaque"]
  },
  studyConsistency: { 
    label: "Constância Estudos", 
    tooltips: ["Adesão ao plano (Hábito)"]
  },
  studyQuality: { 
    label: "Qualidade Estudo", 
    tooltips: ["Retenção e Eficiência"]
  },
  sleepQuality: { 
    label: "Qualidade do Sono", 
    tooltips: ["A base de tudo"]
  }
};

// --- HELPER COMPONENTS ---

const MetricSlider: React.FC<{ id: keyof MonthlyMetrics, value: number, onChange: (v: number) => void }> = ({ id, value, onChange }) => {
  const info = METRIC_LABELS[id];
  
  const getColor = (v: number) => {
    if (v <= 3) return 'accent-red-500';
    if (v <= 7) return 'accent-yellow-500';
    return 'accent-emerald-500';
  };

  const getTextColor = (v: number) => {
    if (v <= 3) return 'text-red-400';
    if (v <= 7) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex flex-col gap-1 mb-3 group">
      <div className="flex justify-between items-end">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1 cursor-help" title={info.tooltips.join('\n')}>
          {info.label}
        </label>
        <span className={`text-sm font-mono font-bold ${getTextColor(value)}`}>{value}</span>
      </div>
      <input 
        type="range" 
        min="0" max="10" 
        step="1" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${getColor(value)} transition-all`}
      />
    </div>
  );
};

const TagSelector = ({ label, options, selected, onSelect, onRemove }: { label: string, options: string[], selected: string[], onSelect: (t: string) => void, onRemove: (t: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  // Defensive check: Ensure selected is always an array
  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleCreate = () => {
    if (newTag.trim()) {
        // Capitalize first letter logic optional, keeping raw input for flexibility
        onSelect(newTag.trim());
        setNewTag("");
        setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') {
        setIsCreating(false);
        setNewTag("");
    }
  };

  return (
  <div className={`border border-slate-800 rounded-lg bg-slate-900/40 mb-3 transition-all ${isOpen ? 'ring-1 ring-emerald-500/30 border-emerald-500/30' : 'hover:border-slate-700'}`}>
    {/* Header (Always Visible) - Acts as Accordion Trigger */}
    <button 
        onClick={() => !isCreating && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left focus:outline-none disabled:cursor-default"
        disabled={isCreating}
    >
        <div className="flex flex-col md:flex-row md:items-center gap-2 overflow-hidden w-full pr-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold shrink-0 whitespace-nowrap">{label}</span>
            
            {/* Preview of selected tags (Compact View) */}
            <div className="flex flex-wrap gap-1.5">
                {safeSelected.length > 0 ? (
                     safeSelected.map(tag => (
                         <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 truncate max-w-[120px]">
                             {tag}
                         </span>
                     ))
                ) : (
                    <span className="text-[10px] text-slate-700 italic flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Adicionar
                    </span>
                )}
            </div>
        </div>
        <div className="text-slate-500 hover:text-emerald-400 transition-colors">
             {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
    </button>

    {/* Body (Collapsible) */}
    {isOpen && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/30 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
                {isCreating ? (
                    <div className="flex gap-2 w-full animate-fade-in">
                        <input 
                            type="text"
                            autoFocus
                            placeholder="Nome da nova tag..."
                            className="flex-1 bg-slate-950 border border-emerald-500/50 rounded px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            onClick={handleCreate}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded transition-colors"
                            title="Confirmar"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => { setIsCreating(false); setNewTag(""); }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 rounded transition-colors"
                            title="Cancelar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="relative group w-full">
                        <select 
                            className="w-full appearance-none bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 text-xs py-2 pl-3 pr-8 rounded cursor-pointer outline-none focus:ring-1 focus:ring-emerald-500 transition-colors font-medium"
                            onChange={(e) => {
                                if (e.target.value === '__CREATE__') {
                                    setIsCreating(true);
                                    e.target.value = "";
                                } else if (e.target.value) {
                                    onSelect(e.target.value);
                                    e.target.value = ""; // Reset selection
                                }
                            }}
                            value=""
                        >
                            <option value="" disabled>Selecione ou crie nova...</option>
                            <option value="__CREATE__" className="text-emerald-400 font-bold bg-slate-900">+ Criar Tag Personalizada...</option>
                            <option disabled className="bg-slate-800">──────────</option>
                            {options.filter(opt => !safeSelected.includes(opt)).map(opt => (
                                <option key={opt} value={opt} className="text-slate-900 bg-slate-200">
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none group-hover:text-emerald-400" />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
              {safeSelected.length === 0 && !isCreating && (
                  <div className="w-full text-center py-2 text-xs text-slate-600 italic border border-dashed border-slate-800 rounded">
                      Nenhum item selecionado. Use o menu acima.
                  </div>
              )}
              {safeSelected.map(tag => (
                <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-900/40 border border-indigo-500/40 text-indigo-200 group transition-all hover:bg-red-900/30 hover:border-red-500/40 hover:text-red-300 cursor-pointer"
                    onClick={() => onRemove(tag)}
                    title="Clique para remover"
                >
                    {tag}
                    <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </span>
              ))}
            </div>
            
            <div className="mt-3 text-[10px] text-slate-600 text-right italic">
                Clique na tag para remover.
            </div>
        </div>
    )}
  </div>
  );
};

const MonthlyReflections: React.FC<Props> = ({ notes, onSave }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [currentContent, setCurrentContent] = useState("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<MonthlyMetrics>({
    energyPhysical: 5, mentalClarity: 5, jobPerformance: 5, studyConsistency: 5, studyQuality: 5, sleepQuality: 5
  });
  const [currentTags, setCurrentTags] = useState<MonthlyTags>({
    context: [], sentiment: [], macro: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when opening a note
  useEffect(() => {
    if (selectedMonth !== null) {
      const note = notes.find(n => n.month === selectedMonth && n.year === selectedYear);
      
      setCurrentContent(note?.content || "");
      setCurrentImages(note?.images || []);
      setCurrentMetrics(note?.metrics || {
        energyPhysical: 5, mentalClarity: 5, jobPerformance: 5, studyConsistency: 5, studyQuality: 5, sleepQuality: 5
      });
      
      // CRITICAL FIX: Ensure tags have all properties initialized to arrays
      setCurrentTags({
        context: note?.tags?.context || [],
        sentiment: note?.tags?.sentiment || [],
        macro: note?.tags?.macro || []
      });
      
      if (editorRef.current) {
        editorRef.current.innerHTML = note?.content || "";
      }
    }
  }, [selectedMonth, selectedYear, notes]);

  // --- AUTO CALCULATION LOGIC ---
  const handleAutoSuggestMetrics = () => {
    // 1. Start with neutral baseline
    let newMetrics: MonthlyMetrics = {
        energyPhysical: 5, mentalClarity: 5, jobPerformance: 5, 
        studyConsistency: 5, studyQuality: 5, sleepQuality: 5
    };

    // 2. Collect all active tags safely
    const activeContext = Array.isArray(currentTags.context) ? currentTags.context : [];
    const activeSentiment = Array.isArray(currentTags.sentiment) ? currentTags.sentiment : [];
    const activeMacro = Array.isArray(currentTags.macro) ? currentTags.macro : [];
    const allTags = [...activeContext, ...activeSentiment, ...activeMacro];
    
    // 3. Apply impacts
    let impactsApplied = 0;
    
    allTags.forEach(tag => {
        const impact = TAG_IMPACTS[tag];
        if (impact) {
            impactsApplied++;
            (Object.keys(impact) as Array<keyof MonthlyMetrics>).forEach(key => {
                if (impact[key] !== undefined) {
                    const target = impact[key]!;
                    const current = newMetrics[key];
                    // Logic: Move current halfway towards target
                    newMetrics[key] = Math.round((current + target) / 2);
                }
            });
        }
    });

    if (impactsApplied === 0) {
        alert("Adicione tags como 'Doença', 'Focado' ou 'Férias' para que a IA possa sugerir notas.");
        return;
    }

    setCurrentMetrics(newMetrics);
  };

  const handleSave = () => {
    if (selectedMonth === null) return;
    
    setIsSaving(true);
    
    const contentToSave = editorRef.current?.innerHTML || "";
    
    const note: MonthlyNote = {
      month: selectedMonth,
      year: selectedYear,
      content: contentToSave,
      images: currentImages,
      metrics: currentMetrics,
      tags: currentTags,
      updatedAt: new Date().toISOString()
    };
    
    setTimeout(() => {
        onSave(note);
        setIsSaving(false);
        setSelectedMonth(null);
    }, 600);
  };

  const handleExportYear = () => {
    const yearNotes = notes.filter(n => n.year === selectedYear);
    if (yearNotes.length === 0) {
      alert("Nenhuma nota encontrada para este ano.");
      return;
    }

    const dataStr = JSON.stringify(yearNotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Zeus_Backup_${selectedYear}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- EDITOR COMMANDS ---
  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { 
      alert("Imagem muito grande. Por favor use imagens abaixo de 2MB para não sobrecarregar o banco de dados.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCurrentImages(prev => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const getNotePreview = (monthNum: number) => {
    const note = notes.find(n => n.month === monthNum && n.year === selectedYear);
    if (!note) return null;
    
    const tmp = document.createElement("DIV");
    tmp.innerHTML = note.content;
    const text = tmp.textContent || tmp.innerText || "";
    
    return {
      text,
      imageCount: (note.images?.length || 0)
    };
  };

  const wordCount = (editorRef.current?.innerText || "").trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-6">
        <div className="text-center md:text-left">
           <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
             <div className="bg-emerald-900/30 p-2 rounded-lg border border-emerald-500/30">
                <Calendar className="w-6 h-6 text-emerald-400" />
             </div>
             <h2 className="text-3xl font-serif text-slate-100">Diário Mensal</h2>
           </div>
           <p className="text-slate-400 text-sm">
             Acompanhe seu progresso, dores e vitórias. O que não é medido não é gerenciado.
           </p>
        </div>

        <div className="flex items-center gap-4">
           {/* Export Button */}
           <button 
             onClick={handleExportYear}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-xs font-bold uppercase tracking-wide"
             title="Baixar backup deste ano"
           >
             <Download className="w-4 h-4" />
             Backup {selectedYear}
           </button>

           {/* Year Selector */}
           <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
             <button 
               onClick={() => setSelectedYear(prev => prev - 1)}
               className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
             >
                <ChevronLeft className="w-4 h-4" />
             </button>
             <span className="text-xl font-mono text-white font-bold px-2">{selectedYear}</span>
             <button 
               onClick={() => setSelectedYear(prev => prev + 1)}
               className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
             >
                <ChevronRight className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>

      {/* Grid of Months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {MONTHS.map((m) => {
            const previewData = getNotePreview(m.num);
            const hasContent = previewData && (previewData.text.length > 0 || previewData.imageCount > 0);
            const isCurrentMonth = new Date().getMonth() + 1 === m.num && new Date().getFullYear() === selectedYear;

            return (
              <div 
                 key={m.num}
                 onClick={() => setSelectedMonth(m.num)}
                 className={`
                    group relative p-6 rounded-xl border transition-all duration-300 cursor-pointer min-h-[220px] flex flex-col
                    ${hasContent 
                        ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl' 
                        : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}
                    ${isCurrentMonth ? 'ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}
                 `}
              >
                 <div className="flex justify-between items-start mb-4">
                    <span className={`text-2xl font-serif font-bold ${isCurrentMonth ? 'text-emerald-400' : 'text-slate-200'}`}>
                       {m.name}
                    </span>
                    {hasContent ? (
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                       <PenLine className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                    )}
                 </div>

                 <div className="flex-1 flex flex-col">
                    {hasContent ? (
                       <>
                         <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed font-sans opacity-80 mb-3 flex-1">
                            {previewData?.text || "Apenas imagens..."}
                         </p>
                         {previewData && previewData.imageCount > 0 && (
                            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-800">
                               <ImageIcon className="w-3 h-3 text-indigo-400" />
                               <span className="text-xs text-indigo-300">{previewData.imageCount} fotos</span>
                            </div>
                         )}
                       </>
                    ) : (
                       <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800/50 rounded-lg group-hover:border-slate-700/50 transition-colors">
                          <span className="text-xs text-slate-600 italic group-hover:text-slate-500 flex items-center gap-2">
                             <Edit3 className="w-3 h-3" /> Adicionar nota
                          </span>
                       </div>
                    )}
                 </div>
              </div>
            );
         })}
      </div>

      {/* EXPANDED EDITOR MODAL */}
      {selectedMonth !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#020617] border border-slate-800 w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in-up relative overflow-hidden">
               
               {/* 1. Modal Header */}
               <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
                  <div className="flex items-center gap-4">
                     <h3 className="text-3xl font-serif text-white">
                        {MONTHS.find(m => m.num === selectedMonth)?.name} <span className="text-slate-500">{selectedYear}</span>
                     </h3>
                     <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {wordCount} palavras
                     </span>
                  </div>
                  <button 
                     onClick={() => setSelectedMonth(null)}
                     className="p-2 text-slate-400 hover:text-white hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors"
                     title="Fechar sem salvar"
                  >
                     <X className="w-6 h-6" />
                  </button>
               </div>

               {/* 2. Structured Data Section (Accordion Wrapper) */}
               <div className="bg-slate-900 border-b border-slate-800 shrink-0 transition-all">
                   <button
                        onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors group focus:outline-none"
                   >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg transition-colors ${isMetricsExpanded ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'}`}>
                                <Layout className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Métricas & Contexto</h4>
                                <p className="text-[10px] text-slate-500">
                                    {isMetricsExpanded ? 'Clique para recolher' : 'Definir NPS, Tags e Sentimento'}
                                </p>
                            </div>
                        </div>
                        {isMetricsExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                   </button>

                   {isMetricsExpanded && (
                       <div className="px-6 pb-6 pt-2 animate-fade-in border-t border-slate-800/50 overflow-y-auto max-h-[350px] custom-scrollbar">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                             
                             {/* 2a. Metrics Sliders (Left Column - 4 cols) */}
                             <div className="lg:col-span-4 border-r border-slate-800 pr-0 lg:pr-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <BarChart2 className="w-4 h-4" />
                                        <h4 className="text-sm font-bold uppercase tracking-widest">Métricas (NPS)</h4>
                                    </div>
                                    <button 
                                        onClick={handleAutoSuggestMetrics}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-900/30 hover:bg-indigo-600 border border-indigo-500/30 rounded-full px-2.5 py-1 transition-all group"
                                        title="Preencher automaticamente baseado nas tags selecionadas"
                                    >
                                        <Wand2 className="w-3 h-3 group-hover:rotate-12 transition-transform" /> Sugerir
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                   {(Object.keys(currentMetrics) as Array<keyof MonthlyMetrics>).map(key => (
                                      <MetricSlider 
                                        key={key} 
                                        id={key} 
                                        value={currentMetrics[key]} 
                                        onChange={(v) => setCurrentMetrics(prev => ({ ...prev, [key]: v }))} 
                                      />
                                   ))}
                                </div>
                             </div>

                             {/* 2b. Context Tags (Right Column - 8 cols) */}
                             <div className="lg:col-span-8">
                                <div className="flex items-center gap-2 mb-6 text-indigo-400">
                                   <Tag className="w-4 h-4" />
                                   <h4 className="text-sm font-bold uppercase tracking-widest">Contexto & Sentimento</h4>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-y-2">
                                    <TagSelector 
                                      label="Fatores Externos" 
                                      options={TAG_OPTIONS.context} 
                                      selected={currentTags.context}
                                      onSelect={(t) => setCurrentTags(prev => ({ ...prev, context: [...prev.context, t] }))}
                                      onRemove={(t) => setCurrentTags(prev => ({ ...prev, context: prev.context.filter(i => i !== t) }))}
                                    />
                                    
                                    <TagSelector 
                                      label="Estado Interno" 
                                      options={TAG_OPTIONS.sentiment} 
                                      selected={currentTags.sentiment}
                                      onSelect={(t) => setCurrentTags(prev => ({ ...prev, sentiment: [...prev.sentiment, t] }))}
                                      onRemove={(t) => setCurrentTags(prev => ({ ...prev, sentiment: prev.sentiment.filter(i => i !== t) }))}
                                    />
                                    
                                    <TagSelector 
                                      label="Resultado Macro" 
                                      options={TAG_OPTIONS.macro} 
                                      selected={currentTags.macro}
                                      onSelect={(t) => setCurrentTags(prev => ({ ...prev, macro: [...prev.macro, t] }))}
                                      onRemove={(t) => setCurrentTags(prev => ({ ...prev, macro: prev.macro.filter(i => i !== t) }))}
                                    />
                                </div>
                             </div>
                          </div>
                       </div>
                   )}
               </div>

               {/* 3. Toolbar */}
               <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-1 pr-4 border-r border-slate-700 mr-2">
                     <button 
                        onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" 
                        title="Negrito"
                     >
                        <Bold className="w-4 h-4" />
                     </button>
                     <button 
                        onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" 
                        title="Itálico"
                     >
                        <Italic className="w-4 h-4" />
                     </button>
                     <button 
                        onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" 
                        title="Lista"
                     >
                        <List className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-1 pr-4 border-r border-slate-700 mr-2">
                     {TEXT_COLORS.map((c) => (
                        <button 
                           key={c.color}
                           onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', c.color); }}
                           className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                           style={{ backgroundColor: c.color }}
                           title={`Cor: ${c.label}`}
                        />
                     ))}
                  </div>
               </div>

               {/* 4. Main Content Area (Scrollable) */}
               <div className="flex-1 overflow-y-auto bg-slate-950 scroll-smooth">
                   
                   {/* 4a. Text Editor */}
                   <div 
                      ref={editorRef}
                      contentEditable
                      className="w-full max-w-5xl mx-auto p-8 md:p-12 text-slate-200 text-lg leading-relaxed outline-none prose prose-invert prose-p:my-2 prose-headings:text-indigo-300 prose-ul:list-disc prose-ul:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 min-h-[300px]"
                      suppressContentEditableWarning={true}
                      onInput={(e) => setCurrentContent(e.currentTarget.innerHTML)}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      data-placeholder="Comece a escrever aqui..."
                   />

                   {/* 4b. Gallery Section */}
                   <div className="border-t border-slate-800 bg-slate-900/30 py-8 px-8 md:px-12">
                      <div className="max-w-5xl mx-auto">
                          <div className="flex items-center justify-between mb-6">
                             <h4 className="text-lg font-serif text-slate-200 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-indigo-400" />
                                Galeria de {MONTHS.find(m => m.num === selectedMonth)?.name}
                             </h4>
                             
                             <div className="relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload} 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    <Plus className="w-4 h-4" /> Adicionar Foto
                                </button>
                             </div>
                          </div>

                          {currentImages.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {currentImages.map((img, idx) => (
                                      <div key={idx} className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 transition-colors">
                                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <button 
                                                  onClick={() => removeImage(idx)}
                                                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition-transform hover:scale-110"
                                                  title="Remover Imagem"
                                              >
                                                  <Trash2 className="w-5 h-5" />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div 
                                onClick={() => fileInputRef.current?.click()} 
                                className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900 hover:text-indigo-400 transition-all"
                              >
                                  <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                                  <p className="text-sm">Nenhuma foto adicionada ainda.</p>
                              </div>
                          )}
                      </div>
                   </div>
               </div>

               {/* 5. Footer */}
               <div className="p-4 md:px-8 md:py-5 border-t border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
                  <div className="text-xs text-slate-500 hidden md:block">
                     * Use a varinha mágica para autocompletar as métricas baseadas nas tags.
                  </div>
                  <div className="flex gap-4 w-full md:w-auto justify-end">
                     <button 
                        onClick={() => setSelectedMonth(null)}
                        className="px-6 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors font-medium"
                     >
                        Cancelar
                     </button>
                     <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50 transform hover:-translate-y-1"
                     >
                        {isSaving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Reflexão</>}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MonthlyReflections;