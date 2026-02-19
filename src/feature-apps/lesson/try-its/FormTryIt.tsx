import React from 'react';

type FormState = {
  word: string;
  translation: string;
};

export function FormTryIt() {
  const [form, setForm] = React.useState<FormState>({word: '', translation: ''});
  const [submitted, setSubmitted] = React.useState<FormState | null>(null);

  const errors = {
    word: form.word.trim().length < 2 ? 'Digite uma palavra (min 2 chars).' : null,
    translation: form.translation.trim().length < 2 ? 'Digite a tradução (min 2 chars).' : null,
  };
  const isValid = !errors.word && !errors.translation;

  return (
    <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
      <p className="muted" style={{marginTop: 0}}>
        Conceitos: <span className="kbd">input controlado</span>, validação, submit.
      </p>
      <div style={{display: 'grid', gap: 10}}>
        <label>
          <div className="muted" style={{marginBottom: 6}}>
            Palavra (EN)
          </div>
          <input
            className="input"
            value={form.word}
            onChange={(e) => setForm((s) => ({...s, word: e.target.value}))}
            placeholder="ex: improve"
          />
          {errors.word ? <div style={{marginTop: 6, color: 'rgba(239, 68, 68, 0.9)'}}>{errors.word}</div> : null}
        </label>

        <label>
          <div className="muted" style={{marginBottom: 6}}>
            Tradução (PT)
          </div>
          <input
            className="input"
            value={form.translation}
            onChange={(e) => setForm((s) => ({...s, translation: e.target.value}))}
            placeholder="ex: melhorar"
          />
          {errors.translation ? (
            <div style={{marginTop: 6, color: 'rgba(239, 68, 68, 0.9)'}}>{errors.translation}</div>
          ) : null}
        </label>

        <div className="btnRow">
          <button className="btn btnPrimary" disabled={!isValid} onClick={() => setSubmitted(form)}>
            Salvar card
          </button>
          <button className="btn" onClick={() => setForm({word: '', translation: ''})}>
            Limpar
          </button>
        </div>
      </div>

      {submitted ? (
        <>
          <div className="divider" />
          <div>
            <strong>Card salvo</strong>
            <div className="muted" style={{marginTop: 6}}>
              {submitted.word} = {submitted.translation}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

