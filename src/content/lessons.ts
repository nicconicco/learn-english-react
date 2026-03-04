export type Lesson = {
  id: string;
  title: string;
  levelRequired: number;
  summary: string;
  concept: string;
  tryIt: 'counter' | 'form' | 'effect' | 'reducer' | 'context';
  codeExamples?: Array<{
    title: string;
    doTitle?: string;
    doCode: string;
    dontTitle?: string;
    dontCode: string;
    notes?: string;
  }>;
  quiz: {
    question: string;
    choices: string[];
    answerIndex: number;
    hint: string;
  };
};

export const lessons: Lesson[] = [
  {
    id: 'state-props',
    title: 'State & Props (básico)',
    levelRequired: 1,
    summary: 'Como dados mudam (state) e como componentes recebem dados (props).',
    concept:
      'Você vai praticar `useState`, passar props, e entender re-render. Dica: pense em UI como uma função do estado.',
    tryIt: 'counter',
    quiz: {
      question: 'Quando o React re-renderiza um componente?',
      choices: ['Quando você muda uma variável local', 'Quando o state/props mudam', 'Quando o CSS muda'],
      answerIndex: 1,
      hint: 'Mudança de state/props dispara re-render; variável local não.',
    },
  },
  {
    id: 'forms',
    title: 'Forms controlados (básico)',
    levelRequired: 2,
    summary: 'Inputs com state, validação e UX simples.',
    concept:
      'Forms controlados mantêm o valor no state. Isso facilita validação, máscaras, e envio consistente.',
    tryIt: 'form',
    quiz: {
      question: 'O que caracteriza um input “controlado”?',
      choices: ['Ele tem `onChange`', 'O `value` vem do state', 'Ele usa `ref` sempre'],
      answerIndex: 1,
      hint: 'Controlado: `value={state}` e `onChange` atualiza o state.',
    },
  },
  {
    id: 'effects',
    title: 'useEffect (intermediário)',
    levelRequired: 3,
    summary: 'Sincronizar estado com “mundo externo” (ex.: fetch).',
    concept:
      '`useEffect` roda depois do render. Use para assinaturas, timers e “fetch”. Sempre limpe efeitos quando necessário.',
    tryIt: 'effect',
    quiz: {
      question: 'Quando `useEffect(() => {}, [])` roda?',
      choices: ['Em todo render', 'Somente no primeiro mount', 'Somente no unmount'],
      answerIndex: 1,
      hint: 'Array vazio = executa 1x ao montar.',
    },
  },
  {
    id: 'reducer',
    title: 'useReducer (intermediário)',
    levelRequired: 4,
    summary: 'Modelar estados mais complexos como uma “máquina de eventos”.',
    concept:
      'Quando você tem muitas transições (add/toggle/remove), `useReducer` deixa o fluxo mais previsível.',
    tryIt: 'reducer',
    quiz: {
      question: 'Em que situação `useReducer` costuma ser melhor que `useState`?',
      choices: ['Estado simples', 'Muitas transições/eventos', 'CSS difícil'],
      answerIndex: 1,
      hint: 'Reducer brilha quando há “actions” e várias transições.',
    },
  },
  {
    id: 'context',
    title: 'Context (intermediário)',
    levelRequired: 5,
    summary: 'Compartilhar dados sem prop drilling.',
    concept:
      'Context é útil para temas, usuário logado e dependências globais. Evite colocar tudo no Context sem necessidade.',
    tryIt: 'context',
    quiz: {
      question: 'Qual o problema que Context resolve bem?',
      choices: ['Prop drilling', 'TypeScript', 'Bundle size'],
      answerIndex: 0,
      hint: 'Ele evita passar props por muitas camadas.',
    },
  },
  {
    id: 'best-practices',
    title: 'Boas práticas & anti-padrões (intermediário leve)',
    levelRequired: 3,
    summary: 'Exemplos reais de “como fazer” e “como não fazer” em React.',
    concept:
      'Esta aula é um checklist prático. Leia os exemplos e tente explicar por que o “não fazer” dá bugs, re-renders desnecessários ou fica difícil de manter.',
    tryIt: 'effect',
    codeExamples: [
      {
        title: 'Não derive state de props sem necessidade',
        doTitle: 'Como fazer',
        doCode: `function Price({amount}: {amount: number}) {
  const formatted = React.useMemo(() => amount.toFixed(2), [amount]);
  return <span>R$ {formatted}</span>;
}`,
        dontTitle: 'Como não fazer',
        dontCode: `function Price({amount}: {amount: number}) {
  const [formatted, setFormatted] = React.useState(amount.toFixed(2));

  React.useEffect(() => {
    setFormatted(amount.toFixed(2));
  }, [amount]);

  return <span>R$ {formatted}</span>;
}`,
        notes:
          'No “não fazer”, você cria estado extra e efeito só para manter algo derivado. Isso abre espaço para inconsistências e renderizações a mais.',
      },
      {
        title: 'Evite atualizar state no render (sempre!)',
        doTitle: 'Como fazer',
        doCode: `function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}`,
        dontTitle: 'Como não fazer',
        dontCode: `function Counter() {
  const [count, setCount] = React.useState(0);
  setCount(count + 1); // loop de render!
  return <div>{count}</div>;
}`,
        notes: 'Atualizar state durante render causa loop infinito e trava a UI.',
      },
      {
        title: 'Keys: prefira id estável (não use índice)',
        doTitle: 'Como fazer',
        doCode: `function List({items}: {items: {id: string; text: string}[]}) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>{i.text}</li>
      ))}
    </ul>
  );
}`,
        dontTitle: 'Como não fazer',
        dontCode: `function List({items}: {items: {id: string; text: string}[]}) {
  return (
    <ul>
      {items.map((i, idx) => (
        <li key={idx}>{i.text}</li>
      ))}
    </ul>
  );
}`,
        notes:
          'Usar índice como key pode quebrar inputs/estado interno quando você reordena, insere ou remove itens no meio.',
      },
      {
        title: 'useEffect: dependa do que usa (e faça cleanup quando precisa)',
        doTitle: 'Como fazer',
        doCode: `React.useEffect(() => {
  const controller = new AbortController();
  fetch(url, {signal: controller.signal});
  return () => controller.abort();
}, [url]);`,
        dontTitle: 'Como não fazer',
        dontCode: `React.useEffect(() => {
  fetch(url);
}, []); // url muda, efeito não acompanha`,
        notes:
          'Se você usa uma variável no effect, ela deve aparecer nas dependências (ou você deve justificar por que não).',
      },
      {
        title: 'Imutabilidade: nunca mutar arrays/objetos do state',
        doTitle: 'Como fazer',
        doCode: `setItems((prev) => prev.map((i) => (i.id === id ? {...i, done: true} : i)));`,
        dontTitle: 'Como não fazer',
        dontCode: `items[0].done = true;
setItems(items);`,
        notes:
          'Mutação pode impedir o React de perceber mudanças e causa bugs sutis. Prefira criar novos objetos/arrays.',
      },
      {
        title: 'Atualize state baseado no valor anterior (updater function)',
        doTitle: 'Como fazer',
        doCode: `setCount((c) => c + 1);`,
        dontTitle: 'Como não fazer',
        dontCode: `setCount(count + 1); // pode quebrar em updates rápidos/batched`,
        notes:
          'Quando o próximo valor depende do anterior, use a função. Isso evita problemas com atualizações agrupadas.',
      },
      {
        title: 'Evite recriar objetos/arrays em props sem necessidade',
        doTitle: 'Como fazer',
        doCode: `const filters = React.useMemo(() => ({status}), [status]);
return <Table filters={filters} />;`,
        dontTitle: 'Como não fazer',
        dontCode: `return <Table filters={{status}} />; // novo objeto todo render`,
        notes:
          'Objetos/arrays literais criam nova referência e podem causar renders extras em componentes otimizados.',
      },
    ],
    quiz: {
      question: 'Qual opção é uma boa prática?',
      choices: ['Usar index como key sempre', 'Derivar UI direto de props/state', 'Dar setState durante render'],
      answerIndex: 1,
      hint: 'UI deve ser derivada de props/state. Evite derived state desnecessário e setState no render.',
    },
  },
  {
    id: 'effects-and-async',
    title: 'useEffect & async: padrões e armadilhas',
    levelRequired: 4,
    summary: 'Como evitar race conditions, dependências erradas e efeitos “fantasmas”.',
    concept:
      'Efeitos são para sincronizar com o “mundo externo”: timers, subscriptions e requests. O bug mais comum é esquecer dependências ou não fazer cleanup.',
    tryIt: 'effect',
    codeExamples: [
      {
        title: 'Não faça `async` direto no callback do effect',
        doTitle: 'Como fazer',
        doCode: `React.useEffect(() => {
  let cancelled = false;
  (async () => {
    const data = await fetch(url).then((r) => r.json());
    if (!cancelled) setData(data);
  })();
  return () => {
    cancelled = true;
  };
}, [url]);`,
        dontTitle: 'Como não fazer',
        dontCode: `React.useEffect(async () => {
  const data = await fetch(url).then((r) => r.json());
  setData(data);
}, [url]);`,
        notes:
          'O callback do effect não deve retornar uma Promise. Além disso, sem cancelamento você pode setar state após unmount.',
      },
      {
        title: 'Dependências: inclua o que você usa',
        doTitle: 'Como fazer',
        doCode: `React.useEffect(() => {
  onResize(width);
}, [onResize, width]);`,
        dontTitle: 'Como não fazer',
        dontCode: `React.useEffect(() => {
  onResize(width);
}, []); // stale closure`,
        notes:
          'Com `[]`, você “congela” valores do primeiro render. Isso causa bugs quando `width` muda.',
      },
      {
        title: 'Timers: sempre limpe no cleanup',
        doTitle: 'Como fazer',
        doCode: `React.useEffect(() => {
  const t = window.setInterval(() => setTick((x) => x + 1), 1000);
  return () => window.clearInterval(t);
}, []);`,
        dontTitle: 'Como não fazer',
        dontCode: `React.useEffect(() => {
  window.setInterval(() => setTick(tick + 1), 1000);
}, []);`,
        notes:
          'Sem cleanup você cria vazamento. E ainda tem bug do `tick + 1` (closure antiga); use updater function.',
      },
    ],
    quiz: {
      question: 'Qual é um motivo válido para usar useEffect?',
      choices: ['Calcular um valor simples', 'Sincronizar com timer/subscription/fetch', 'Formatar texto no render'],
      answerIndex: 1,
      hint: 'Effect serve para sincronização com o mundo externo.',
    },
  },
  {
    id: 'state-architecture',
    title: 'Arquitetura de state: “menos é mais”',
    levelRequired: 5,
    summary: 'Como organizar state local, global e derived state sem dor.',
    concept:
      'Boa arquitetura reduz bugs. Prefira “single source of truth”, state mínimo e derivado por cálculo. Extraia custom hooks quando começar a repetir lógica.',
    tryIt: 'reducer',
    codeExamples: [
      {
        title: 'Prefira state mínimo + valores derivados',
        doTitle: 'Como fazer',
        doCode: `const [items, setItems] = React.useState<Item[]>([]);
const completedCount = React.useMemo(
  () => items.filter((i) => i.done).length,
  [items],
);`,
        dontTitle: 'Como não fazer',
        dontCode: `const [items, setItems] = React.useState<Item[]>([]);
const [completedCount, setCompletedCount] = React.useState(0);

// agora você precisa sincronizar manualmente e vai esquecer em algum lugar`,
        notes:
          'Duplicar estado cria inconsistência. Derive `completedCount` do array (e memoize se precisar).',
      },
      {
        title: 'Quando crescer, agrupe transições com useReducer',
        doTitle: 'Como fazer',
        doCode: `type Action = {type: 'added'; text: string} | {type: 'removed'; id: string};
function reducer(state: State, action: Action): State { /* ... */ }
const [state, dispatch] = React.useReducer(reducer, initialState);`,
        dontTitle: 'Como não fazer',
        dontCode: `const [items, setItems] = React.useState<Item[]>([]);
const [draft, setDraft] = React.useState('');
const [error, setError] = React.useState<string | null>(null);
// vários estados interdependentes + handlers espalhados`,
        notes:
          'Quando muitas coisas mudam juntas, reducer deixa o fluxo mais previsível.',
      },
      {
        title: 'Extraia lógica repetida para um custom hook',
        doTitle: 'Como fazer',
        doCode: `function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  React.useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue] as const;
}`,
        dontTitle: 'Como não fazer',
        dontCode: `// copiar e colar em 4 componentes diferentes
// cada um com um pequeno bug diferente`,
        notes:
          'Custom hooks reduzem duplicação e padronizam efeitos/validações.',
      },
    ],
    quiz: {
      question: 'Qual frase descreve melhor uma boa arquitetura de state?',
      choices: ['Duplicar estado para facilitar', 'Manter estado mínimo e derivar o resto', 'Sempre usar Context'],
      answerIndex: 1,
      hint: 'Estado mínimo + derivado reduz inconsistência.',
    },
  },
];
