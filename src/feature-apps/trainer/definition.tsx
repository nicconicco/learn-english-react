import React from 'react';
import {Link} from 'react-router-dom';
import {learningProgressServiceDefinition, type LearningProgressFeatureServiceV1} from '../../feature-services/learningProgress';

type ProgressService = LearningProgressFeatureServiceV1;

type Challenge =
  | {id: string; level: number; type: 'mc'; prompt: string; choices: string[]; answerIndex: number; xp: number; hint: string}
  | {id: string; level: number; type: 'input'; prompt: string; answer: string; xp: number; hint: string};

const challenges: Challenge[] = [
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
  {
    id: 'c6',
    level: 4,
    type: 'input',
    prompt: 'Complete: "We have ____ three lessons." (past participle)',
    answer: 'completed',
    xp: 35,
    hint: 'Verbo regular: complete → completed.',
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
];

function pickNextChallenge(level: number, seenIds: Set<string>): Challenge {
  const available = challenges.filter((c) => c.level <= level);
  const unseen = available.filter((c) => !seenIds.has(c.id));
  if (unseen.length) return unseen[Math.floor(Math.random() * unseen.length)];
  return available[Math.floor(Math.random() * available.length)];
}

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
  const [hasStarted, setHasStarted] = React.useState(() => progress.xp > 0 || progress.completedLessonIds.length > 0);
  const [seen, setSeen] = React.useState<Set<string>>(() => new Set());
  const [challenge, setChallenge] = React.useState<Challenge>(() => pickNextChallenge(progress.level, seen));
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<'idle' | 'correct' | 'wrong'>('idle');

  React.useEffect(() => {
    setChallenge((prev) => (prev.level <= progress.level ? prev : pickNextChallenge(progress.level, seen)));
  }, [progress.level, seen]);

  const submit = () => {
    if (result !== 'idle') return;
    let correct = false;
    if (challenge.type === 'mc') {
      correct = selectedIndex === challenge.answerIndex;
    } else {
      correct = normalizeAnswer(input) === normalizeAnswer(challenge.answer);
    }
    if (correct) {
      setResult('correct');
      progressService.addXp(challenge.xp);
      setSeen((s) => new Set(s).add(challenge.id));
    } else {
      setResult('wrong');
    }
  };

  const next = () => {
    setSelectedIndex(null);
    setInput('');
    setResult('idle');
    setChallenge(pickNextChallenge(progress.level, seen));
  };

  const xpToNextLevel = 100 - (progress.xp % 100);

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
              <button className="btn btnSuccess" onClick={() => setHasStarted(true)}>
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
          <h2>Desafio</h2>
          <p className="muted">{challenge.prompt}</p>

          {challenge.type === 'mc' ? (
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
          ) : (
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite aqui" />
          )}

          <div className="btnRow">
            <button
              className="btn btnPrimary"
              onClick={submit}
              disabled={
                result !== 'idle' ||
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
          {result === 'correct' ? (
            <p>
              <strong>Boa.</strong> +<span className="kbd">{challenge.xp} XP</span>
            </p>
          ) : null}
          {result === 'wrong' ? (
            <>
              <div className="divider" />
              <p style={{color: 'rgba(255,255,255,0.9)'}}>
                <strong style={{color: 'var(--danger)'}}>Ainda não.</strong> {challenge.hint}
              </p>
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
