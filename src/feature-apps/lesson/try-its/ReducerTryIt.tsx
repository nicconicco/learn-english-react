import React from 'react';

type Item = {id: string; text: string; done: boolean};

type State = {
  items: Item[];
  draft: string;
};

type Action =
  | {type: 'draftChanged'; value: string}
  | {type: 'added'}
  | {type: 'toggled'; id: string}
  | {type: 'removed'; id: string};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'draftChanged':
      return {...state, draft: action.value};
    case 'added': {
      const text = state.draft.trim();
      if (!text) return state;
      const id = crypto.randomUUID();
      return {items: [{id, text, done: false}, ...state.items], draft: ''};
    }
    case 'toggled':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? {...i, done: !i.done} : i)) };
    case 'removed':
      return {...state, items: state.items.filter((i) => i.id !== action.id)};
  }
}

export function ReducerTryIt() {
  const [state, dispatch] = React.useReducer(reducer, {items: [], draft: ''});

  return (
    <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
      <p className="muted" style={{marginTop: 0}}>
        Conceitos: <span className="kbd">useReducer</span>, actions, imutabilidade.
      </p>
      <div style={{display: 'grid', gap: 10}}>
        <input
          className="input"
          value={state.draft}
          placeholder="Add um item (ex: revisar flashcards)"
          onChange={(e) => dispatch({type: 'draftChanged', value: e.target.value})}
          onKeyDown={(e) => {
            if (e.key === 'Enter') dispatch({type: 'added'});
          }}
        />
        <div className="btnRow">
          <button className="btn btnPrimary" onClick={() => dispatch({type: 'added'})}>
            Adicionar
          </button>
        </div>
      </div>
      <div className="divider" />
      <div className="list">
        {state.items.length === 0 ? <div className="muted">Sem itens ainda.</div> : null}
        {state.items.map((item) => (
          <div key={item.id} className="listItem">
            <div style={{display: 'grid', gap: 4}}>
              <strong style={{textDecoration: item.done ? 'line-through' : 'none'}}>{item.text}</strong>
              <span className="muted">{item.done ? 'feito' : 'pendente'}</span>
            </div>
            <div className="btnRow" style={{marginTop: 0}}>
              <button className="btn" onClick={() => dispatch({type: 'toggled', id: item.id})}>
                Toggle
              </button>
              <button className="btn btnDanger" onClick={() => dispatch({type: 'removed', id: item.id})}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

