import React from 'react';

type FakeWord = {word: string; translation: string};

function fakeFetchWord(signal: AbortSignal, level: number): Promise<FakeWord> {
  const pool: FakeWord[] = [
    {word: 'improve', translation: 'melhorar'},
    {word: 'achieve', translation: 'alcançar'},
    {word: 'challenge', translation: 'desafio'},
    {word: 'consistent', translation: 'consistente'},
    {word: 'attempt', translation: 'tentativa'},
  ];

  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => {
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool[(idx + level) % pool.length];
      resolve(picked);
    }, 650);

    signal.addEventListener('abort', () => {
      window.clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export function EffectTryIt() {
  const [level, setLevel] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [word, setWord] = React.useState<FakeWord | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fakeFetchWord(controller.signal, level)
      .then((w) => setWord(w))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError('Falha ao carregar (simulado).');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [level]);

  return (
    <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
      <p className="muted" style={{marginTop: 0}}>
        Conceitos: <span className="kbd">useEffect</span>, dependências, cleanup com <span className="kbd">AbortController</span>.
      </p>
      <div className="btnRow">
        <button className="btn" onClick={() => setLevel((l) => Math.max(1, l - 1))}>
          -
        </button>
        <span className="pill">
          Level param <span className="kbd">{level}</span>
        </span>
        <button className="btn" onClick={() => setLevel((l) => l + 1)}>
          +
        </button>
      </div>
      <div className="divider" />
      {loading ? <p className="muted">Carregando…</p> : null}
      {error ? <p style={{color: 'rgba(239, 68, 68, 0.9)'}}>{error}</p> : null}
      {word ? (
        <div className="listItem">
          <div>
            <strong>{word.word}</strong>
            <div className="muted" style={{marginTop: 4}}>
              tradução: {word.translation}
            </div>
          </div>
          <span className="tag">fake fetch</span>
        </div>
      ) : null}
    </div>
  );
}

