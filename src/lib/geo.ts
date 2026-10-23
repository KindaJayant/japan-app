/** Map frame: Kyushu to southern Tohoku. Equirectangular with cos(lat) correction. */
export const BBOX = { west: 129.6, east: 141.4, south: 31.0, north: 38.4 };
export const MAP_W = 1000;
const K = Math.cos(((BBOX.north + BBOX.south) / 2) * (Math.PI / 180));
export const MAP_H = Math.round((MAP_W * (BBOX.north - BBOX.south)) / ((BBOX.east - BBOX.west) * K));

export function project(lng: number, lat: number): [number, number] {
  return [((lng - BBOX.west) / (BBOX.east - BBOX.west)) * MAP_W, ((BBOX.north - lat) / (BBOX.north - BBOX.south)) * MAP_H];
}

/** Great-circle distance in km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
