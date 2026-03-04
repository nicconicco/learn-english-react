export type TrainerChallengeProgress = {
  box: 1 | 2 | 3 | 4 | 5;
  nextDueDate: string; // YYYY-MM-DD
  attempts: number;
  correct: number;
  wrong: number;
  lastAnsweredDate: string | null; // YYYY-MM-DD
};

export type TrainerProgressStore = Record<string, TrainerChallengeProgress>;

export const TRAINER_PROGRESS_STORAGE_KEY = 'edu:trainer-progress:v1';
export const TRAINER_STARTED_STORAGE_KEY = 'edu:trainer-started:v1';

const boxIntervalsDays: Record<TrainerChallengeProgress['box'], number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 4,
  5: 7,
};

export function todayIsoDate(): string {
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

function isProgressShape(v: unknown): v is TrainerChallengeProgress {
  if (!v || typeof v !== 'object') return false;
  const anyV = v as Record<string, unknown>;
  const box = anyV.box;
  const nextDueDate = anyV.nextDueDate;
  const attempts = anyV.attempts;
  const correct = anyV.correct;
  const wrong = anyV.wrong;
  const lastAnsweredDate = anyV.lastAnsweredDate;

  const boxOk = box === 1 || box === 2 || box === 3 || box === 4 || box === 5;
  const nextOk = typeof nextDueDate === 'string' && nextDueDate.length === 10;
  const numOk =
    typeof attempts === 'number' &&
    typeof correct === 'number' &&
    typeof wrong === 'number' &&
    Number.isFinite(attempts) &&
    Number.isFinite(correct) &&
    Number.isFinite(wrong);
  const lastOk = lastAnsweredDate === null || (typeof lastAnsweredDate === 'string' && lastAnsweredDate.length === 10);
  return boxOk && nextOk && numOk && lastOk;
}

export function loadTrainerStore(): TrainerProgressStore {
  const raw = localStorage.getItem(TRAINER_PROGRESS_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const obj = parsed as Record<string, unknown>;
    const store: TrainerProgressStore = {};
    for (const [id, value] of Object.entries(obj)) {
      if (isProgressShape(value)) store[id] = value;
    }
    return store;
  } catch {
    return {};
  }
}

export function saveTrainerStore(store: TrainerProgressStore) {
  localStorage.setItem(TRAINER_PROGRESS_STORAGE_KEY, JSON.stringify(store));
}

export function getChallengeProgress(store: TrainerProgressStore, challengeId: string): TrainerChallengeProgress {
  const existing = store[challengeId];
  if (existing) return existing;
  const today = todayIsoDate();
  return {box: 1, nextDueDate: today, attempts: 0, correct: 0, wrong: 0, lastAnsweredDate: null};
}

export function isDue(progress: TrainerChallengeProgress, today: string): boolean {
  return progress.nextDueDate <= today;
}

export function gradeChallenge(
  store: TrainerProgressStore,
  challengeId: string,
  grade: 'correct' | 'wrong',
): TrainerProgressStore {
  const today = todayIsoDate();
  const current = getChallengeProgress(store, challengeId);

  const nextBox: TrainerChallengeProgress['box'] =
    grade === 'correct' ? (Math.min(5, current.box + 1) as TrainerChallengeProgress['box']) : 1;

  const nextDueDate = addDaysIsoDate(today, boxIntervalsDays[nextBox]);

  const next: TrainerChallengeProgress = {
    box: nextBox,
    nextDueDate,
    attempts: current.attempts + 1,
    correct: current.correct + (grade === 'correct' ? 1 : 0),
    wrong: current.wrong + (grade === 'wrong' ? 1 : 0),
    lastAnsweredDate: today,
  };

  return {...store, [challengeId]: next};
}

export function countDueChallengeIds(params: {challengeIds: string[]; store: TrainerProgressStore}): number {
  const today = todayIsoDate();
  let count = 0;
  for (const id of params.challengeIds) {
    const p = getChallengeProgress(params.store, id);
    if (isDue(p, today)) count += 1;
  }
  return count;
}

export function pickNextChallengeId(params: {
  challengeIds: string[];
  store: TrainerProgressStore;
  avoidRecentIds: string[];
}): string | null {
  const today = todayIsoDate();
  const avoid = new Set(params.avoidRecentIds);

  const ranked = params.challengeIds
    .map((id) => ({id, p: getChallengeProgress(params.store, id)}))
    .sort((a, b) => {
      const dueA = isDue(a.p, today) ? 0 : 1;
      const dueB = isDue(b.p, today) ? 0 : 1;
      if (dueA !== dueB) return dueA - dueB; // due first
      if (a.p.box !== b.p.box) return a.p.box - b.p.box; // lower box first
      if (a.p.nextDueDate !== b.p.nextDueDate) return a.p.nextDueDate.localeCompare(b.p.nextDueDate);
      return a.id.localeCompare(b.id);
    });

  const firstNonRecent = ranked.find((r) => !avoid.has(r.id));
  return (firstNonRecent ?? ranked[0])?.id ?? null;
}

