import BolognesePlatform from '@/components/BolognesePlatform';
import { loadGlossary, loadAllTreatises, Annotation } from '@/lib/dataLoader';
import { AnnotationProvider } from '@/contexts/AnnotationContext';
import { AnnotationDisplayProvider } from '@/contexts/AnnotationDisplayContext';
import { SearchProvider } from '@/contexts/SearchContext';
import './globals.css';

export default function Home() {
  const glossaryData = loadGlossary();
  const treatiseData = loadAllTreatises();

  // Extraire les annotations des sections et créer la Map initiale
  const initialAnnotations = new Map<string, Annotation>();
  treatiseData.forEach(section => {
    if (section.annotation) {
      initialAnnotations.set(section.id, section.annotation);
    }
  });

  return (
    <AnnotationDisplayProvider>
      <AnnotationProvider initialAnnotations={initialAnnotations}>
        <SearchProvider treatiseData={treatiseData} glossaryData={glossaryData}>
          <BolognesePlatform 
            glossaryData={glossaryData} 
            treatiseData={treatiseData} 
          />
        </SearchProvider>
      </AnnotationProvider>
    </AnnotationDisplayProvider>
  );
}
