import React from 'react';
import {Link} from 'react-router-dom';
import {lessons} from '../../content/lessons';
import {learningProgressServiceDefinition, type LearningProgressFeatureServiceV1} from '../../feature-services/learningProgress';

type ProgressService = LearningProgressFeatureServiceV1;

function useProgress(service: ProgressService) {
  const [state, setState] = React.useState(() => service.getState());
  React.useEffect(() => service.subscribe(setState), [service]);
  return state;
}

function HomeView({progressService}: {progressService: ProgressService}) {
  const progress = useProgress(progressService);

  const availableLessons = lessons.filter((l) => l.levelRequired <= progress.level);
  const lockedLessons = lessons.filter((l) => l.levelRequired > progress.level);

  return (
    <div className="container">
      <div className="grid">
        <section className="card">
          <h1>Projeto educacional: aprender React com Feature Hub</h1>
          <p className="muted">
            Aqui você aprende React (básico → intermediário) enquanto constrói um app contínuo de inglês com níveis,
            desafios e progresso compartilhado via <span className="kbd">Feature Service</span>.
          </p>
          <div className="divider" />
          <h2>Aulas (desbloqueia por nível)</h2>
          <div className="list">
            {availableLessons.map((lesson) => (
              <div key={lesson.id} className="listItem">
                <div>
                  <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
                    <strong>{lesson.title}</strong> <span className="tag">Nível {lesson.levelRequired}</span>
                  </div>
                  <div className="muted" style={{marginTop: 4}}>
                    {lesson.summary}
                  </div>
                </div>
                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                  {progress.completedLessonIds.includes(lesson.id) ? <span className="tag">Concluída</span> : null}
                  <Link className="btn btnPrimary" to={`/lessons/${lesson.id}`}>
                    Abrir
                  </Link>
                </div>
              </div>
            ))}
            {lockedLessons.length ? (
              <div className="listItem" style={{opacity: 0.85}}>
                <div>
                  <strong>Mais aulas</strong>
                  <div className="muted" style={{marginTop: 4}}>
                    Desbloqueie níveis no modo <Link to="/trainer">Treino</Link>.
                  </div>
                </div>
                <span className="tag">{lockedLessons.length} bloqueada(s)</span>
              </div>
            ) : null}
          </div>
          <div className="btnRow">
            <Link className="btn btnSuccess" to="/trainer">
              Ir para Treino (subir nível)
            </Link>
            <Link className="btn btnPrimary" to="/flashcards">
              Flashcards (SRS)
            </Link>
            <Link className="btn" to="/progress">
              Ver Progresso
            </Link>
          </div>
        </section>

        <aside className="card">
          <h2>Como isso ensina Feature Hub?</h2>
          <p className="muted">
            Cada tela principal aqui é um <span className="kbd">Feature App</span>. O progresso (XP, nível, streak) é um{' '}
            <span className="kbd">Feature Service</span> registrado no integrator e consumido por todos os Feature Apps.
          </p>
          <div className="divider" />
          <h3>Nova sessão: Flashcards (revisão espaçada)</h3>
          <p className="muted">
            Uma sessão rápida de flashcards que usa um modelo simples estilo Leitner (revisão espaçada). Cada acerto dá{' '}
            <span className="kbd">+5 XP</span>.
          </p>
          <div className="btnRow">
            <Link className="btn btnPrimary" to="/flashcards">
              Abrir Flashcards
            </Link>
          </div>
          <div className="divider" />
          <h3>Atalhos</h3>
          <div className="list">
            <div className="listItem">
              <div>
                <strong>State</strong>
                <div className="muted" style={{marginTop: 4}}>
                  Veja <span className="kbd">useState</span> e re-render em ação.
                </div>
              </div>
              <span className="tag">Aula 1</span>
            </div>
            <div className="listItem">
              <div>
                <strong>useEffect</strong>
                <div className="muted" style={{marginTop: 4}}>
                  Assinaturas + “fetch” simulado.
                </div>
              </div>
              <span className="tag">Aula 3</span>
            </div>
            <div className="listItem">
              <div>
                <strong>useReducer</strong>
                <div className="muted" style={{marginTop: 4}}>
                  Fluxos com actions.
                </div>
              </div>
              <span className="tag">Aula 4</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const homeFeatureAppDefinition = {
  dependencies: {
    featureServices: {
      [learningProgressServiceDefinition.id]: '^1.0.0',
    },
  },
  create(env: {featureServices: Record<string, unknown>}) {
    const progressService = env.featureServices[learningProgressServiceDefinition.id] as ProgressService;
    return {
      render() {
        return <HomeView progressService={progressService} />;
      },
    };
  },
};
