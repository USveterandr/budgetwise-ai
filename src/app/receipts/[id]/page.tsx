// Generate static params for export
export async function generateStaticParams() {
  // Return mock params for static export
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

import ReceiptDetailClient from './ReceiptDetailClient';

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ReceiptDetailClient id={resolvedParams.id} />;
}