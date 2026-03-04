# React + Feature Hub • English Trainer (educacional)

Projeto para aprender **React (básico → intermediário)** dentro de uma arquitetura com **Feature Hub**:

- O app (integrator) usa `@feature-hub/core` + `@feature-hub/react`
- Cada página principal é um **Feature App**
- O progresso (XP, nível, streak) é um **Feature Service** compartilhado

## Rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Como estudar (sugestão)

1) Faça o **Treino** até subir para o nível 2  
2) Abra as **Aulas** e complete o mini-quiz (ganha XP)  
3) Repare como:
   - cada Feature App recebe `featureServices` via `env`
   - o estado global não é “passado por props”, e sim via Feature Service

## Exercícios (para você evoluir o projeto)

- Adicionar novos desafios por nível em `src/feature-apps/trainer/definition.tsx`
- Criar uma nova aula em `src/content/lessons.ts` e um novo `tryIt`
- Criar um novo Feature App (ex.: “Flashcards”) e renderizar via `FeatureAppContainer`

## Onde estão as partes importantes

- Integrator Feature Hub: `src/feature-hub/featureHub.ts`
- Feature Service (progresso): `src/feature-services/learningProgress.ts`
- Feature Apps:
  - `src/feature-apps/home/definition.tsx`
  - `src/feature-apps/lesson/definition.tsx`
  - `src/feature-apps/trainer/definition.tsx`
  - `src/feature-apps/progress/definition.tsx`
  - `src/feature-apps/flashcards/definition.tsx`
- Conteúdo de flashcards: `src/content/flashcards.ts`

## Fase 1 (docs)

- PDF: `docs/fase-1/fase-1-arquitetura.pdf`
- Fonte (markdown): `docs/fase-1/fase-1-arquitetura.md`
- Gerar novamente: `python3 scripts/generate_fase1_pdf.py`
