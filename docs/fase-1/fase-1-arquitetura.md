# Fase 1 — Arquitetura & Fluxos (React + Feature Hub)

Este documento descreve, em alto nível, **como o site funciona** e **quais métodos são chamados** nos fluxos principais.

## Entrypoint

- `src/main.tsx`: `ReactDOM.createRoot(...).render(<App />)`

## Integrator + Router

- `src/App.tsx`
  - `FeatureHubContextProvider` expõe o `featureAppManager` para os `FeatureAppContainer`
  - `BrowserRouter` + `Routes/Route` escolhem qual Feature App renderizar
  - `Topbar` assina o Feature Service de progresso via `getState()` + `subscribe()`

## Feature Hub

- `src/feature-hub/featureHub.ts`: `createFeatureHub('edu:integrator', { featureServiceDefinitions: [...] })`

## Feature Service (progresso)

- `src/feature-services/learningProgress.ts`
  - Persiste estado no `localStorage` (`edu:learningProgress:v1`)
  - API: `getState`, `subscribe`, `addXp`, `completeLesson`, `completeLessonAndReward`, `reset`

## Feature Apps (telas)

- Home: `src/feature-apps/home/definition.tsx`
- Trainer: `src/feature-apps/trainer/definition.tsx` (ganha XP com `addXp`)
- Lesson: `src/feature-apps/lesson/definition.tsx` (quiz chama `completeLessonAndReward`)
- Flashcards: `src/feature-apps/flashcards/definition.tsx`
  - Persiste progresso próprio em `localStorage` (`edu:flashcards-progress:v1`)
  - Ao acertar: `progressService.addXp(5)`
- Progress: `src/feature-apps/progress/definition.tsx` (dashboard + `reset`)

## PDF (geração)

O PDF desta fase é gerado localmente (sem dependências externas) por:

```bash
python3 scripts/generate_fase1_pdf.py
```

Saída padrão:

- `docs/fase-1/fase-1-arquitetura.pdf`

