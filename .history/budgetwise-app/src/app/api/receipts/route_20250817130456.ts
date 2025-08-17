import { NextResponse } from 'next/server';
import { validateReceipt } from '@/utils/validation';
import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { getGoogleVisionClient } from '@/utils/googleVisionClient';

const storage = new Storage();
const secretClient = new SecretManagerServiceClient();

export async function POST(req: Request) {
  try {
    const { image, userId } = await req.json();

    // Validate image size
    if (image.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large (max 5MB)' },
        { status: 413 }
      );
    }


    // Get Google Vision credentials from Secret Manager
    const [secret] = await secretClient.accessSecretVersion({
      name: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
    });
    const credentials = JSON.parse(secret.payload?.data?.toString() || '{}');

    // Initialize Google Vision client
    const client = getGoogleVisionClient(credentials, process.env.GOOGLE_PROJECT_ID);

    // Process with Google Vision
    const [result] = await client.textDetection(image);
    const text = result.fullTextAnnotation?.text || '';

    if (!validateReceipt(text)) {
      return NextResponse.json(
        { error: 'Invalid receipt format' },
        { status: 400 }
      );
    }

    // Save to R2 storage
    const fileName = `${userId}/${Date.now()}.jpg`;
    await storage.bucket(process.env.R2_BUCKET!)
      .file(fileName)
      .save(image, { metadata: { contentType: 'image/jpeg' } });

    return NextResponse.json({ 
      success: true,
      fileName,
      text
    }, { status: 200 });
  } catch (error) {
    console.error('Receipt processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}