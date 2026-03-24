import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Forkd/1.0",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await response.json();

    const suggestions = data
      .filter((item: { addresstype: string }) => 
        ["city", "town", "village", "suburb", "neighbourhood"].includes(item.addresstype)
      )
      .slice(0, 5)
      .map((item: { display_name: string; address: Record<string, string>; lat: string; lon: string }) => {
        const addr = item.address;
        
        let city = addr.city || addr.town || addr.village || addr.municipality || "";
        let area = addr.suburb || addr.neighbourhood || addr.quarter || "";
        let state = addr.state || "";
        let country = addr.country || "";

        if (!city && addr.county) {
          city = addr.county;
        }

        const fullLocation = [area, city, state, country].filter(Boolean).join(", ");

        return {
          displayName: item.display_name,
          location: fullLocation || city,
          city,
          area,
          state,
          country,
          lat: item.lat,
          lon: item.lon,
        };
      })
      .filter((s: { city: string }) => s.city);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
