import { NextRequest, NextResponse } from "next/server";
import { type Restaurant, type Budget, type Tag } from "@/lib/data";

const COLORS = [
  "from-indigo-800 to-blue-600",
  "from-amber-900 to-orange-700",
  "from-green-900 to-teal-800",
  "from-purple-900 to-purple-700",
  "from-rose-900 to-red-700",
  "from-slate-800 to-slate-600",
  "from-blue-800 to-teal-700",
  "from-red-950 to-stone-900",
  "from-orange-800 to-amber-600",
  "from-pink-900 to-red-800",
];

function mapPriceLevel(level: number | undefined): Budget {
  switch (level) {
    case 1: return "$";
    case 2: return "$$";
    case 3: return "$$$";
    case 4: return "$$$$";
    default: return "$$";
  }
}

function inferTags(types: string[]): Tag[] {
  const tagMap: Record<string, Tag> = {
    "restaurant": "Casual",
    "bar": "Cocktail Bar",
    "cafe": "Brunch",
    "meal_takeaway": "Quick Bites",
    "meal_delivery": "Quick Bites",
    "night_club": "Late Night",
    "music_venue": "Live Music",
    "park": "Outdoor Seating",
    "pet_store": "Pet Friendly",
  };
  
  const tags: Tag[] = [];
  for (const t of types) {
    if (tagMap[t] && !tags.includes(tagMap[t])) {
      tags.push(tagMap[t]);
    }
  }
  
  if (tags.length === 0) tags.push("Casual");
  return tags.slice(0, 3);
}

function inferCuisine(types: string[]): string {
  const cuisineMap: Record<string, string> = {
    "italian_restaurant": "Italian",
    "chinese_restaurant": "Chinese",
    "japanese_restaurant": "Japanese",
    "indian_restaurant": "Indian",
    "mexican_restaurant": "Mexican",
    "thai_restaurant": "Thai",
    "korean_restaurant": "Korean",
    "french_restaurant": "French",
    "american_restaurant": "American",
    "seafood_restaurant": "Seafood",
    "steakhouse": "Steakhouse",
    "sushi_restaurant": "Japanese",
    "pizza_restaurant": "Italian",
    "burger_restaurant": "American",
    "vegetarian_restaurant": "Vegetarian Friendly",
    "vegan_restaurant": "Vegan Options",
  };
  
  for (const t of types) {
    if (cuisineMap[t]) return cuisineMap[t];
  }
  return "Contemporary";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { city?: string; query?: string };
    const city = (body.city ?? "").trim();
    const query = body.query?.trim() || `best restaurants in ${city}`;

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API requires GOOGLE_PLACES_API_KEY env var" },
        { status: 503 }
      );
    }

    // Step 1: Text Search for restaurants
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&key=${apiKey}`;
    
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error("Google Places search error:", errText);
      return NextResponse.json({ error: "Failed to search Google Places" }, { status: 502 });
    }

    const searchData = await searchRes.json() as {
      results?: Array<{
        place_id: string;
        name: string;
        formatted_address?: string;
        rating?: number;
        user_ratings_total?: number;
        price_level?: number;
        types?: string[];
        opening_hours?: { weekday_text?: string[] };
        photos?: Array<{ photo_reference: string }>;
      }>;
      status?: string;
    };

    if (searchData.status !== "OK" || !searchData.results?.length) {
      console.error("Google Places no results:", searchData);
      return NextResponse.json({ error: "No restaurants found" }, { status: 404 });
    }

    // Get top 10 results
    const results = searchData.results.slice(0, 10);

    // Step 2: Get details for each restaurant (for reviews and more info)
    const restaurants: Restaurant[] = await Promise.all(
      results.map(async (place, index) => {
        // Fetch details for additional info
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,price_level,types,opening_hours,website,formatted_phone_number,reviews,geometry&key=${apiKey}`;
        
        let details = place;
        
        try {
          const detailsRes = await fetch(detailsUrl);
          if (detailsRes.ok) {
            const detailsData = await detailsRes.json() as {
              result?: typeof place;
            };
            if (detailsData.result) {
              details = detailsData.result;
            }
          }
        } catch {
          // Use basic search data if details fail
        }

        const gReviews = (details as unknown as { reviews?: Array<{ author_name: string; rating: number; text: string; relative_time_description: string }> }).reviews ?? [];
        const reviews = gReviews.slice(0, 2).map((r) => ({
          author: r.author_name ?? "Anonymous",
          avatar: r.author_name?.[0]?.toUpperCase() ?? "A",
          rating: r.rating ?? 4,
          text: r.text?.slice(0, 200) ?? "",
          date: r.relative_time_description ?? "Recently",
        }));

        const detailsExt = details as unknown as { 
          formatted_phone_number?: string; 
          website?: string;
          geometry?: { location?: { lat: number; lng: number } };
        };

        return {
          id: `google-${place.place_id}`,
          name: details.name ?? "Unknown",
          area: details.formatted_address?.split(",")[0]?.trim() || city,
          city: city,
          cuisine: inferCuisine(details.types ?? []),
          budget: mapPriceLevel(details.price_level),
          rating: details.rating ?? 4.0,
          totalReviews: details.user_ratings_total ?? 100,
          description: `${details.name} is a popular restaurant in ${city} with excellent ratings.`,
          topDishes: ["Chef's Special", "Seasonal Menu", "House Favorite"],
          tags: inferTags(details.types ?? []),
          reviews: reviews,
          imageColor: COLORS[index % COLORS.length],
          type: "google" as const,
          badges: ["Popular"] as const,
          address: details.formatted_address,
          phoneNumber: detailsExt.formatted_phone_number,
          website: detailsExt.website,
          openingHours: details.opening_hours?.weekday_text,
          placeId: place.place_id,
          geometry: detailsExt.geometry ? {
            lat: detailsExt.geometry.location?.lat ?? 0,
            lng: detailsExt.geometry.location?.lng ?? 0,
          } : undefined,
        };
      })
    );

    return NextResponse.json({ restaurants });
  } catch (err) {
    console.error("Google Restaurants API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}