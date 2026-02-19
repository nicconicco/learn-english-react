export type Flashcard = {
  id: string;
  levelRequired: number;
  front: string;
  back: string;
  tags: string[];
};

export const flashcards: Flashcard[] = [
  {id: 'fc-improve', levelRequired: 1, front: 'improve', back: 'melhorar', tags: ['verb', 'vocab']},
  {id: 'fc-achieve', levelRequired: 1, front: 'achieve', back: 'alcançar', tags: ['verb', 'vocab']},
  {id: 'fc-challenge', levelRequired: 2, front: 'challenge', back: 'desafio', tags: ['noun', 'vocab']},
  {id: 'fc-consistent', levelRequired: 2, front: 'consistent', back: 'consistente', tags: ['adj', 'vocab']},
  {id: 'fc-attempt', levelRequired: 3, front: 'attempt', back: 'tentativa', tags: ['noun', 'vocab']},
  {id: 'fc-complete', levelRequired: 3, front: 'complete', back: 'completar / concluir', tags: ['verb', 'vocab']},
];

