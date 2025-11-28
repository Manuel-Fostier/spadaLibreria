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
  'spada_sola',
  'spada_brocchiero',
  'spada_targa',
  'spada_rotella',
  'spada_due_mani',
] as const;
export type Weapon = typeof WEAPONS[number];

export const GUARDS = [
  'coda_longa',
  'coda_longa_stretta',
  'coda_longa_alta',
  'porta_di_ferro',
  'porta_di_ferro_larga',
  'porta_di_ferro_stretta',
  'guardia_alta',
  'guardia_di_testa',
  'guardia_di_faccia',
  'cinghiara_porta_di_ferro',
] as const;
export type Guard = typeof GUARDS[number];

export interface Annotation {
  id: string;
  language: 'it' | 'fr' | 'en';
  translator: string | null;
  note: string;
  weapons: Weapon[];
  guards_mentioned: Guard[];
  techniques: string[];
  measure: Measure | null;
  strategy: Strategy[];
}
