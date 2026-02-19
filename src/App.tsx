import React from 'react';
import {BrowserRouter, Link, Route, Routes, useLocation, useParams} from 'react-router-dom';
import {FeatureAppContainer, FeatureHubContextProvider} from '@feature-hub/react';
import {featureHub} from './feature-hub/featureHub';
import {learningProgressServiceDefinition, type LearningProgressFeatureServiceV1, type LearningProgressState} from './feature-services/learningProgress';
import {homeFeatureAppDefinition} from './feature-apps/home/definition';
import {lessonFeatureAppDefinition} from './feature-apps/lesson/definition';
import {trainerFeatureAppDefinition} from './feature-apps/trainer/definition';
import {progressFeatureAppDefinition} from './feature-apps/progress/definition';
import {flashcardsFeatureAppDefinition} from './feature-apps/flashcards/definition';

type ProgressService = LearningProgressFeatureServiceV1;

function useProgress(service: ProgressService): LearningProgressState {
  const [state, setState] = React.useState<LearningProgressState>(() => service.getState());
  React.useEffect(() => service.subscribe(setState), [service]);
  return state;
}

function Topbar() {
  const progressService = featureHub.featureServices[learningProgressServiceDefinition.id] as ProgressService;
  const progress = useProgress(progressService);
  const location = useLocation();

  return (
    <header className="topbar">
      <div className="container topbarInner">
        <div className="brand">
          <div className="brandTitle">React + Feature Hub</div>
          <span className="pill">
            Nível <span className="kbd">{progress.level}</span> • XP <span className="kbd">{progress.xp}</span> • Streak{' '}
            <span className="kbd">{progress.streakDays}d</span>
          </span>
        </div>
        <nav className="nav" aria-label="Navegação">
          <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>
            Início
          </Link>
          <Link to="/trainer" aria-current={location.pathname === '/trainer' ? 'page' : undefined}>
            Treino
          </Link>
          <Link to="/flashcards" aria-current={location.pathname === '/flashcards' ? 'page' : undefined}>
            Flashcards
          </Link>
          <Link to="/progress" aria-current={location.pathname === '/progress' ? 'page' : undefined}>
            Progresso
          </Link>
        </nav>
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <FeatureAppContainer key="edu:home" featureAppId="edu:home" featureAppDefinition={homeFeatureAppDefinition} />
        }
      />
      <Route
        path="/trainer"
        element={
          <FeatureAppContainer
            key="edu:trainer"
            featureAppId="edu:trainer"
            featureAppDefinition={trainerFeatureAppDefinition}
          />
        }
      />
      <Route
        path="/progress"
        element={
          <FeatureAppContainer
            key="edu:progress"
            featureAppId="edu:progress"
            featureAppDefinition={progressFeatureAppDefinition}
          />
        }
      />
      <Route
        path="/flashcards"
        element={
          <FeatureAppContainer
            key="edu:flashcards"
            featureAppId="edu:flashcards"
            featureAppDefinition={flashcardsFeatureAppDefinition}
          />
        }
      />
      <Route
        path="/lessons/:lessonId"
        element={<LessonRoute />}
      />
      <Route
        path="*"
        element={
          <div className="container">
            <div className="card">
              <h2>404</h2>
              <p className="muted">Página não encontrada.</p>
              <div className="btnRow">
                <Link className="btn btnPrimary" to="/">
                  Voltar ao início
                </Link>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function LessonRoute() {
  const {lessonId = ''} = useParams();
  return (
    <FeatureAppContainer
      key={`edu:lesson:${lessonId}`}
      featureAppId={`edu:lesson:${lessonId}`}
      featureAppName="edu:lesson"
      featureAppDefinition={lessonFeatureAppDefinition}
      config={{lessonId}}
    />
  );
}

export default function App() {
  return (
    <FeatureHubContextProvider value={{featureAppManager: featureHub.featureAppManager}}>
      <BrowserRouter>
        <div className="appShell">
          <Topbar />
          <main>
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </FeatureHubContextProvider>
  );
}
