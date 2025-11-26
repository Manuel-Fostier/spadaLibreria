import { NextResponse } from 'next/server';
import { loadGlossary } from '@/lib/dataLoader';

export async function GET() {
  try {
    const glossary = loadGlossary();
    return NextResponse.json(glossary);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load glossary' },
      { status: 500 }
    );
  }
}
