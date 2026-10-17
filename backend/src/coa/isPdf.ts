export const PDF_SIGNATURE = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
export function isPdf(file:Buffer): boolean {
  return file.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE);
}