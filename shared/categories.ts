export const CATEGORIES = [
  'Environment',
  'Transport',
  'Housing',
  'Safety',
  'Education',
  'Health',
  'Food & Gardening',
  'Arts & Culture',
  'Community Events',
  'Infrastructure',
] as const;

export type Category = typeof CATEGORIES[number];

const PALETTE = [
  '#e57373', 
  '#f09558', 
  '#f6c343', 
  '#81c784', 
  '#4db6ac',
  '#4fc3f7', 
  '#7986cb', 
  '#ba68c8', 
  '#f06292', 
  '#a1887f', 
];

export function categoryColour(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) & 0xffffffff;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}