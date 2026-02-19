export type Lesson = {
  id: string;
  title: string;
  levelRequired: number;
  summary: string;
  concept: string;
  tryIt: 'counter' | 'form' | 'effect' | 'reducer' | 'context';
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
];

