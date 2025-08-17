// pages/api/receipts.ts - Add validation and error handling
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Validate image size (max 5MB)
    if (req.body.image.length > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image too large' });
    }

    // Process with Google Vision
    const [result] = await client.textDetection(req.body.image);
    const text = result.fullTextAnnotation?.text || '';
    
    // Validate receipt data
    if (!validateReceipt(text)) {
      return res.status(400).json({ error: 'Invalid receipt format' });
    }

    // Save to DB
    await prisma.receipt.create({ data });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Receipt processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
}