import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildStoragePath, generatePresignedUploadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// Step 1: request a presigned URL for a private document upload.
export async function POST(request: Request) {
  try {
    const { valuationId, fileName, contentType } = await request.json();
    if (!valuationId || !fileName) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }
    const exists = await prisma.valuationRequest.findUnique({ where: { id: String(valuationId) }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ success: false, message: 'Invalid valuation' }, { status: 404 });
    }

    const cloudStoragePath = buildStoragePath(String(fileName));
    const uploadUrl = await generatePresignedUploadUrl(cloudStoragePath, String(contentType || 'application/octet-stream'));

    return NextResponse.json({ success: true, uploadUrl, cloudStoragePath });
  } catch (err: any) {
    console.error('Upload presign error:', err?.message ?? err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
