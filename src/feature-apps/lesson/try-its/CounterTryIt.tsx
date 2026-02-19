import React from 'react';

function CounterButton({label, onClick}: {label: string; onClick: () => void}) {
  return (
    <button className="btn" onClick={onClick}>
      {label}
    </button>
  );
}

export function CounterTryIt() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
      <p className="muted" style={{marginTop: 0}}>
        Conceitos: <span className="kbd">useState</span>, props, eventos.
      </p>
      <h3 style={{marginTop: 0}}>
        Count: <span className="kbd">{count}</span>
      </h3>
      <div className="btnRow">
        <CounterButton label="-1" onClick={() => setCount((c) => c - 1)} />
        <CounterButton label="+1" onClick={() => setCount((c) => c + 1)} />
        <CounterButton label="Reset" onClick={() => setCount(0)} />
      </div>
    </div>
  );
}

