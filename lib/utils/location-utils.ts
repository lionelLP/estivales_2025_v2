/**
 * Génère une URL Google Maps pour une adresse donnée
 */
export function getGoogleMapsUrl(address: string): string {
  if (!address) return "";
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}
