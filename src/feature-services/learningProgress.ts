export type LearningProgressState = {
  xp: number;
  level: number;
  completedLessonIds: string[];
  lastSessionDate: string | null;
  streakDays: number;
};

export type LearningProgressFeatureServiceV1 = {
  getState(): LearningProgressState;
  subscribe(listener: (state: LearningProgressState) => void): () => void;
  addXp(amount: number): void;
  completeLesson(lessonId: string): void;
  completeLessonAndReward(lessonId: string, xpReward: number): void;
  reset(): void;
};

const STORAGE_KEY = 'edu:learningProgress:v1';

function clampNonNegative(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function levelFromXp(xp: number): number {
  return 1 + Math.floor(xp / 100);
}

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function safeParseState(raw: string | null): LearningProgressState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LearningProgressState>;
    const xp = clampNonNegative(parsed.xp ?? 0);
    const completedLessonIds = Array.isArray(parsed.completedLessonIds)
      ? parsed.completedLessonIds.filter((id) => typeof id === 'string')
      : [];
    const computedLevel = levelFromXp(xp);
    const level = Math.max(computedLevel, clampNonNegative(parsed.level ?? computedLevel));
    const lastSessionDate = typeof parsed.lastSessionDate === 'string' ? parsed.lastSessionDate : null;
    const streakDays = clampNonNegative(parsed.streakDays ?? 0);

    return {xp, level, completedLessonIds, lastSessionDate, streakDays};
  } catch {
    return null;
  }
}

function defaultState(): LearningProgressState {
  return {xp: 0, level: 1, completedLessonIds: [], lastSessionDate: null, streakDays: 0};
}

function computeStreak(prev: LearningProgressState): Pick<LearningProgressState, 'lastSessionDate' | 'streakDays'> {
  const today = todayIsoDate();
  if (prev.lastSessionDate === today) {
    return {lastSessionDate: today, streakDays: prev.streakDays};
  }

  if (!prev.lastSessionDate) {
    return {lastSessionDate: today, streakDays: 1};
  }

  const prevDate = new Date(`${prev.lastSessionDate}T00:00:00`);
  const todayDate = new Date(`${today}T00:00:00`);
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 1) return {lastSessionDate: today, streakDays: prev.streakDays + 1};
  return {lastSessionDate: today, streakDays: 1};
}

function createLearningProgressService(): LearningProgressFeatureServiceV1 {
  let state = safeParseState(localStorage.getItem(STORAGE_KEY)) ?? defaultState();
  const listeners = new Set<(s: LearningProgressState) => void>();

  const notify = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    for (const listener of listeners) listener(state);
  };

  const ensureSession = () => {
    const streak = computeStreak(state);
    if (streak.lastSessionDate !== state.lastSessionDate || streak.streakDays !== state.streakDays) {
      state = {...state, ...streak};
      notify();
    }
  };

  const markLessonCompleted = (lessonId: string): boolean => {
    if (state.completedLessonIds.includes(lessonId)) return false;
    state = {...state, completedLessonIds: [...state.completedLessonIds, lessonId]};
    return true;
  };

  return {
    getState() {
      ensureSession();
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      ensureSession();
      listener(state);
      return () => listeners.delete(listener);
    },
    addXp(amount) {
      ensureSession();
      const nextXp = clampNonNegative(state.xp + amount);
      const nextLevel = levelFromXp(nextXp);
      state = {...state, xp: nextXp, level: Math.max(state.level, nextLevel)};
      notify();
    },
    completeLesson(lessonId) {
      ensureSession();
      if (markLessonCompleted(lessonId)) notify();
    },
    completeLessonAndReward(lessonId, xpReward) {
      ensureSession();
      const newlyCompleted = markLessonCompleted(lessonId);
      if (!newlyCompleted) return;
      const nextXp = clampNonNegative(state.xp + xpReward);
      const nextLevel = levelFromXp(nextXp);
      state = {...state, xp: nextXp, level: Math.max(state.level, nextLevel)};
      notify();
    },
    reset() {
      state = defaultState();
      notify();
    },
  };
}

export const learningProgressServiceDefinition = {
  id: 'edu:learning-progress',
  create() {
    const service = createLearningProgressService();

    const v1 = () => ({
      featureService: service,
      unbind() {},
    });

    return {'1.0.0': v1};
  },
};
