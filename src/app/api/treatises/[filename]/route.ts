import { NextResponse } from 'next/server';
import { loadTreatise } from '@/lib/dataLoader';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const treatise = loadTreatise(params.filename);
    return NextResponse.json(treatise);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load treatise' },
      { status: 500 }
    );
  }
}
