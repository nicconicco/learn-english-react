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

function ProgressView({progressService}: {progressService: ProgressService}) {
  const progress = useProgress(progressService);
  const hasStarted = progress.xp > 0 || progress.completedLessonIds.length > 0;
  const completed = new Set(progress.completedLessonIds);
  const completedCount = lessons.filter((l) => completed.has(l.id)).length;

  if (!hasStarted) {
    return (
      <div className="container">
        <div className="grid">
          <section className="card">
            <h1>Você ainda não começou</h1>
            <p className="muted">
              Quando você fizer seu primeiro treino ou completar uma aula, seu progresso (XP, nível e streak) vai aparecer
              aqui.
            </p>
            <div className="btnRow">
              <Link className="btn btnSuccess" to="/trainer">
                Ir para o treino
              </Link>
              <Link className="btn" to="/">
                Ver aulas
              </Link>
            </div>
          </section>
          <aside className="card">
            <h2>Dica</h2>
            <p className="muted">Depois de ganhar XP, volte aqui para ver como vários Feature Apps consomem o mesmo serviço.</p>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="grid">
        <section className="card">
          <h1>Progresso</h1>
          <p className="muted">Este painel é outro Feature App consumindo o mesmo Feature Service.</p>
          <div className="divider" />
          <div className="list">
            <div className="listItem">
              <div>
                <strong>Nível</strong>
                <div className="muted" style={{marginTop: 4}}>
                  {progress.level}
                </div>
              </div>
              <span className="tag">level</span>
            </div>
            <div className="listItem">
              <div>
                <strong>XP</strong>
                <div className="muted" style={{marginTop: 4}}>
                  {progress.xp}
                </div>
              </div>
              <span className="tag">xp</span>
            </div>
            <div className="listItem">
              <div>
                <strong>Streak</strong>
                <div className="muted" style={{marginTop: 4}}>
                  {progress.streakDays} dia(s)
                </div>
              </div>
              <span className="tag">consistência</span>
            </div>
            <div className="listItem">
              <div>
                <strong>Aulas concluídas</strong>
                <div className="muted" style={{marginTop: 4}}>
                  {completedCount}/{lessons.length}
                </div>
              </div>
              <span className="tag">lessons</span>
            </div>
          </div>
          <div className="btnRow">
            <Link className="btn btnSuccess" to="/trainer">
              Continuar treino
            </Link>
            <button className="btn btnDanger" onClick={() => progressService.reset()}>
              Resetar progresso
            </button>
          </div>
        </section>

        <aside className="card">
          <h2>Onde fica o estado?</h2>
          <p className="muted">
            XP/nível/streak são persistidos no <span className="kbd">localStorage</span> e emitidos via{' '}
            <span className="kbd">subscribe()</span>. Isso permite que múltiplos Feature Apps fiquem sincronizados.
          </p>
          <div className="divider" />
          <h3>Experimento</h3>
          <p className="muted">
            Abra duas abas. Faça treino em uma e veja o topo atualizar na outra após recarregar.
          </p>
        </aside>
      </div>
    </div>
  );
}

export const progressFeatureAppDefinition = {
  dependencies: {
    featureServices: {
      [learningProgressServiceDefinition.id]: '^1.0.0',
    },
  },
  create(env: {featureServices: Record<string, unknown>}) {
    const progressService = env.featureServices[learningProgressServiceDefinition.id] as ProgressService;
    return {
      render() {
        return <ProgressView progressService={progressService} />;
      },
    };
  },
};
