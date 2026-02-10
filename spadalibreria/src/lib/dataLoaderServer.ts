// Server-only module for loading YAML data files
// This file uses Node.js APIs (fs, path) and should only be imported from API routes or server components

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { GlossaryData, TreatiseSection } from '@/types/data';

/**
 * Load glossary data from data/glossary.yaml
 * Server-side only: uses fs and path modules
 */
export function loadGlossary(): GlossaryData {
  const filePath = path.join(process.cwd(), 'data', 'glossary.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContents) as GlossaryData;
}

/**
 * Load all treatise sections from data/treatises/*.yaml
 * Server-side only: uses fs and path modules
 */
export function loadAllTreatises(): TreatiseSection[] {
  const treatisesDir = path.join(process.cwd(), 'data', 'treatises');
  const files = fs.readdirSync(treatisesDir).filter(file => file.endsWith('.yaml'));
  
  let allSections: TreatiseSection[] = [];
  for (const file of files) {
    const filePath = path.join(treatisesDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const sections = yaml.load(fileContents) as TreatiseSection[];
    // Inject filename into each section
    const sectionsWithFile = sections.map(section => ({
      ...section,
      fileName: file
    }));
    allSections = allSections.concat(sectionsWithFile);
  }
  
  return allSections;
}
