// Client-safe annotation types and constants

export const MEASURES = [
  'Gioco Largo',
  'Gioco Stretto',
  'Stretta di Mezza Spada',
  'Presa',
] as const;
export type Measure = typeof MEASURES[number];

export const STRATEGIES = [
  'patient attentiste',
  'provocation',
  'invitation',
  'battement',
  'intimidation',
  'venue au fer',
] as const;
export type Strategy = typeof STRATEGIES[number];

export const WEAPONS = [
  'Spada sola',
  'Spada brocchiero',
  'Spada targa',
  'Spada rotella',
  'Spada due mani',
] as const;
export type Weapon = typeof WEAPONS[number];

export const WEAPON_TYPES = [
  'Epée aiguisée',
  'Epée émoussée',
] as const;
export type WeaponType = typeof WEAPON_TYPES[number];

export const GUARDS = [
  'Becca Cesa',
  'Becca Possa',
  'Coda Longa',
  'Coda Longa e Alta',
  'Coda Longa e Larga',
  'Coda Longa e Stretta',
  'Coda Longa e Distesa',
  'Porta di Ferro',
  'Porta di Ferro Larga',
  'Porta di Ferro Stretta',
  'Guardia Alta',
  'Guardia di Alicorno',
  'Guardia di Faccia',
  'Guardia di Testa',
  'Guardia d\'Intrare',
  'Cinghiara Porta di Ferro',
  'Guardia di Sopra Braccio',
  'Guardia di Sotto Braccio',
  
] as const;
export type Guard = typeof GUARDS[number];

// Guard categories for statistics
export const HIGH_GUARDS: Guard[] = [
  'Guardia Alta',
  'Guardia di Alicorno',
  'Guardia di Faccia',
  'Guardia di Testa',
  'Guardia d\'Intrare',
  'Becca Cesa',
  'Becca Possa',
];

export const LOW_GUARDS: Guard[] = [
  'Coda Longa',
  'Coda Longa e Alta',
  'Coda Longa e Larga',
  'Coda Longa e Stretta',
  'Coda Longa e Distesa',
  'Porta di Ferro',
  'Porta di Ferro Larga',
  'Porta di Ferro Stretta',
  'Cinghiara Porta di Ferro',
  'Guardia di Sopra Braccio',
  'Guardia di Sotto Braccio',
];

export const ENGAGEMENT_DISTANCES = [
  'Larga Misura',
  'Giusta Misura',
  'Misura Stretta',
  'Stretta di Mezza Spada',
] as const;
export type EngagementDistance = typeof ENGAGEMENT_DISTANCES[number];

export const STRIKES = [
  'Mandritto',
  'Roverso',
  'Fendente',
  'Tondo',
  'Stoccata',
  'Punta',
  'Falso',
  'Tramazone',
  'Sgualembrato',
] as const;
export type Strike = typeof STRIKES[number];

export const TARGETS = [
  'Tête',
  'Visage',
  'Bras',
  'Main',
  'Torse',
  'Jambe',
  'Pied',
] as const;
export type Target = typeof TARGETS[number];

export interface Annotation {
  id: string;  
  note: string | null;
  weapons: Weapon[] | null;
  weapon_type: WeaponType | null;
  guards_mentioned: Guard[] | null;
  techniques: string[] | null;
  measures: Measure[] | null;
  strategy: Strategy[] | null;
  engagement_distances: EngagementDistance[] | null;
  strikes: Strike[] | null;
  targets: Target[] | null;
}
