import { NextRequest, NextResponse } from 'next/server';
import { loadGlossary } from '@/lib/dataLoaderServer';
import { GlossaryData } from '@/types/data';
import { GlossaryTerm } from '@/types/glossary';

/**
 * GET /api/content/glossary
 * 
 * Returns all glossary terms as a JSON array.
 * Server-side API ensures fs module access is available.
 */
export async function GET(request: NextRequest) {
  try {
    const glossaryData: GlossaryData = loadGlossary();

    // Convert to array format with ID field
    const glossaryTerms: GlossaryTerm[] = Object.entries(glossaryData).map(([id, entry]) => ({
      id,
      ...entry
    }));

    return NextResponse.json(glossaryTerms);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load glossary';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
