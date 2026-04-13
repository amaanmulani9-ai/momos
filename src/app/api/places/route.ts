import { NextRequest, NextResponse } from 'next/server';

/** Proxy to Photon (Komoot) — free geocoder, no API key. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json({ places: [] }, { status: 200 });
    }
    const data = (await res.json()) as {
      features?: Array<{
        geometry?: { coordinates?: [number, number] };
        properties?: Record<string, string | undefined>;
      }>;
    };

    const places =
      data.features?.map((f) => {
        const p = f.properties ?? {};
        const name = String(p.name ?? '');
        const city = String(p.city ?? p.county ?? '');
        const state = String(p.state ?? '');
        const country = String(p.country ?? '');
        const label = [name, city, state, country].filter(Boolean).join(', ');
        const coords = f.geometry?.coordinates;
        return {
          label,
          area: city || state || country || name,
          address: label,
          lat: coords?.[1],
          lon: coords?.[0],
          placeId: p.osm_id != null ? `osm:${p.osm_type ?? 'n'}:${p.osm_id}` : undefined,
        };
      }) ?? [];

    return NextResponse.json({ places: places.filter((p) => p.label.length > 0) });
  } catch {
    return NextResponse.json({ places: [] });
  }
}
