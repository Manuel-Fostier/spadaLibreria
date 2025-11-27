import BolognesePlatform from '@/components/BolognesePlatform';
import { loadGlossary, loadTreatise, Annotation } from '@/lib/dataLoader';
import { AnnotationProvider } from '@/contexts/AnnotationContext';
import './globals.css';

export default function Home() {
  const glossaryData = loadGlossary();
  const treatiseData = loadTreatise('marozzo_opera_nova.yaml');

  // Extraire les annotations des sections et créer la Map initiale
  const initialAnnotations = new Map<string, Annotation[]>();
  treatiseData.forEach(section => {
    if (section.annotations && section.annotations.length > 0) {
      initialAnnotations.set(section.id, section.annotations);
    }
  });

  return (
    <AnnotationProvider initialAnnotations={initialAnnotations}>
      <BolognesePlatform 
        glossaryData={glossaryData} 
        treatiseData={treatiseData} 
      />
    </AnnotationProvider>
  );
}
