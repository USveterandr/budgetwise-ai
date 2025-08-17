// src/utils/validation.ts
export function validateReceipt(text: string) {
  const requiredPatterns = [
    /total|amount|sum/i,
    /\$\d+\.\d{2}/,
    /\d{4}-\d{2}-\d{2}/ // Date pattern
  ];

  return requiredPatterns.every(pattern => 
    pattern.test(text.toLowerCase())
  );
}