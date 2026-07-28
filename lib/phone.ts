/**
 * Normalizes a Cameroonian phone number into the format required by
 * wa.me links (digits only, with the 237 country code).
 * Handles numbers entered with or without the country code, spaces,
 * a leading +, or a leading 0.
 */
export function formatWhatsAppNumber(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");

  if (digits.startsWith("237")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `237${digits}`;
}
