
import React, { useState } from 'react';
import { BookOpen, Calculator, Brain, Sword, Compass, MessageSquare, Lock, Wallet, Database, Copy, Check } from 'lucide-react';

const Documentation: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlScript = `
-- 1. Habilitar UUIDs
create extension if not exists "uuid-ossp";

-- 2. Tabela de Perfis (Financeiro e Config)
create table public.profiles (
  id uuid references auth.users not null primary key,
  net_income numeric default 0,
  contract_hours_weekly numeric default 40,
  commute_minutes_daily numeric default 60,
  aspirational_income numeric default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 3. Tabela de Delegações
create table public.delegations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  cost numeric default 0,
  hours_saved numeric default 0,
  frequency text,
  category text,
  archetype text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.delegations enable row level security;
create policy "Users can all own delegations" on delegations for all using (auth.uid() = user_id);

-- 4. Tabela de Ativos (Patrimônio)
create table public.assets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  purchase_year numeric,
  purchase_value numeric default 0,
  category text,
  current_value_est numeric,
  appreciation_rate text,
  liabilities_text text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.assets enable row level security;
create policy "Users can all own assets" on assets for all using (auth.uid() = user_id);

-- 5. Contexto de Vida e Diagnóstico
create table public.life_contexts (
  user_id uuid references auth.users not null primary key,
  routine_description text,
  assets_description text,
  sleep_hours numeric default 7,
  physical_activity_minutes numeric default 0,
  study_minutes numeric default 0,
  eternal_return_score numeric,
  eternal_return_text text,
  matrix_x numeric,
  matrix_y numeric,
  matrix_label text,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);
alter table public.life_contexts enable row level security;
create policy "Users can all own context" on life_contexts for all using (auth.uid() = user_id);

-- 6. Bússola Anual (Metas)
create table public.year_compass (
  user_id uuid references auth.users not null primary key,
  goal1_text text,
  goal1_indicator text,
  goal1_completed boolean default false,
  goal2_text text,
  goal2_indicator text,
  goal2_completed boolean default false,
  goal3_text text,
  goal3_indicator text,
  goal3_completed boolean default false,
  financial_target_income numeric,
  financial_deadline text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.year_compass enable row level security;
create policy "Users can all own compass" on year_compass for all using (auth.uid() = user_id);

-- Gatilho para criar perfil automaticamente ao cadastrar usuário
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12 space-y-12">
      <div className="text-center border-b border-slate-800 pb-8">
        <h2 className="text-3xl font-serif text-slate-100 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          Wiki do Operador
        </h2>
        <p className="text-slate-400 mt-2">
          Manual de filosofia aplicada e metodologia de cálculo do Zeus.
        </p>
      </div>

      {/* Database Setup Section (NEW) */}
      <section className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-2xl overflow-hidden">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <Database className="w-5 h-5 text-indigo-400" />
               Instalação do Banco de Dados (Supabase)
            </h3>
            <button 
               onClick={handleCopy}
               className="text-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-all"
            >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               {copied ? "Copiado!" : "Copiar SQL"}
            </button>
         </div>
         
         <div className="text-sm text-slate-400 mb-4 space-y-2">
            <p>Para ativar a persistência na nuvem, siga estes passos:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
               <li>Crie um projeto no <a href="https://supabase.com" target="_blank" className="text-indigo-400 underline">Supabase.com</a>.</li>
               <li>Vá em <strong>SQL Editor</strong> no menu lateral.</li>
               <li>Cole o código abaixo e clique em <strong>Run</strong>.</li>
               <li>Adicione as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no seu arquivo <code>.env</code> local ou nas configurações de deploy (Vercel/Netlify).</li>
            </ol>
         </div>

         <div className="bg-black/50 p-4 rounded-lg border border-slate-800 overflow-x-auto">
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
               {sqlScript}
            </pre>
         </div>
      </section>

      {/* Release Notes */}
      <section className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-6">
         <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5" />
            Novidades da Versão 5.4 (Wealth Intelligence)
         </h3>
         <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>Patrimônio Inteligente 2.0:</strong> O Inventário agora ordena automaticamente seus ativos por valor, destacando o que realmente importa.</span>
            </li>
            <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>Selo Keeper (Estrela):</strong> A IA identifica e marca com uma estrela dourada os ativos que estão se valorizando ou protegendo seu capital contra a inflação.</span>
            </li>
             <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>Comparativo Histórico:</strong> Nova visualização que compara o Preço de Compra vs. Valor Atual estimado, revelando instantaneamente o ganho ou perda real de capital.</span>
            </li>
            <li className="flex items-start gap-2">
               <span className="text-emerald-500 font-bold">•</span>
               <span><strong>Sincronização em Nuvem:</strong> Seus dados de THL, Metas e Contexto agora persistem em nuvem criptografada (Supabase).</span>
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
              Aceitar a realidade é o primeiro passo para mudá-la. O ressentimento com perdas passadas paralisa a ação. O Amor Fati liberta a "Vontade de Potência" para agir no agora.
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
            A maioria das pessoas calcula seu valor hora dividindo o salário por 160h (40h semanais x 4 semanas). O Zeus rejeita essa simplificação.
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
              <h4 className="font-bold text-white mb-1">Oráculo das Navalhas</h4>
              <p className="text-xs text-slate-400">Analisa dilemas complexos usando Navalha de Occam, Via Negativa e Minimização de Arrependimento.</p>
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
