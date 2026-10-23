export type LatLngTuple = [number, number];

/** Nilai prop `view` MapView. */
export type PetaView = 'world' | 'indonesia' | { bounds: [LatLngTuple, LatLngTuple] };

export const BOUNDS: Record<'world' | 'indonesia', [LatLngTuple, LatLngTuple]> = {
  world: [
    [-58, -172],
    [80, 178],
  ],
  indonesia: [
    [-13, 94],
    [10, 143],
  ],
};

/** Resolusi `view` MapView menjadi bounds Leaflet. */
export function boundsUntuk(view: PetaView = 'world'): [LatLngTuple, LatLngTuple] {
  // Konten MDX kadang mengirim nilai di luar kontrak ("ocean", "lake", dst.)
  // yang tidak ada di BOUNDS. Jangan biarkan fitBounds melempar
  // "Bounds are not valid" — jatuh ke tampilan dunia.
  if (view && typeof view === 'object' && Array.isArray(view.bounds)) {
    return view.bounds;
  }
  return BOUNDS[view as 'world' | 'indonesia'] ?? BOUNDS.world;
}
