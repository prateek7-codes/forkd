import { NextRequest, NextResponse } from "next/server";
import { type Restaurant, type Tag } from "@/lib/data";

const COLORS = [
  "from-orange-600 to-red-500",
  "from-amber-600 to-yellow-500",
  "from-rose-600 to-pink-500",
  "from-emerald-600 to-teal-500",
  "from-violet-600 to-purple-500",
  "from-indigo-600 to-blue-500",
  "from-cyan-600 to-teal-500",
  "from-lime-600 to-green-500",
];

const cuisineTags: Record<string, string[]> = {
  indian: ["North Indian", "South Indian", "Biryani", "Tandoor"],
  chinese: ["Chinese", "Asian", "Pan-Asian"],
  italian: ["Italian", "Pizza", "Pasta"],
  japanese: ["Japanese", "Sushi", "Ramen"],
  mexican: ["Mexican", "Tacos", "Burritos"],
  american: ["American", "Burgers", "Fast Food"],
  "north indian": ["North Indian", "Mughlai", "Punjabi"],
  "south indian": ["South Indian", "Dosa", "Idli"],
  cafe: ["Cafe", "Coffee", "Bakery"],
  restaurant: ["Indian", "Multi-cuisine"],
};

const globalCuisines = [
  "Indian", "Chinese", "Italian", "Japanese", "Mexican", "American",
  "Thai", "Korean", "Mediterranean", "Continental", "Seafood", "Cafe"
];

const tags = [
  ["Family Friendly", "Large Groups", "Casual"],
  ["Romantic", "Fine Dining", "Cocktail Bar"],
  ["Trendy", "Quick Bites", "Late Night"],
  ["Outdoor Seating", "Brunch", "Vegetarian Friendly"],
  ["Large Groups", "Live Music", "Rooftop"],
];

interface CacheEntry {
  data: Restaurant[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000;

function getFromCache(key: string): Restaurant[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: Restaurant[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchFromOSM(city: string, area?: string): Promise<any[]> {
  const searchArea = area ? `${area}, ${city}` : city;
  
  const overpassQuery = `
[out:json][timeout:25];
area["name"="${city}"]["admin_level"~"4|6|8"]->.city;
area.city(around:50000)->.search;
(
  node["amenity"="restaurant"](area.search);
  way["amenity"="restaurant"](area.search);
);
out center tags 30;
`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error("[OSM] Overpass API error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.elements?.filter((e: any) => e.tags?.name) || [];
  } catch (error) {
    console.error("[OSM] Fetch error:", error);
    return [];
  }
}

function generatePseudoRandom(seed: number, idx: number): number {
  const hash = seed * 1000 + idx * 17 + 7;
  return ((hash * 9301 + 49297) % 233280) / 233280;
}

function enrichRestaurant(
  osmData: any,
  city: string,
  area: string,
  index: number
): Restaurant {
  const citySeed = city.length;
  const rand = () => generatePseudoRandom(citySeed, index);
  const rating = 3.8 + rand() * 0.9;
  const reviews = Math.floor(100 + rand() * 3000);
  
  const cuisineKey = osmData.tags?.cuisine?.toLowerCase() || "restaurant";
  const cuisineOptions = cuisineTags[cuisineKey] || globalCuisines;
  const cuisine = cuisineOptions[Math.floor(rand() * cuisineOptions.length)];
  
  const budgetOptions = ["$", "$$", "$$$", "$$$$"];
  const budget = budgetOptions[Math.floor(rand() * budgetOptions.length)] as any;
  
  const dishes = [
    "Chef's Special", "House Favorite", "Signature Dish", 
    "Seasonal Delight", "Traditional Recipe"
  ];
  const selectedDishes = [
    dishes[Math.floor(rand() * dishes.length)],
    dishes[Math.floor(rand() * dishes.length)],
  ].filter((d, i, a) => a.indexOf(d) === i);
  
  const tagOptions: Tag[][] = [
    ["Family Friendly", "Large Groups", "Casual"],
    ["Romantic", "Fine Dining", "Cocktail Bar"],
    ["Trendy", "Quick Bites", "Late Night"],
    ["Outdoor Seating", "Brunch", "Vegetarian Friendly"],
    ["Large Groups", "Live Music", "Rooftop"],
  ];

  return {
    id: `osm-${city.toLowerCase()}-${index}`,
    name: osmData.tags.name,
    area: area || osmData.tags.suburb || osmData.tags.neighbourhood || "Downtown",
    city,
    cuisine,
    budget,
    rating: Math.round(rating * 10) / 10,
    totalReviews: reviews,
    description: `A popular dining destination in ${city}, known for its excellent ${cuisine.toLowerCase()} cuisine and welcoming atmosphere.`,
    topDishes: selectedDishes,
    tags: tagOptions[Math.floor(rand() * tagOptions.length)],
    reviews: [],
    imageColor: COLORS[index % COLORS.length],
    type: "ai",
    badges: index === 0 ? ["AI Suggested"] : undefined,
  };
}

function buildEnrichPrompt(restaurants: any[], city: string): string {
  const names = restaurants.slice(0, 10).map((r: any) => r.tags?.name).join(", ");
  
  return `You are a restaurant data enrichment assistant.

Given these REAL restaurant names found in ${city}:
[${names}]

For EACH restaurant, enrich with this EXACT JSON structure (no additional text):
{
  "name": "restaurant name from above",
  "rating": 3.8-4.7,
  "cuisine": "primary cuisine type",
  "topDishes": ["dish1", "dish2", "dish3"],
  "description": "1-2 sentence description mentioning ONLY ${city}"
}

Return ONLY a valid JSON array of ${Math.min(10, restaurants.length)} objects. No markdown, no explanation.`;
}

async function enrichWithAI(restaurants: any[], city: string): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return restaurants;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: buildEnrichPrompt(restaurants, city),
          },
        ],
      }),
    });

    if (!response.ok) {
      return restaurants;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (error) {
    console.error("[AI] Enrichment error:", error);
  }

  return restaurants;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { city?: string; area?: string };
    const city = (body.city ?? "").trim();
    const area = (body.area ?? "").trim();

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const cacheKey = `${city.toLowerCase()}_${area.toLowerCase() || "all"}`;
    console.log(`[RESTAURANTS API] Request for city: ${city}, area: ${area}, cacheKey: ${cacheKey}`);
    
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log(`[RESTAURANTS API] Returning cached results for ${cacheKey}`);
      return NextResponse.json({ restaurants: cached, source: "cache" });
    }

    console.log(`[RESTAURANTS API] Fetching from OSM for ${city}...`);
    let osmData = await fetchFromOSM(city, area);
    
    if (osmData.length === 0) {
      console.log(`[RESTAURANTS API] No OSM data, trying broader search for ${city}...`);
      const fallbackQuery = `
[out:json][timeout:30];
area["name"="${city}"]->.city;
area.city(around:100000)->.search;
(
  node["amenity"="restaurant"](area.search);
  way["amenity"="restaurant"](area.search);
);
out center tags 25;
`;
      try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: fallbackQuery,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const data = await response.json();
        osmData = data.elements?.filter((e: any) => e.tags?.name) || [];
      } catch (e) {
        console.error("[RESTAURANTS API] Fallback OSM fetch failed");
      }
    }

    console.log(`[RESTAURANTS API] Found ${osmData.length} restaurants from OSM`);

    if (osmData.length === 0) {
      return NextResponse.json(
        { error: "No restaurants found in this location. Try a different city or area." },
        { status: 404 }
      );
    }

    const osmtpRestaurants = osmData.slice(0, 20).map((r: any, idx: number) => 
      enrichRestaurant(r, city, area, idx)
    );

    const enriched = await enrichWithAI(osmData.slice(0, 10), city);
    
    if (enriched && enriched.length > 0 && typeof enriched[0] === 'object' && enriched[0].rating) {
      enriched.forEach((item: any, idx: number) => {
        if (item.name && osmtpRestaurants[idx]) {
          osmtpRestaurants[idx].rating = item.rating;
          osmtpRestaurants[idx].cuisine = item.cuisine || osmtpRestaurants[idx].cuisine;
          osmtpRestaurants[idx].topDishes = item.topDishes || osmtpRestaurants[idx].topDishes;
          osmtpRestaurants[idx].description = item.description || osmtpRestaurants[idx].description;
        }
      });
    }

    setCache(cacheKey, osmtpRestaurants);
    console.log(`[RESTAURANTS API] Cached and returning ${osmtpRestaurants.length} restaurants`);

    return NextResponse.json({ 
      restaurants: osmtpRestaurants,
      source: "osm",
      total: osmData.length
    });
  } catch (err) {
    console.error("[RESTAURANTS API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
