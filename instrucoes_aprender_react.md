# Instruções para aprender React (iniciante) com este projeto

Este repositório é um **projeto educacional** que te ensina React (básico → intermediário) usando uma arquitetura com **Feature Hub**:

- O app “principal” (o **integrator**) cria um `FeatureHub`.
- Cada página/tela é um **Feature App** (um microfrontend “plugável”).
- O progresso global (XP, nível, streak, aulas concluídas) é um **Feature Service** (estado compartilhado entre Feature Apps).

O objetivo do app é ser um “aprenda inglês continuamente”: você faz desafios, ganha XP, sobe nível e desbloqueia aulas com mini-exercícios de React.

---

## 1) Como rodar

No terminal, na raiz do projeto:

```bash
npm install
npm run dev
```

Depois abra: `http://localhost:5173`

Se você quiser validar tipagem:

```bash
npm run typecheck
```

---

## 2) Visão geral da estrutura de pastas

Arquivos principais:

- `index.html` → ponto de entrada da página (onde o React monta no `#root`).
- `src/main.tsx` → cria o “root” do React e renderiza `<App />`.
- `src/App.tsx` → “casca” do app: Router + Topbar + renderização dos Feature Apps.
- `src/styles.css` → estilos globais.

Feature Hub:

- `src/feature-hub/featureHub.ts` → cria o `featureHub` (integrator) e registra Feature Services.

Feature Services (estado compartilhado):

- `src/feature-services/learningProgress.ts` → o serviço de progresso (XP/nível/streak/aulas concluídas).

Feature Apps (microfrontends):

- `src/feature-apps/home/definition.tsx` → Feature App da Home (lista de aulas).
- `src/feature-apps/lesson/definition.tsx` → Feature App da Aula (conteúdo + try-it + quiz).
- `src/feature-apps/trainer/definition.tsx` → Feature App do Treino (desafios de inglês).
- `src/feature-apps/progress/definition.tsx` → Feature App do Progresso (painel e reset).
- `src/feature-apps/flashcards/definition.tsx` → Feature App de Flashcards (revisão espaçada estilo Leitner).

Conteúdo:

- `src/content/lessons.ts` → lista de aulas, nível requerido e quiz.
- `src/content/flashcards.ts` → dataset de flashcards (frente/verso, tags, nível).

Try-its (mini laboratórios de React):

- `src/feature-apps/lesson/try-its/CounterTryIt.tsx` → `useState` + props + eventos
- `src/feature-apps/lesson/try-its/FormTryIt.tsx` → forms controlados
- `src/feature-apps/lesson/try-its/EffectTryIt.tsx` → `useEffect` + dependências + cleanup
- `src/feature-apps/lesson/try-its/ReducerTryIt.tsx` → `useReducer`
- `src/feature-apps/lesson/try-its/ContextTryIt.tsx` → Context + `useMemo`

---

## 3) O que é Feature Hub (no contexto deste projeto)

Pense assim:

- **Integrator**: é o app host (onde fica o Router e layout). Ele cria o `FeatureHub` e decide *onde* renderizar cada Feature App.
- **Feature App**: é uma “peça” de UI independente (neste projeto, as páginas).
- **Feature Service**: é uma “dependência compartilhada” (um serviço com estado e métodos) que os Feature Apps podem usar.

Aqui, o Feature Service “learning progress” é o que permite:

- O topo mostrar XP/nível/streak em qualquer página.
- Home, Aula, Treino e Progresso ficarem sincronizados sem “passar props por todo lado”.

---

## 4) Fluxo do app (do navegador até a tela)

1) `index.html` tem `<div id="root"></div>`
2) `src/main.tsx` faz `createRoot(...).render(<App />)`
3) `src/App.tsx`:
   - envolve tudo com `FeatureHubContextProvider` (para o `FeatureAppContainer` funcionar)
   - usa `react-router-dom` para rotas (`/`, `/trainer`, `/progress`, `/lessons/:lessonId`)
   - renderiza cada página como um `FeatureAppContainer`

Exemplo mental:

- Rota `/trainer` → renderiza Feature App `edu:trainer`
- Rota `/lessons/state-props` → renderiza Feature App `edu:lesson` com `config: { lessonId }`

---

## 5) Como o progresso funciona (Feature Service)

Arquivo: `src/feature-services/learningProgress.ts`

O serviço guarda um estado mais ou menos assim:

- `xp`: número total de XP
- `level`: nível atual (calculado por XP; a cada 100 XP sobe 1)
- `completedLessonIds`: ids de aulas concluídas
- `lastSessionDate` + `streakDays`: para “streak” diário

E expõe uma API:

- `getState()` → retorna estado atual
- `subscribe(listener)` → notifica mudanças (padrão “pub/sub”)
- `addXp(amount)` → soma XP e atualiza nível
- `completeLessonAndReward(lessonId, xpReward)` → marca aula e dá XP só uma vez
- `reset()` → zera tudo

Persistência:

- O estado é salvo no `localStorage`, então ao recarregar a página você mantém o progresso.

Por que isso é bom para aprender?

- Você aprende a separar “estado global” (progresso) do “estado local” (input do desafio, alternativa selecionada, etc).

---

## 6) O que estudar em React com este projeto (mapa rápido)

### A) Componentes e props

Onde ver:

- `src/feature-apps/lesson/try-its/CounterTryIt.tsx`

O que observar:

- Um componente pai passa funções/dados via props (`CounterButton` recebe `label` e `onClick`).

### B) useState (estado local)

Onde ver:

- Counter, Form, Trainer, Quiz

O que observar:

- Quando o state muda, o React re-renderiza o componente.
- Use “updater function” quando depende do valor anterior: `setCount(c => c + 1)`.

### C) Forms controlados

Onde ver:

- `src/feature-apps/lesson/try-its/FormTryIt.tsx`

O que observar:

- `value={state}` + `onChange={...}`.
- Validação derivada do state (sem precisar de libs).

### D) useEffect

Onde ver:

- `src/feature-apps/lesson/try-its/EffectTryIt.tsx`

O que observar:

- Dependências: o efeito roda quando `level` muda.
- Cleanup: aborta o “fetch” simulado para evitar atualizar state após desmontar/trocar rápido.

### E) useReducer

Onde ver:

- `src/feature-apps/lesson/try-its/ReducerTryIt.tsx`

O que observar:

- Um “mini-store” local: `state` + `dispatch(action)`.
- Reducer puro: recebe `state` e `action` e devolve `newState`.

### F) Context + useMemo

Onde ver:

- `src/feature-apps/lesson/try-its/ContextTryIt.tsx`

O que observar:

- Provider distribui dados para qualquer componente abaixo, sem prop drilling.
- `useMemo` estabiliza o objeto `value` e evita renders extras em consumidores.

---

## 7) O que estudar em Feature Hub com este projeto

### A) Criar o FeatureHub (integrator)

Arquivo:

- `src/feature-hub/featureHub.ts`

O que observar:

- O integrator registra `featureServiceDefinitions`.
- Declara `featureServiceDependencies` com semver (`^1.0.0`).

### B) Consumir Feature Service dentro de um Feature App

Arquivos:

- `src/feature-apps/*/definition.tsx`

O que observar:

- Cada Feature App declara dependências:
  - `dependencies.featureServices[serviceId] = '^1.0.0'`
- No `create(env)`, pega o serviço via `env.featureServices[serviceId]`.

### C) Renderizar Feature App no app host

Arquivo:

- `src/App.tsx`

O que observar:

- `FeatureHubContextProvider` fornece o `featureAppManager`.
- `FeatureAppContainer` monta o Feature App selecionado (por rota).

---

## 8) Roteiro de estudo sugerido (iniciante)

1) Abra `/trainer` e responda 5–10 desafios.
2) Suba para nível 2 (100 XP por nível) e volte na Home para ver aulas desbloqueadas.
3) Abra a Aula 1 e brinque com o “Try it”.
4) Faça o mini-quiz da aula (ganha XP).
5) Vá em `/progress` e entenda como o mesmo Feature Service alimenta outra tela.

Meta: conseguir explicar, com suas palavras:

- O que é state local vs estado global
- Por que `subscribe()` existe no Feature Service
- Como o Router decide qual Feature App renderizar

---

## 9) Exercícios práticos (para aprender mais rápido)

### Exercício 1 (fácil): adicionar um desafio

Arquivo:

- `src/feature-apps/trainer/definition.tsx`

Tarefa:

- Adicione um novo item em `challenges` para `level: 1` e teste.

### Exercício 2 (fácil): adicionar uma aula

Arquivo:

- `src/content/lessons.ts`

Tarefa:

- Duplique uma aula e mude `id`, `title`, `summary`, `quiz`.

### Exercício 3 (médio): criar um novo “Try it”

Pasta:

- `src/feature-apps/lesson/try-its/`

Tarefa:

- Crie um novo componente de try-it e adicione um novo tipo em `lessons.ts`.

### Exercício 4 (médio): novo Feature App “Flashcards”

Tarefa:

- Criar `src/feature-apps/flashcards/definition.tsx`
- Adicionar rota em `src/App.tsx`
- Consumir o Feature Service para “recompensar XP” quando um card for acertado

Se você quiser, eu posso implementar esse Feature App com você passo a passo.

---

## 10) Dúvidas comuns (iniciante)

### “Por que tem Feature Hub + React Router juntos?”

- O Router escolhe a rota (URL) e decide qual tela mostrar.
- O Feature Hub entrega uma forma padronizada de montar “telas independentes” (Feature Apps) e compartilhar serviços.

### “Isso é microfrontend de verdade?”

Aqui é um **exemplo educacional** no mesmo bundle. A ideia é você aprender o modelo mental (integrator/feature app/service).
Depois dá para evoluir para um cenário com bundles separados.

---

## Próximo passo (me diga qual você prefere)

Eu posso:

1) Criar o Feature App “Flashcards” (muito bom para aprender state/forms)  
2) Adicionar testes (Vitest) para o Feature Service  
3) Explicar “linha por linha” do `src/App.tsx` e do `learningProgress.ts`

Me diga qual opção você quer primeiro.
