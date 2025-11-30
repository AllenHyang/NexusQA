import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types for evidence uploads
const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/json',
];

// Max file size: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

// Upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// POST /api/attachments - Upload file(s)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const executionId = formData.get('executionId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!executionId) {
      return NextResponse.json({ error: 'executionId is required' }, { status: 400 });
    }

    if (!uploadedBy) {
      return NextResponse.json({ error: 'uploadedBy is required' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Verify execution record exists
    const execution = await prisma.executionRecord.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution record not found' }, { status: 404 });
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const uploadedAttachments = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          error: `File type not allowed: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`
        }, { status: 400 });
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        return NextResponse.json({
          error: `File too large: ${file.name}. Max size: 10MB`
        }, { status: 400 });
      }

      // Generate unique filename
      const ext = path.extname(file.name);
      const storedName = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, storedName);

      // Save file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Create attachment record in database
      const attachment = await prisma.attachment.create({
        data: {
          filename: file.name,
          storedName,
          mimeType: file.type,
          size: file.size,
          url: `/uploads/${storedName}`,
          executionId,
          uploadedBy,
        }
      });

      uploadedAttachments.push(attachment);
    }

    return NextResponse.json({
      success: true,
      count: uploadedAttachments.length,
      attachments: uploadedAttachments
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}

// GET /api/attachments?executionId=xxx - Get attachments for an execution
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json({ error: 'executionId is required' }, { status: 400 });
    }

    const attachments = await prisma.attachment.findMany({
      where: { executionId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}
