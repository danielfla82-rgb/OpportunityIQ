
import React from 'react';
import { BookOpen, Calculator, Brain, Sword, Compass, MessageSquare, CloudLightning, Lock } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12 space-y-12">
      <div className="text-center border-b border-slate-800 pb-8">
        <h2 className="text-3xl font-serif text-slate-100 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          Wiki do Operador
        </h2>
        <p className="text-slate-400 mt-2">
          Manual de filosofia aplicada e metodologia de cálculo do OpportunityIQ.
        </p>
      </div>

      {/* Release Notes */}
      <section className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-6">
         <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-3">
            <CloudLightning className="w-5 h-5" />
            Novidades da Versão 5.2 (Cloud Uplink)
         </h3>
         <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>Sincronização em Nuvem (Supabase):</strong> Seus dados de THL, Metas e Contexto agora persistem em nuvem criptografada. Acesse de qualquer dispositivo via Link Mágico.</span>
            </li>
             <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>UUIDs Robustos:</strong> Correção crítica na geração de IDs da Matriz de Delegação para compatibilidade total com Postgres.</span>
            </li>
            <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>Memória Viva do Chat:</strong> O Especialista Neural agora detecta automaticamente mudanças na sua THL ou Rotina e atualiza o contexto da conversa em tempo real.</span>
            </li>
         </ul>
      </section>

      {/* Philosophy Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Filosofia Central (Nietzsche & Estoicismo)
        </h3>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
          <div>
            <h4 className="font-serif text-lg text-white mb-1">Amor Fati (Amor ao Destino)</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Utilizado na ferramenta <strong>Custo Irrecuperável</strong>. A ideia não é apenas aceitar as perdas passadas, mas abraçá-las como necessárias para quem você é hoje. O ressentimento com o dinheiro ou tempo perdido paralisa a ação. O Amor Fati liberta a "Vontade de Potência" para agir no agora.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <h4 className="font-serif text-lg text-white mb-1">O Eterno Retorno</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              O teste supremo de qualidade de vida. Se você tivesse que viver sua rotina atual repetidamente por toda a eternidade, sem mudar uma vírgula, você se desesperaria ou ficaria grato? O <strong>Mapeamento de Contexto</strong> calcula seu "Índice de Eterno Retorno" baseado nisso.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <h4 className="font-serif text-lg text-white mb-1">As Três Metamorfoses</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Aplicado na <strong>Matriz de Delegação</strong>. 
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li><strong>Camelo:</strong> Carrega pesos alheios. Tarefas de baixa alavancagem que devem ser delegadas.</li>
                <li><strong>Leão:</strong> Conquista liberdade (o "Eu Quero"). Tarefas difíceis que constroem seu império.</li>
                <li><strong>Criança:</strong> Criação pura e esquecimento. O estado de fluxo onde o trabalho vira brincadeira (Deep Work).</li>
              </ul>
            </p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-400" />
          Metodologia Matemática (THL)
        </h3>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            A maioria das pessoas calcula seu valor hora dividindo o salário por 160h (40h semanais x 4 semanas). O OpportunityIQ rejeita essa simplificação.
          </p>
          
          <div className="bg-black/20 p-4 rounded-lg font-mono text-xs md:text-sm text-emerald-300">
            THL = (Renda Líquida) / (Horas Contrato + Horas Trânsito + Horas Extras Não Pagas)
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            <strong>Por que descontar o trânsito?</strong> O tempo de deslocamento é um tempo vendido para o empregador, mas não remunerado. Ao incluí-lo no denominador, sua taxa real cai drasticamente, revelando a verdadeira eficiência da sua venda de tempo.
          </p>
        </div>
      </section>

       {/* Tools Guide */}
       <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Sword className="w-6 h-6 text-amber-400" />
          Guia Rápido das Ferramentas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                 <Compass className="w-4 h-4 text-emerald-400" />
                 <h4 className="font-bold text-white">Bússola Anual</h4>
              </div>
              <p className="text-xs text-slate-400">Baseado no princípio das "Grandes Pedras". Defina apenas 3 metas não-negociáveis e um Norte Financeiro. O resto é ruído.</p>
           </div>
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                 <MessageSquare className="w-4 h-4 text-indigo-400" />
                 <h4 className="font-bold text-white">Chat Especialista</h4>
              </div>
              <p className="text-xs text-slate-400">Uma IA com personalidade ajustada (Nietzsche + Pareto) que tem acesso à sua THL e Contexto de Vida para dar conselhos táticos, não genéricos.</p>
           </div>
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white mb-1">Corretor Hedônico</h4>
              <p className="text-xs text-slate-400">Combate o consumismo convertendo preços em "Horas de Vida Perdidas" (baseado na sua THL) e sugerindo alternativas Pareto.</p>
           </div>
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white mb-1">Negociador Essencialista</h4>
              <p className="text-xs text-slate-400">Gera scripts para dizer "Não" sem queimar pontes, protegendo seu tempo para o que é vital.</p>
           </div>
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white mb-1">Oráculo das Navalhas</h4>
              <p className="text-xs text-slate-400">Analisa dilemas complexos usando Navalha de Occam, Via Negativa e Minimização de Arrependimento.</p>
           </div>
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white mb-1">Pre-Mortem</h4>
              <p className="text-xs text-slate-400">Exercício estoico. Imagine que o projeto já falhou e trabalhe de trás para frente para prevenir as causas.</p>
           </div>
        </div>
      </section>

      {/* Privacy Note */}
      <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-8">
          <div className="flex items-center gap-2 mb-2">
             <Lock className="w-5 h-5 text-slate-400" />
             <h4 className="text-slate-200 font-bold text-sm">Privacidade de Dados (RLS)</h4>
          </div>
          <p className="text-xs text-slate-500">
             Com a ativação da nuvem, seus dados estão protegidos por políticas de <strong>Row Level Security</strong>. Apenas o seu usuário autenticado pode ler ou editar suas entradas. A inteligência artificial (Gemini) processa os dados de forma efêmera e não os utiliza para treinamento.
          </p>
      </section>
    </div>
  );
};

export default Documentation;
