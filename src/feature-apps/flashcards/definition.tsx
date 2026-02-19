import React from 'react';
import {Link} from 'react-router-dom';
import {flashcards} from '../../content/flashcards';
import {learningProgressServiceDefinition, type LearningProgressFeatureServiceV1} from '../../feature-services/learningProgress';

type ProgressService = LearningProgressFeatureServiceV1;

type CardProgress = {
  box: 1 | 2 | 3 | 4 | 5;
  nextDueDate: string; // YYYY-MM-DD
};

type Store = Record<string, CardProgress>;

const STORAGE_KEY = 'edu:flashcards-progress:v1';

const boxIntervalsDays: Record<CardProgress['box'], number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysIsoDate(isoDate: string, days: number): string {
  const dt = new Date(`${isoDate}T00:00:00`);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function safeParseStore(raw: string | null): Store {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

function loadStore(): Store {
  return safeParseStore(localStorage.getItem(STORAGE_KEY));
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getCardProgress(store: Store, cardId: string): CardProgress {
  const existing = store[cardId];
  if (!existing) return {box: 1, nextDueDate: todayIsoDate()};
  return existing;
}

function isDue(progress: CardProgress, today: string): boolean {
  return progress.nextDueDate <= today;
}

function pickNextDueCardIds(params: {level: number; store: Store; limit: number}): string[] {
  const today = todayIsoDate();
  const available = flashcards.filter((c) => c.levelRequired <= params.level);

  const due = available
    .map((c) => ({id: c.id, p: getCardProgress(params.store, c.id)}))
    .filter(({p}) => isDue(p, today))
    .sort((a, b) => a.p.box - b.p.box); // prioriza caixas mais baixas

  if (due.length === 0) return [];
  return due.slice(0, params.limit).map((d) => d.id);
}

function gradeCard(store: Store, cardId: string, grade: 'good' | 'again'): Store {
  const today = todayIsoDate();
  const current = getCardProgress(store, cardId);

  const nextBox: CardProgress['box'] =
    grade === 'good' ? (Math.min(5, current.box + 1) as CardProgress['box']) : 1;

  const nextDueDate = addDaysIsoDate(today, boxIntervalsDays[nextBox]);
  return {...store, [cardId]: {box: nextBox, nextDueDate}};
}

function useProgress(service: ProgressService) {
  const [state, setState] = React.useState(() => service.getState());
  React.useEffect(() => service.subscribe(setState), [service]);
  return state;
}

function FlashcardsView({progressService}: {progressService: ProgressService}) {
  const progress = useProgress(progressService);
  const [store, setStore] = React.useState<Store>(() => loadStore());
  const [sessionIds, setSessionIds] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState(0);
  const [showBack, setShowBack] = React.useState(false);

  const currentId = sessionIds[index] ?? null;
  const card = currentId ? flashcards.find((c) => c.id === currentId) ?? null : null;

  const startSession = () => {
    const ids = pickNextDueCardIds({level: progress.level, store, limit: 10});
    setSessionIds(ids);
    setIndex(0);
    setShowBack(false);
  };

  const updateStore = (next: Store) => {
    setStore(next);
    saveStore(next);
  };

  const answer = (grade: 'good' | 'again') => {
    if (!currentId) return;
    const next = gradeCard(store, currentId, grade);
    updateStore(next);
    if (grade === 'good') progressService.addXp(5);
    setShowBack(false);
    setIndex((i) => Math.min(sessionIds.length, i + 1));
  };

  const availableCount = flashcards.filter((c) => c.levelRequired <= progress.level).length;
  const dueCount = pickNextDueCardIds({level: progress.level, store, limit: 999}).length;

  return (
    <div className="container">
      <div className="grid">
        <section className="card">
          <h1>Flashcards (revisão espaçada)</h1>
          <p className="muted">
            Sessões curtas de revisão. Acertou: sobe de “caixa” e volta mais tarde; errou: volta para a caixa 1. Isso é
            um modelo simples estilo Leitner.
          </p>
          <div className="divider" />

          <div className="pill" style={{marginBottom: 12}}>
            Disponíveis <span className="kbd">{availableCount}</span> • Devidos hoje <span className="kbd">{dueCount}</span> •
            Recompensa <span className="kbd">+5 XP</span> por acerto
          </div>

          <div className="btnRow">
            <button className="btn btnSuccess" onClick={startSession}>
              Começar sessão (até 10)
            </button>
            <button
              className="btn btnDanger"
              onClick={() => {
                updateStore({});
                setSessionIds([]);
                setIndex(0);
                setShowBack(false);
              }}
            >
              Resetar flashcards
            </button>
          </div>

          <div className="divider" />

          {sessionIds.length === 0 ? (
            <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
              <h3 style={{marginTop: 0}}>Você ainda não começou uma sessão</h3>
              <p className="muted" style={{marginBottom: 0}}>
                Clique em <span className="kbd">Começar sessão</span>. Se não houver cards devidos, faça treino/XP para
                desbloquear mais cards e volte amanhã.
              </p>
            </div>
          ) : index >= sessionIds.length ? (
            <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
              <h3 style={{marginTop: 0}}>Sessão finalizada</h3>
              <p className="muted" style={{marginBottom: 0}}>
                Boa. Você pode iniciar outra sessão ou voltar depois quando houver cards devidos.
              </p>
            </div>
          ) : card ? (
            <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap'}}>
                <span className="pill">
                  Card <span className="kbd">{index + 1}</span>/<span className="kbd">{sessionIds.length}</span>
                </span>
                <span className="pill">
                  Caixa <span className="kbd">{getCardProgress(store, card.id).box}</span> • Próximo{' '}
                  <span className="kbd">{getCardProgress(store, card.id).nextDueDate}</span>
                </span>
              </div>

              <div className="divider" />
              <h2 style={{marginTop: 0}}>{showBack ? card.back : card.front}</h2>
              <p className="muted" style={{marginTop: 0}}>
                {showBack ? 'Verso (PT)' : 'Frente (EN)'} • {card.tags.map((t) => `#${t}`).join(' ')}
              </p>

              <div className="btnRow">
                <button className="btn btnPrimary" onClick={() => setShowBack((s) => !s)}>
                  {showBack ? 'Ver frente' : 'Ver verso'}
                </button>
                <button className="btn btnSuccess" onClick={() => answer('good')} disabled={!showBack}>
                  Acertei
                </button>
                <button className="btn btnDanger" onClick={() => answer('again')} disabled={!showBack}>
                  Errei
                </button>
              </div>
            </div>
          ) : (
            <p className="muted">Card não encontrado.</p>
          )}
        </section>

        <aside className="card">
          <h2>Por que isso é útil?</h2>
          <p className="muted">
            Repetição espaçada tende a ser mais eficiente do que “repetir tudo sempre”. Aqui você também pratica React:
            estado local (sessão), estado persistido (localStorage) e estado global (XP via Feature Service).
          </p>
          <div className="divider" />
          <h3>Atalhos</h3>
          <div className="btnRow">
            <Link className="btn" to="/trainer">
              Voltar ao treino
            </Link>
            <Link className="btn" to="/progress">
              Ver progresso
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const flashcardsFeatureAppDefinition = {
  dependencies: {
    featureServices: {
      [learningProgressServiceDefinition.id]: '^1.0.0',
    },
  },
  create(env: {featureServices: Record<string, unknown>}) {
    const progressService = env.featureServices[learningProgressServiceDefinition.id] as ProgressService;
    return {
      render() {
        return <FlashcardsView progressService={progressService} />;
      },
    };
  },
};

