// Client-safe metadata types and constants

// Authors list - populated from treatise data
// Add new authors here as more treatises are added to the platform
export const AUTHORS = [
  'achille_marozzo',
] as const;
export type Author = typeof AUTHORS[number];

// Labels for display in UI
export const AUTHOR_LABELS: Record<Author, string> = {
  'achille_marozzo': 'Achille Marozzo',
};
