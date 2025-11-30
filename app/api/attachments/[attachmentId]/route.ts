import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// DELETE /api/attachments/[attachmentId] - Delete an attachment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  try {
    const { attachmentId } = await params;

    // Find the attachment
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, attachment.storedName);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete database record
    await prisma.attachment.delete({
      where: { id: attachmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
