import { NextRequest, NextResponse } from "next/server";
import { type Restaurant, type Budget, type Tag, type Review } from "@/lib/data";

interface CacheEntry {
  data: Restaurant[];
  timestamp: number;
}

// In-memory cache with TTL
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

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

function getCacheKey(city: string): string {
  return `google-restaurants:${city.toLowerCase().trim()}`;
}

function getCachedData(city: string): Restaurant[] | null {
  const key = getCacheKey(city);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(city: string, data: Restaurant[]): void {
  const key = getCacheKey(city);
  cache.set(key, { data, timestamp: Date.now() });
}

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
    restaurant: "Casual",
    bar: "Cocktail Bar",
    cafe: "Brunch",
    meal_takeaway: "Quick Bites",
    meal_delivery: "Quick Bites",
    night_club: "Late Night",
    music_venue: "Live Music",
    park: "Outdoor Seating",
    pet_store: "Pet Friendly",
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
    italian_restaurant: "Italian",
    chinese_restaurant: "Chinese",
    japanese_restaurant: "Japanese",
    indian_restaurant: "Indian",
    mexican_restaurant: "Mexican",
    thai_restaurant: "Thai",
    korean_restaurant: "Korean",
    french_restaurant: "French",
    american_restaurant: "American",
    seafood_restaurant: "Seafood",
    steakhouse: "Steakhouse",
    sushi_restaurant: "Japanese",
    pizza_restaurant: "Italian",
    burger_restaurant: "American",
    vegetarian_restaurant: "Vegetarian Friendly",
    vegan_restaurant: "Vegan Options",
  };

  for (const t of types) {
    if (cuisineMap[t]) return cuisineMap[t];
  }
  return "Contemporary";
}

interface GooglePlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  opening_hours?: { weekday_text?: string[] };
  photos?: Array<{ photo_reference: string }>;
  next_page_token?: string;
}

interface GooglePlaceDetails {
  result?: {
    name: string;
    formatted_address?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types?: string[];
    opening_hours?: { weekday_text?: string[] };
    website?: string;
    formatted_phone_number?: string;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      relative_time_description: string;
    }>;
    geometry?: {
      location?: { lat: number; lng: number };
    };
  };
  status?: string;
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<GooglePlaceDetails["result"] | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,price_level,types,opening_hours,website,formatted_phone_number,reviews,geometry&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as GooglePlaceDetails;
    return data.result ?? null;
  } catch {
    return null;
  }
}

function transformToRestaurant(
  place: GooglePlaceSearchResult,
  details: GooglePlaceDetails["result"] | null,
  city: string,
  index: number
): Restaurant {
  const name = details?.name ?? place.name ?? "Unknown";
  const types = details?.types ?? place.types ?? [];
  const address = details?.formatted_address ?? place.formatted_address;
  const rating = details?.rating ?? place.rating ?? 4.0;
  const totalReviews = details?.user_ratings_total ?? place.user_ratings_total ?? 100;

  const reviews: Review[] = (details?.reviews ?? []).slice(0, 2).map((r) => ({
    author: r.author_name ?? "Anonymous",
    avatar: r.author_name?.[0]?.toUpperCase() ?? "A",
    rating: r.rating ?? 4,
    text: r.text?.slice(0, 200) ?? "",
    date: r.relative_time_description ?? "Recently",
  }));

  return {
    id: `google-${place.place_id}`,
    name,
    area: address?.split(",")[0]?.trim() ?? city,
    city,
    cuisine: inferCuisine(types),
    budget: mapPriceLevel(details?.price_level ?? place.price_level),
    rating,
    totalReviews,
    description: `${name} is a popular restaurant in ${city} with excellent ratings.`,
    topDishes: ["Chef's Special", "Seasonal Menu", "House Favorite"],
    tags: inferTags(types),
    reviews,
    imageColor: COLORS[index % COLORS.length],
    type: "google",
    badges: ["Popular"],
    address,
    phoneNumber: details?.formatted_phone_number,
    website: details?.website,
    openingHours: details?.opening_hours?.weekday_text,
    placeId: place.place_id,
    geometry: details?.geometry ? {
      lat: details.geometry.location?.lat ?? 0,
      lng: details.geometry.location?.lng ?? 0,
    } : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      city?: string;
      query?: string;
      pageToken?: string;
    };
    const city = (body.city ?? "").trim();
    const query = body.query?.trim() || `best restaurants in ${city}`;
    const pageToken = body.pageToken;

    if (!city) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API requires GOOGLE_PLACES_API_KEY env var" },
        { status: 503 }
      );
    }

    // Check cache for first page
    if (!pageToken) {
      const cached = getCachedData(city);
      if (cached) {
        return NextResponse.json({
          restaurants: cached,
          fromCache: true,
        });
      }
    }

    // Build search URL
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&key=${apiKey}`;
    if (pageToken) {
      searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${apiKey}`;
    }

    // Wait for next_page_token to become active (Google requires brief delay)
    if (pageToken) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error("Google Places search error:", errText);
      return NextResponse.json(
        { error: "Failed to search Google Places" },
        { status: 502 }
      );
    }

    const searchData = await searchRes.json() as {
      results?: GooglePlaceSearchResult[];
      next_page_token?: string;
      status?: string;
    };

    // Handle API-specific errors
    if (searchData.status === "OVER_QUERY_LIMIT") {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (searchData.status === "REQUEST_DENIED") {
      return NextResponse.json(
        { error: "Invalid API key. Please check your Google API key." },
        { status: 401 }
      );
    }

    if (searchData.status !== "OK" || !searchData.results?.length) {
      if (!pageToken) {
        return NextResponse.json(
          { error: "No restaurants found", results: [] },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "No more results", results: [] },
        { status: 200 }
      );
    }

    // Limit results per page
    const results = searchData.results.slice(0, 20);
    const nextPageToken = searchData.next_page_token;

    // Fetch details for each restaurant in parallel
    const detailsPromises = results.map((place) => fetchPlaceDetails(place.place_id, apiKey));
    const detailsResults = await Promise.all(detailsPromises);
    
    const restaurants: Restaurant[] = results.map((place, index) =>
      transformToRestaurant(place, detailsResults[index], city, index)
    );

    const response: {
      restaurants: Restaurant[];
      nextPageToken?: string;
      fromCache?: boolean;
    } = { restaurants };

    // Cache first page results
    if (!pageToken) {
      setCachedData(city, restaurants);
      response.fromCache = true;
    }

    if (nextPageToken) {
      response.nextPageToken = nextPageToken;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("Google Restaurants API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
