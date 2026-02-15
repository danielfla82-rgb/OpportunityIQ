
import React, { useState, useEffect } from 'react';
import { SelfAnalysisData, AnalysisBlock } from '../types';
import { generateJungianSynthesis } from '../services/geminiService';
import { Ghost, User, Activity, Compass, Sparkles, Loader2, Save, Fingerprint, Plus, Trash2, Edit2 } from 'lucide-react';

interface Props {
  data: SelfAnalysisData | null;
  onSave: (data: SelfAnalysisData) => void;
}

// Generate UUID locally
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
  );
};

const SelfAnalysis: React.FC<Props> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<SelfAnalysisData>({
    shadow: [{ id: '1', question: 'O que você rejeita? O que você esconde dos outros?', answer: '' }],
    persona: [{ id: '1', question: 'Qual máscara você usa para ser aceito?', answer: '' }],
    complexes: [{ id: '1', question: 'Onde você perde o controle? Quais gatilhos te dominam?', answer: '' }],
    self: [{ id: '1', question: 'Qual é o seu propósito real, despido de ego?', answer: '' }],
    synthesis: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'shadow' | 'persona' | 'complexes' | 'self' | 'synthesis'>('shadow');

  // Load initial data
  useEffect(() => {
    if (data) {
      setFormData(data);
      if (data.synthesis) setActiveSection('synthesis');
    }
  }, [data]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const synthesis = await generateJungianSynthesis(formData);
        const newData = { ...formData, synthesis, lastUpdated: new Date().toISOString() };
        setFormData(newData);
        onSave(newData);
        setActiveSection('synthesis');
    } finally {
        setLoading(false);
    }
  };

  const handleSaveDraft = () => {
      const newData = { ...formData, lastUpdated: new Date().toISOString() };
      onSave(newData);
  };

  const updateBlock = (section: keyof SelfAnalysisData, id: string, field: 'question' | 'answer', value: string) => {
      setFormData(prev => {
          const blocks = prev[section] as AnalysisBlock[];
          const newBlocks = blocks.map(b => b.id === id ? { ...b, [field]: value } : b);
          return { ...prev, [section]: newBlocks };
      });
  };

  const addBlock = (section: keyof SelfAnalysisData) => {
      setFormData(prev => {
          const blocks = prev[section] as AnalysisBlock[];
          return {
              ...prev,
              [section]: [...blocks, { id: generateUUID(), question: 'Nova Pergunta...', answer: '' }]
          };
      });
  };

  const removeBlock = (section: keyof SelfAnalysisData, id: string) => {
      setFormData(prev => {
          const blocks = prev[section] as AnalysisBlock[];
          if (blocks.length <= 1) return prev; // Keep at least one
          return {
              ...prev,
              [section]: blocks.filter(b => b.id !== id)
          };
      });
  };

  const sections = [
    {
      id: 'shadow',
      title: 'Sombra',
      icon: Ghost,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30',
      metaphor: 'Espelho distorcido que clareia conforme o input',
    },
    {
      id: 'persona',
      title: 'Persona',
      icon: User,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30',
      metaphor: 'Máscara que racha ao ser pressionada',
    },
    {
      id: 'complexes',
      title: 'Complexos',
      icon: Activity,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30',
      metaphor: 'Radar de "minas terrestres" emocionais',
    },
    {
      id: 'self',
      title: 'Self',
      icon: Compass,
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-500/30',
      metaphor: 'Bússola central em constante calibração',
    }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-slate-100 flex items-center justify-center gap-3">
          <Fingerprint className="w-8 h-8 text-indigo-400" />
          Autoanálise Estrutural
        </h2>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl mx-auto">
          "Até que você torne o inconsciente consciente, ele dirigirá sua vida e você o chamará de destino." — Carl Jung
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
           {sections.map((section) => {
             const isActive = activeSection === section.id;
             const Icon = section.icon;
             
             return (
               <button
                 key={section.id}
                 onClick={() => setActiveSection(section.id as any)}
                 className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group relative overflow-hidden ${
                    isActive 
                      ? `${section.bgColor} ${section.borderColor} ring-1 ring-white/10` 
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                 }`}
               >
                 <div className={`p-2 rounded-lg bg-black/30 ${isActive ? section.color : 'text-slate-500 group-hover:text-slate-300'}`}>
                    <Icon className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>{section.title}</h3>
                    <p className="text-[10px] text-slate-500 truncate w-32">{section.metaphor}</p>
                 </div>
               </button>
             );
           })}

           <button
             onClick={() => setActiveSection('synthesis')}
             className={`w-full mt-6 p-4 rounded-xl border transition-all flex items-center gap-3 justify-center ${
                activeSection === 'synthesis'
                  ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300'
                  : formData.synthesis 
                    ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30 text-slate-400'
                    : 'bg-slate-950 border-slate-900 text-slate-600 hover:text-indigo-300'
             }`}
           >
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">Síntese do Oráculo</span>
           </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 flex flex-col h-full">
           
           {/* Input Sections */}
           {sections.map(section => (
              activeSection === section.id && (
                <div key={section.id} className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col animate-fade-in relative overflow-hidden">
                   {/* Background ambiance */}
                   <div className={`absolute top-0 right-0 w-96 h-96 ${section.bgColor.replace('/20', '/5')} rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`}></div>

                   <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className={`p-3 rounded-xl bg-slate-950 border border-white/5 ${section.color}`}>
                         <section.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="text-xl font-serif text-white">{section.title}</h3>
                         <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{section.metaphor}</p>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 relative z-10">
                       {(formData[section.id as keyof SelfAnalysisData] as AnalysisBlock[]).map((block, index) => (
                           <div key={block.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 group">
                               <div className="flex items-start gap-3 mb-3">
                                   <div className="flex-1">
                                       <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block flex items-center gap-2">
                                           Pergunta {index + 1} <Edit2 className="w-3 h-3 opacity-30" />
                                       </label>
                                       <input 
                                           className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-sm text-indigo-300 font-medium placeholder-slate-600 outline-none py-1 transition-colors"
                                           value={block.question}
                                           onChange={(e) => updateBlock(section.id as keyof SelfAnalysisData, block.id, 'question', e.target.value)}
                                           placeholder="Digite sua pergunta aqui..."
                                       />
                                   </div>
                                   {(formData[section.id as keyof SelfAnalysisData] as AnalysisBlock[]).length > 1 && (
                                       <button 
                                           onClick={() => removeBlock(section.id as keyof SelfAnalysisData, block.id)}
                                           className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                           title="Remover Pergunta"
                                       >
                                           <Trash2 className="w-4 h-4" />
                                       </button>
                                   )}
                               </div>
                               <textarea 
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 text-base leading-relaxed focus:ring-1 focus:ring-white/20 outline-none resize-none transition-all placeholder:text-slate-700 min-h-[120px]"
                                  placeholder="Sua resposta..."
                                  value={block.answer}
                                  onChange={(e) => updateBlock(section.id as keyof SelfAnalysisData, block.id, 'answer', e.target.value)}
                               />
                           </div>
                       ))}
                       
                       <button 
                           onClick={() => addBlock(section.id as keyof SelfAnalysisData)}
                           className="w-full py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-slate-600 hover:bg-slate-900/50 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                       >
                           <Plus className="w-4 h-4" /> Adicionar Ponto de Reflexão
                       </button>
                   </div>

                   <div className="flex justify-end mt-6 relative z-10 pt-4 border-t border-slate-800/50">
                      <button 
                        onClick={handleSaveDraft}
                        className="px-6 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                         <Save className="w-4 h-4" /> Salvar Rascunho
                      </button>
                   </div>
                </div>
              )
           ))}

           {/* Synthesis Section */}
           {activeSection === 'synthesis' && (
              <div className="flex-1 bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 flex flex-col animate-fade-in relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-transparent pointer-events-none"></div>
                 
                 <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400">
                            <Fingerprint className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-serif text-white">O Espelho da Alma</h3>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2 mb-6">
                    {formData.synthesis ? (
                       <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-indigo-200 prose-strong:text-white max-w-none leading-relaxed text-lg">
                          <div dangerouslySetInnerHTML={{ __html: formData.synthesis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                       </div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                          <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                          <p className="max-w-md">
                              Preencha os 4 pilares com honestidade brutal.<br/>
                              Quando estiver pronto, clique abaixo para que a IA sintetize sua estrutura psíquica.
                          </p>
                       </div>
                    )}
                 </div>

                 <div className="relative z-10 flex justify-center">
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-4 bg-white text-black hover:bg-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 transform hover:-translate-y-1"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? "Consultando o Inconsciente..." : "Gerar Síntese Completa"}
                    </button>
                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default SelfAnalysis;
