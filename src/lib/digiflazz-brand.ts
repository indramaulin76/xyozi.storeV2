/**
 * Normalisasi string brand/nama untuk matching API Digiflazz vs kategori lokal.
 * Trim, lowercase, rapikan spasi, dan hilangkan tanda baca/karakter spesial.
 */
export function normalizeBrand(str?: string | null): string {
  if (!str) return ""
  return str
    .trim()
    .toLowerCase()
    // ubah simbol seperti '-' ',' '(' ')' '/' menjadi spasi
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
}
