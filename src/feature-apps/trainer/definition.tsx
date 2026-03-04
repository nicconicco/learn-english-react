import React from 'react';
import {Link} from 'react-router-dom';
import {learningProgressServiceDefinition, type LearningProgressFeatureServiceV1} from '../../feature-services/learningProgress';
import {
  TRAINER_STARTED_STORAGE_KEY,
  countDueChallengeIds,
  gradeChallenge,
  loadTrainerStore,
  pickNextChallengeId,
  saveTrainerStore,
  todayIsoDate,
  type TrainerProgressStore,
} from './srs';

type ProgressService = LearningProgressFeatureServiceV1;

type Challenge =
  | {id: string; level: number; type: 'mc'; prompt: string; choices: string[]; answerIndex: number; xp: number; hint: string}
  | {id: string; level: number; type: 'input'; prompt: string; answer: string; xp: number; hint: string};

const challenges: Challenge[] = [
  // Level 1 (vocabulário + frases curtas)
  {
    id: 'c1',
    level: 1,
    type: 'mc',
    prompt: 'Tradução de "improve":',
    choices: ['piorar', 'melhorar', 'parar'],
    answerIndex: 1,
    xp: 20,
    hint: 'Improve = melhorar.',
  },
  {
    id: 'c2',
    level: 1,
    type: 'input',
    prompt: 'Complete: "I want to ____ my English."',
    answer: 'improve',
    xp: 25,
    hint: 'A palavra começa com "im-".',
  },
  {
    id: 'c8',
    level: 1,
    type: 'mc',
    prompt: 'Tradução de "achieve":',
    choices: ['alcançar', 'assistir', 'perder'],
    answerIndex: 0,
    xp: 20,
    hint: 'Achieve = alcançar.',
  },
  {
    id: 'c9',
    level: 1,
    type: 'input',
    prompt: 'Complete: "I will ____ my goals."',
    answer: 'achieve',
    xp: 25,
    hint: 'Verbo: achieve.',
  },
  {
    id: 'c10',
    level: 1,
    type: 'mc',
    prompt: 'Qual é a forma correta?',
    choices: ['I is happy.', 'I am happy.', 'I are happy.'],
    answerIndex: 1,
    xp: 20,
    hint: 'Com "I", use "am".',
  },
  {
    id: 'c11',
    level: 1,
    type: 'input',
    prompt: 'Traduza para inglês: "eu estou pronto"',
    answer: 'i am ready',
    xp: 25,
    hint: 'Estrutura: I am ...',
  },
  {
    id: 'c3',
    level: 2,
    type: 'mc',
    prompt: 'Tradução de "challenge":',
    choices: ['desafio', 'cadeira', 'chave'],
    answerIndex: 0,
    xp: 25,
    hint: 'Challenge = desafio.',
  },
  {
    id: 'c4',
    level: 2,
    type: 'input',
    prompt: 'Traduza para inglês: "consistente"',
    answer: 'consistent',
    xp: 30,
    hint: 'Começa com "cons-".',
  },
  // Level 2 (mais vocabulário + present simple)
  {
    id: 'c12',
    level: 2,
    type: 'mc',
    prompt: 'Qual frase está correta?',
    choices: ['She work every day.', 'She works every day.', 'She working every day.'],
    answerIndex: 1,
    xp: 25,
    hint: 'He/She/It + verbo com "s" no present simple.',
  },
  {
    id: 'c13',
    level: 2,
    type: 'input',
    prompt: 'Complete: "He ____ to work on Mondays."',
    answer: 'goes',
    xp: 30,
    hint: 'Go → goes (He/She/It).',
  },
  {
    id: 'c14',
    level: 2,
    type: 'mc',
    prompt: 'Tradução de "consistent":',
    choices: ['consistente', 'consciente', 'constante (falso amigo)'],
    answerIndex: 0,
    xp: 25,
    hint: 'Consistent = consistente.',
  },
  {
    id: 'c15',
    level: 2,
    type: 'input',
    prompt: 'Traduza para inglês: "eu estudo todos os dias"',
    answer: 'i study every day',
    xp: 30,
    hint: 'I study every day.',
  },
  {
    id: 'c5',
    level: 3,
    type: 'mc',
    prompt: 'Qual frase está correta?',
    choices: ['He go to work.', 'He goes to work.', 'He going to work.'],
    answerIndex: 1,
    xp: 30,
    hint: 'He/She/It + verb + s (present simple).',
  },
  // Level 3 (vocab + perguntas)
  {
    id: 'c16',
    level: 3,
    type: 'mc',
    prompt: 'Tradução de "attempt":',
    choices: ['tentar', 'tentativa', 'atentar'],
    answerIndex: 1,
    xp: 30,
    hint: 'Attempt (noun) = tentativa. (Verb) = tentar.',
  },
  {
    id: 'c17',
    level: 3,
    type: 'input',
    prompt: 'Complete a pergunta: "____ do you study English?"',
    answer: 'why',
    xp: 30,
    hint: 'Pergunta de motivo: Why...',
  },
  {
    id: 'c18',
    level: 3,
    type: 'mc',
    prompt: 'Qual pergunta está correta?',
    choices: ['Where you live?', 'Where do you live?', 'Where does you live?'],
    answerIndex: 1,
    xp: 30,
    hint: 'Com "you": do you ...?',
  },
  {
    id: 'c19',
    level: 3,
    type: 'input',
    prompt: 'Traduza para inglês: "onde você mora?"',
    answer: 'where do you live',
    xp: 35,
    hint: 'Where do you live?',
  },
  {
    id: 'c6',
    level: 4,
    type: 'input',
    prompt: 'Complete: "We have ____ three lessons." (past participle)',
    answer: 'completed',
    xp: 35,
    hint: 'Verbo regular: complete → completed.',
  },
  // Level 4 (present perfect + tempos)
  {
    id: 'c20',
    level: 4,
    type: 'mc',
    prompt: 'Qual frase está em present perfect?',
    choices: ['I finished now.', 'I have finished.', 'I finish yesterday.'],
    answerIndex: 1,
    xp: 35,
    hint: 'Have/has + past participle.',
  },
  {
    id: 'c21',
    level: 4,
    type: 'input',
    prompt: 'Complete: "She has ____ a lot."',
    answer: 'improved',
    xp: 35,
    hint: 'Improve → improved.',
  },
  {
    id: 'c22',
    level: 4,
    type: 'mc',
    prompt: 'Tradução de "complete" (verbo):',
    choices: ['completar / concluir', 'competir', 'complicar'],
    answerIndex: 0,
    xp: 30,
    hint: 'Complete = concluir/completar.',
  },
  {
    id: 'c23',
    level: 4,
    type: 'input',
    prompt: 'Traduza para inglês: "eu já terminei"',
    answer: 'i have finished',
    xp: 35,
    hint: 'I have finished.',
  },
  {
    id: 'c7',
    level: 5,
    type: 'mc',
    prompt: 'Qual é o significado de "attempt"?',
    choices: ['atraso', 'tentativa', 'atenção'],
    answerIndex: 1,
    xp: 35,
    hint: 'Attempt = tentativa.',
  },
  // Level 5 (frases úteis + collocations)
  {
    id: 'c24',
    level: 5,
    type: 'mc',
    prompt: 'Complete: "It depends ____ the context."',
    choices: ['of', 'on', 'in'],
    answerIndex: 1,
    xp: 35,
    hint: 'Depends on.',
  },
  {
    id: 'c25',
    level: 5,
    type: 'input',
    prompt: 'Complete: "Can you ____ me a hand?"',
    answer: 'give',
    xp: 35,
    hint: 'Give me a hand = me ajuda.',
  },
  {
    id: 'c26',
    level: 5,
    type: 'mc',
    prompt: 'Qual é mais natural?',
    choices: ['I am agree.', 'I agree.', 'I agreeing.'],
    answerIndex: 1,
    xp: 35,
    hint: 'Em inglês: I agree (sem "am").',
  },
  // Level 6 (condicionais e expressões)
  {
    id: 'c27',
    level: 6,
    type: 'mc',
    prompt: 'Complete: "If I ____ time, I will study."',
    choices: ['will have', 'have', 'had'],
    answerIndex: 1,
    xp: 40,
    hint: 'First conditional: If + present, will + verb.',
  },
  {
    id: 'c28',
    level: 6,
    type: 'input',
    prompt: 'Complete: "If it ____ tomorrow, we will stay home."',
    answer: 'rains',
    xp: 40,
    hint: 'It rains (present) no if-clause.',
  },
  {
    id: 'c29',
    level: 6,
    type: 'mc',
    prompt: 'Tradução de "I look forward to it":',
    choices: ['Eu olho para frente', 'Estou ansioso por isso', 'Eu lembro disso'],
    answerIndex: 1,
    xp: 40,
    hint: 'Look forward to = ansioso por.',
  },
  {
    id: 'c30',
    level: 6,
    type: 'input',
    prompt: 'Traduza para inglês: "estou ansioso por isso"',
    answer: 'i look forward to it',
    xp: 45,
    hint: 'I look forward to it.',
  },
  // Level 7 (past simple + irregulars)
  {
    id: 'c31',
    level: 7,
    type: 'mc',
    prompt: 'Past simple de "go":',
    choices: ['goed', 'went', 'gone'],
    answerIndex: 1,
    xp: 45,
    hint: 'Go → went (past). Gone é past participle.',
  },
  {
    id: 'c32',
    level: 7,
    type: 'input',
    prompt: 'Complete: "Yesterday I ____ to the gym."',
    answer: 'went',
    xp: 50,
    hint: 'Yesterday → past simple. Go → went.',
  },
  {
    id: 'c33',
    level: 7,
    type: 'mc',
    prompt: 'Qual frase está correta?',
    choices: ['I did went.', 'I went.', 'I go yesterday.'],
    answerIndex: 1,
    xp: 45,
    hint: 'No afirmativo: I went. (sem did).',
  },
  // Level 8 (phrasal verbs + preposições)
  {
    id: 'c34',
    level: 8,
    type: 'mc',
    prompt: 'Significado de "give up":',
    choices: ['desistir', 'entregar', 'crescer'],
    answerIndex: 0,
    xp: 50,
    hint: 'Give up = desistir.',
  },
  {
    id: 'c35',
    level: 8,
    type: 'input',
    prompt: 'Complete: "Don’t ____ up."',
    answer: 'give',
    xp: 55,
    hint: 'Give up.',
  },
  {
    id: 'c36',
    level: 8,
    type: 'mc',
    prompt: 'Complete: "I’m interested ____ React."',
    choices: ['in', 'on', 'at'],
    answerIndex: 0,
    xp: 50,
    hint: 'Interested in.',
  },
  // Level 9 (comparativos e superlativos)
  {
    id: 'c37',
    level: 9,
    type: 'mc',
    prompt: 'Complete: "React is ____ than jQuery."',
    choices: ['modern', 'more modern', 'most modern'],
    answerIndex: 1,
    xp: 55,
    hint: 'Comparativo: more modern.',
  },
  {
    id: 'c38',
    level: 9,
    type: 'input',
    prompt: 'Traduza: "melhor que"',
    answer: 'better than',
    xp: 55,
    hint: 'Better than.',
  },
  {
    id: 'c39',
    level: 9,
    type: 'mc',
    prompt: 'Complete: "This is the ____ day of my streak."',
    choices: ['good', 'better', 'best'],
    answerIndex: 2,
    xp: 55,
    hint: 'Superlativo: the best.',
  },
  // Level 10 (modal verbs + fluência)
  {
    id: 'c40',
    level: 10,
    type: 'mc',
    prompt: 'Complete: "You ____ practice every day."',
    choices: ['should', 'must to', 'can to'],
    answerIndex: 0,
    xp: 60,
    hint: 'Should = deveria (recomendação). Sem "to".',
  },
  {
    id: 'c41',
    level: 10,
    type: 'input',
    prompt: 'Complete: "I ____ help you." (habilidade)',
    answer: 'can',
    xp: 60,
    hint: 'Can = poder/ser capaz.',
  },
  {
    id: 'c42',
    level: 10,
    type: 'mc',
    prompt: 'Qual é mais natural?',
    choices: ['I have 25 years.', 'I am 25 years old.', 'I am with 25 years.'],
    answerIndex: 1,
    xp: 60,
    hint: 'Em inglês: I am 25 years old.',
  },
];

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
}

function useProgress(service: ProgressService) {
  const [state, setState] = React.useState(() => service.getState());
  React.useEffect(() => service.subscribe(setState), [service]);
  return state;
}

function TrainerView({progressService}: {progressService: ProgressService}) {
  const progress = useProgress(progressService);
  const [hasStarted, setHasStarted] = React.useState(() => {
    const startedFlag = localStorage.getItem(TRAINER_STARTED_STORAGE_KEY) === '1';
    return startedFlag || progress.xp > 0 || progress.completedLessonIds.length > 0;
  });
  const [store, setStore] = React.useState<TrainerProgressStore>(() => loadTrainerStore());
  const [recentIds, setRecentIds] = React.useState<string[]>([]);
  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  const challenge = React.useMemo(
    () => (challengeId ? challenges.find((c) => c.id === challengeId) ?? null : null),
    [challengeId],
  );
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<'idle' | 'correct' | 'wrong'>('idle');

  React.useEffect(() => {
    const availableIds = challenges.filter((c) => c.level <= progress.level).map((c) => c.id);
    const nextId = pickNextChallengeId({challengeIds: availableIds, store, avoidRecentIds: recentIds});
    setChallengeId((prev) => prev ?? nextId);
  }, [progress.level, recentIds, store]);

  const submit = () => {
    if (result !== 'idle') return;
    if (!challenge) return;
    let isCorrect = false;
    if (challenge.type === 'mc') {
      isCorrect = selectedIndex === challenge.answerIndex;
    } else {
      isCorrect = normalizeAnswer(input) === normalizeAnswer(challenge.answer);
    }
    if (isCorrect) {
      setResult('correct');
      progressService.addXp(challenge.xp);
      const next = gradeChallenge(store, challenge.id, 'correct');
      setStore(next);
      saveTrainerStore(next);
      setRecentIds((prev) => [challenge.id, ...prev].slice(0, 6));
    } else {
      setResult('wrong');
      const next = gradeChallenge(store, challenge.id, 'wrong');
      setStore(next);
      saveTrainerStore(next);
      setRecentIds((prev) => [challenge.id, ...prev].slice(0, 6));
    }
  };

  const next = () => {
    setSelectedIndex(null);
    setInput('');
    setResult('idle');
    const availableIds = challenges.filter((c) => c.level <= progress.level).map((c) => c.id);
    const currentStore = loadTrainerStore();
    const nextId = pickNextChallengeId({challengeIds: availableIds, store: currentStore, avoidRecentIds: recentIds});
    setChallengeId(nextId);
  };

  const xpToNextLevel = 100 - (progress.xp % 100);
  const availableChallenges = challenges.filter((c) => c.level <= progress.level);
  const availableIds = availableChallenges.map((c) => c.id);
  const dueCount = countDueChallengeIds({challengeIds: availableIds, store});
  const today = todayIsoDate();

  if (!hasStarted) {
    return (
      <div className="container">
        <div className="grid">
          <section className="card">
            <h1>Você ainda não começou o treino</h1>
            <p className="muted">
              Aqui você faz desafios curtos de inglês e ganha XP para subir de nível e desbloquear aulas de React.
            </p>
            <div className="btnRow">
              <button
                className="btn btnSuccess"
                onClick={() => {
                  localStorage.setItem(TRAINER_STARTED_STORAGE_KEY, '1');
                  setHasStarted(true);
                }}
              >
                Começar treino
              </button>
              <Link className="btn" to="/">
                Voltar para aulas
              </Link>
            </div>
          </section>
          <aside className="card">
            <h2>Como funciona</h2>
            <p className="muted">
              A cada desafio correto você ganha XP. A cada <span className="kbd">100 XP</span> você sobe 1 nível.
            </p>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="grid">
        <section className="card">
          <h1>Treino contínuo de inglês</h1>
          <p className="muted">
            Complete desafios para ganhar XP. A cada <span className="kbd">100 XP</span> você sobe 1 nível e desbloqueia
            novas aulas.
          </p>
          <div className="divider" />
          <div className="pill" style={{marginBottom: 12}}>
            Próximo nível em <span className="kbd">{xpToNextLevel} XP</span>
          </div>
          <div className="pill" style={{marginBottom: 12}}>
            Hoje <span className="kbd">{today}</span> • Disponíveis <span className="kbd">{availableChallenges.length}</span> •
            Devidos <span className="kbd">{dueCount}</span>
          </div>
          {dueCount === 0 ? (
            <p className="muted" style={{marginTop: 0}}>
              Nenhum desafio “devido” hoje. Vou te sugerir revisões mais fáceis para manter a consistência.
            </p>
          ) : null}
          <h2>Desafio</h2>
          {!challenge ? <p className="muted">Carregando desafio…</p> : <p className="muted">{challenge.prompt}</p>}

          {challenge && challenge.type === 'mc' ? (
            <div className="list">
              {challenge.choices.map((choice, idx) => (
                <button
                  key={choice}
                  className="btn"
                  style={{
                    justifyContent: 'flex-start',
                    borderColor: selectedIndex === idx ? 'rgba(124, 92, 255, 0.7)' : undefined,
                    background:
                      selectedIndex === idx ? 'rgba(124, 92, 255, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                  }}
                  onClick={() => setSelectedIndex(idx)}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : challenge ? (
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite aqui" />
          ) : null}

          <div className="btnRow">
            <button
              className="btn btnPrimary"
              onClick={submit}
              disabled={
                result !== 'idle' ||
                !challenge ||
                (challenge.type === 'mc' ? selectedIndex === null : input.trim().length === 0)
              }
            >
              Responder
            </button>
            <button className="btn" onClick={next} disabled={result === 'idle'}>
              Próximo
            </button>
          </div>

          {result === 'correct' ? (
            <div className="divider" />
          ) : null}
          {result === 'correct' && challenge ? (
            <p>
              <strong>Boa.</strong> +<span className="kbd">{challenge.xp} XP</span>
            </p>
          ) : null}
          {result === 'wrong' ? (
            <>
              <div className="divider" />
              {challenge ? (
                <p style={{color: 'rgba(255,255,255,0.9)'}}>
                  <strong style={{color: 'var(--danger)'}}>Ainda não.</strong> {challenge.hint}
                </p>
              ) : null}
            </>
          ) : null}
        </section>

        <aside className="card">
          <h2>Dicas de React</h2>
          <p className="muted">
            Esta página é um Feature App. O progresso é compartilhado via Feature Service e persiste no{' '}
            <span className="kbd">localStorage</span>.
          </p>
          <div className="divider" />
          <div className="list">
            <div className="listItem">
              <div>
                <strong>Onde está o state?</strong>
                <div className="muted" style={{marginTop: 4}}>
                  Aqui, o state local controla o desafio; o estado global (XP) fica no Feature Service.
                </div>
              </div>
              <span className="tag">arquitetura</span>
            </div>
            <div className="listItem">
              <div>
                <strong>Por que agora varia mais?</strong>
                <div className="muted" style={{marginTop: 4}}>
                  O app registra seu desempenho por desafio e prioriza o que está “devido” (revisão espaçada).
                </div>
              </div>
              <span className="tag">SRS</span>
            </div>
            <div className="listItem">
              <div>
                <strong>Subiu de nível?</strong>
                <div className="muted" style={{marginTop: 4}}>
                  Vá em <Link to="/">Início</Link> para ver aulas desbloqueadas.
                </div>
              </div>
              <span className="tag">progressão</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const trainerFeatureAppDefinition = {
  dependencies: {
    featureServices: {
      [learningProgressServiceDefinition.id]: '^1.0.0',
    },
  },
  create(env: {featureServices: Record<string, unknown>}) {
    const progressService = env.featureServices[learningProgressServiceDefinition.id] as ProgressService;
    return {
      render() {
        return <TrainerView progressService={progressService} />;
      },
    };
  },
};
