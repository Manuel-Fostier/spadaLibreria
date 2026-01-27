import { loadGlossary } from '@/lib/dataLoader';
import GlossaryPageClient from '@/components/GlossaryPageClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GlossaryPage() {
  const glossaryData = loadGlossary();

  return (
    <div>
      {/* Back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la plateforme</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <GlossaryPageClient glossaryData={glossaryData} />
    </div>
  );
}
