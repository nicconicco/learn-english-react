import React from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = React.createContext<{theme: Theme; toggle: () => void} | null>(null);

function ThemeBox() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeContext missing');

  const bg = ctx.theme === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.14)';
  const border = ctx.theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.2)';

  return (
    <div className="card" style={{background: bg, borderColor: border}}>
      <strong>Tema atual: {ctx.theme}</strong>
      <div className="btnRow">
        <button className="btn btnPrimary" onClick={ctx.toggle}>
          Alternar tema (Context)
        </button>
      </div>
      <p className="muted" style={{marginBottom: 0}}>
        Observe: qualquer componente abaixo do Provider pode ler <span className="kbd">theme</span> sem receber props.
      </p>
    </div>
  );
}

export function ContextTryIt() {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const value = React.useMemo(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return (
    <div className="card" style={{background: 'rgba(0,0,0,0.18)'}}>
      <p className="muted" style={{marginTop: 0}}>
        Conceitos: <span className="kbd">Context</span>, <span className="kbd">useMemo</span> para valor estável do provider.
      </p>
      <ThemeContext.Provider value={value}>
        <ThemeBox />
      </ThemeContext.Provider>
    </div>
  );
}

