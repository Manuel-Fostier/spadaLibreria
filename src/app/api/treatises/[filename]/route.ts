import { NextResponse } from 'next/server';
import { loadTreatise } from '@/lib/dataLoader';

export async function GET(
  request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const treatise = loadTreatise(filename);
    return NextResponse.json(treatise);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load treatise' },
      { status: 500 }
    );
  }
}
