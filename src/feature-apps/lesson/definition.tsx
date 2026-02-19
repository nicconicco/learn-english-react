import React from 'react';
import {Link} from 'react-router-dom';
import {lessons, type Lesson} from '../../content/lessons';
import {learningProgressServiceDefinition, type LearningProgressFeatureServiceV1} from '../../feature-services/learningProgress';
import {CounterTryIt} from './try-its/CounterTryIt';
import {FormTryIt} from './try-its/FormTryIt';
import {EffectTryIt} from './try-its/EffectTryIt';
import {ReducerTryIt} from './try-its/ReducerTryIt';
import {ContextTryIt} from './try-its/ContextTryIt';

type ProgressService = LearningProgressFeatureServiceV1;

function useProgress(service: ProgressService) {
  const [state, setState] = React.useState(() => service.getState());
  React.useEffect(() => service.subscribe(setState), [service]);
  return state;
}

function TryIt({lesson}: {lesson: Lesson}) {
  switch (lesson.tryIt) {
    case 'counter':
      return <CounterTryIt />;
    case 'form':
      return <FormTryIt />;
    case 'effect':
      return <EffectTryIt />;
    case 'reducer':
      return <ReducerTryIt />;
    case 'context':
      return <ContextTryIt />;
  }
}

function LessonView({lesson, progressService}: {lesson: Lesson; progressService: ProgressService}) {
  const progress = useProgress(progressService);
  const [selected, setSelected] = React.useState<number | null>(null);
  const isCorrect = selected === lesson.quiz.answerIndex;
  const isCompleted = progress.completedLessonIds.includes(lesson.id);

  React.useEffect(() => {
    if (isCorrect && !isCompleted) {
      progressService.completeLessonAndReward(lesson.id, 25);
    }
  }, [isCorrect, isCompleted, lesson.id, progressService]);

  return (
    <div className="container">
      <div className="grid">
        <section className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap'}}>
            <div>
              <h1>{lesson.title}</h1>
              <p className="muted">{lesson.summary}</p>
            </div>
            <span className="pill">
              Requer nível <span className="kbd">{lesson.levelRequired}</span>
            </span>
          </div>
          <div className="divider" />
          <h2>Conceito</h2>
          <p className="muted">{lesson.concept}</p>
          <div className="divider" />
          <h2>Try it</h2>
          <TryIt lesson={lesson} />
        </section>

        <aside className="card">
          <h2>Mini-quiz</h2>
          <p className="muted">{lesson.quiz.question}</p>
          <div className="list">
            {lesson.quiz.choices.map((choice, idx) => (
              <button
                key={choice}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  borderColor: selected === idx ? 'rgba(124, 92, 255, 0.7)' : undefined,
                  background:
                    selected === idx ? 'rgba(124, 92, 255, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                }}
                onClick={() => setSelected(idx)}
              >
                {choice}
              </button>
            ))}
          </div>
          <div className="divider" />
          {selected === null ? (
            <p className="muted">Escolha uma alternativa.</p>
          ) : isCorrect ? (
            <div>
              <p>
                <strong>Correto.</strong> Você ganhou <span className="kbd">+25 XP</span>.
              </p>
              <div className="btnRow">
                <Link className="btn btnSuccess" to="/trainer">
                  Ir para Treino
                </Link>
                <Link className="btn" to="/">
                  Voltar
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p style={{color: 'rgba(255,255,255,0.9)'}}>
                <strong style={{color: 'var(--danger)'}}>Ops.</strong> {lesson.quiz.hint}
              </p>
              <div className="btnRow">
                <button className="btn" onClick={() => setSelected(null)}>
                  Tentar de novo
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export const lessonFeatureAppDefinition = {
  dependencies: {
    featureServices: {
      [learningProgressServiceDefinition.id]: '^1.0.0',
    },
  },
  create(env: {config?: {lessonId?: string}; featureServices: Record<string, unknown>}) {
    const lessonId = env.config?.lessonId ?? '';
    const lesson = lessons.find((l) => l.id === lessonId);
    const progressService = env.featureServices[learningProgressServiceDefinition.id] as ProgressService;

    return {
      render() {
        if (!lesson) {
          return (
            <div className="container">
              <div className="card">
                <h2>Aula não encontrada</h2>
                <p className="muted">ID: {lessonId}</p>
                <div className="btnRow">
                  <Link className="btn btnPrimary" to="/">
                    Voltar ao início
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        const progress = progressService.getState();
        if (lesson.levelRequired > progress.level) {
          return (
            <div className="container">
              <div className="card">
                <h2>Aula bloqueada</h2>
                <p className="muted">
                  Você está no nível <span className="kbd">{progress.level}</span>. Esta aula requer nível{' '}
                  <span className="kbd">{lesson.levelRequired}</span>.
                </p>
                <div className="btnRow">
                  <Link className="btn btnSuccess" to="/trainer">
                    Fazer Treino para subir nível
                  </Link>
                  <Link className="btn" to="/">
                    Voltar
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        return <LessonView lesson={lesson} progressService={progressService} />;
      },
    };
  },
};
