import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Step 2: record the uploaded document against the valuation request.
export async function POST(request: Request) {
  try {
    const { valuationId, categoria, nomFitxer, cloudStoragePath, contentType, mida } = await request.json();
    if (!valuationId || !categoria || !nomFitxer || !cloudStoragePath) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }
    const exists = await prisma.valuationRequest.findUnique({ where: { id: String(valuationId) }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ success: false, message: 'Invalid valuation' }, { status: 404 });
    }

    const doc = await prisma.valuationDocument.create({
      data: {
        valuationId: String(valuationId),
        categoria: String(categoria),
        nomFitxer: String(nomFitxer),
        cloudStoragePath: String(cloudStoragePath),
        isPublic: false,
        contentType: contentType ? String(contentType) : null,
        mida: typeof mida === 'number' ? Math.round(mida) : null,
      },
    });

    // Mark the request as having documentation for CORPAND's refined review.
    await prisma.valuationRequest.update({
      where: { id: String(valuationId) },
      data: { status: 'amb_documentacio' },
    });

    return NextResponse.json({ success: true, id: doc.id });
  } catch (err: any) {
    console.error('Upload complete error:', err?.message ?? err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
