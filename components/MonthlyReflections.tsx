
import React, { useState, useEffect, useRef } from 'react';
import { MonthlyNote } from '../types';
import { 
  Calendar, Save, CheckCircle2, PenLine, ChevronLeft, ChevronRight, 
  Edit3, Bold, Italic, List, Image as ImageIcon, Download, Palette, 
  Maximize2, X, Trash2, Plus
} from 'lucide-react';

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

const MonthlyReflections: React.FC<Props> = ({ notes, onSave }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [currentContent, setCurrentContent] = useState("");
  const [currentImages, setCurrentImages] = useState<string[]>([]); // New state for gallery
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when opening a note
  useEffect(() => {
    if (selectedMonth !== null) {
      const note = notes.find(n => n.month === selectedMonth && n.year === selectedYear);
      
      setCurrentContent(note?.content || "");
      setCurrentImages(note?.images || []);
      
      // We need to set the innerHTML after render when opening modal
      if (editorRef.current) {
        editorRef.current.innerHTML = note?.content || "";
      }
    }
  }, [selectedMonth, selectedYear, notes]);

  const handleSave = () => {
    if (selectedMonth === null) return;
    
    setIsSaving(true);
    
    // Get content directly from the editable div to preserve HTML
    const contentToSave = editorRef.current?.innerHTML || "";
    
    const note: MonthlyNote = {
      month: selectedMonth,
      year: selectedYear,
      content: contentToSave,
      images: currentImages,
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

    if (file.size > 2 * 1024 * 1024) { // 2MB limit check
      alert("Imagem muito grande. Por favor use imagens abaixo de 2MB para não sobrecarregar o banco de dados.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Add to Gallery State instead of inline
        setCurrentImages(prev => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const getNotePreview = (monthNum: number) => {
    const note = notes.find(n => n.month === monthNum && n.year === selectedYear);
    if (!note) return null;
    
    // Return text content + image count
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
             <h2 className="text-3xl font-serif text-slate-100">Reflexões Mensais</h2>
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
            <div className="bg-[#020617] border border-slate-800 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in-up relative overflow-hidden">
               
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

               {/* 2. Toolbar */}
               <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-1 pr-4 border-r border-slate-700 mr-2">
                     <button onClick={() => execCommand('bold')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Negrito"><Bold className="w-4 h-4" /></button>
                     <button onClick={() => execCommand('italic')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Itálico"><Italic className="w-4 h-4" /></button>
                     <button onClick={() => execCommand('insertUnorderedList')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Lista"><List className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex items-center gap-1 pr-4 border-r border-slate-700 mr-2">
                     {TEXT_COLORS.map((c) => (
                        <button 
                           key={c.color}
                           onClick={() => execCommand('foreColor', c.color)}
                           className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                           style={{ backgroundColor: c.color }}
                           title={`Cor: ${c.label}`}
                        />
                     ))}
                  </div>
               </div>

               {/* 3. Main Content Area (Scrollable) */}
               <div className="flex-1 overflow-y-auto bg-slate-950 scroll-smooth">
                   
                   {/* 3a. Text Editor */}
                   <div 
                      ref={editorRef}
                      contentEditable
                      className="w-full max-w-5xl mx-auto p-8 md:p-12 text-slate-200 text-lg leading-relaxed outline-none prose prose-invert prose-p:my-2 prose-headings:text-indigo-300 prose-ul:list-disc prose-ul:pl-5 min-h-[300px]"
                      suppressContentEditableWarning={true}
                      onInput={(e) => setCurrentContent(e.currentTarget.innerHTML)}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      data-placeholder="Comece a escrever aqui..."
                   />

                   {/* 3b. Gallery Section */}
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
                                          
                                          {/* Overlay */}
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
                                  <p className="text-xs opacity-70 mt-1">Clique para enviar memórias.</p>
                              </div>
                          )}
                      </div>
                   </div>

               </div>

               {/* 4. Footer */}
               <div className="p-4 md:px-8 md:py-5 border-t border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
                  <div className="text-xs text-slate-500 hidden md:block">
                     * Fotos são salvas no banco de dados.
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
                        {isSaving ? (
                           <>Salvando...</>
                        ) : (
                           <>
                              <Save className="w-5 h-5" /> Salvar Reflexão
                           </>
                        )}
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
