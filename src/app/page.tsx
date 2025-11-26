import BolognesePlatform from '@/components/BolognesePlatform';
import { loadGlossary, loadTreatise } from '@/lib/dataLoader';
import './globals.css';

export default function Home() {
  const glossaryData = loadGlossary();
  const treatiseData = loadTreatise('marozzo_opera_nova.yaml');

  return (
    <BolognesePlatform 
      glossaryData={glossaryData} 
      treatiseData={treatiseData} 
    />
  );
}
