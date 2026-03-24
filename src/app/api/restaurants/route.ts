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

const areaCoords: Record<string, { lat: number; lon: number }> = {
  // Mumbai areas
  "bandra": { lat: 19.0596, lon: 72.8295 },
  "bandra west": { lat: 19.0596, lon: 72.8295 },
  "juhu": { lat: 19.0883, lon: 72.8264 },
  "andheri": { lat: 19.1197, lon: 72.8468 },
  "andheri east": { lat: 19.1197, lon: 72.8468 },
  "andheri west": { lat: 19.1396, lon: 72.8237 },
  "lower parel": { lat: 18.9963, lon: 72.8278 },
  "powai": { lat: 19.1173, lon: 72.9078 },
  "marine drive": { lat: 18.9438, lon: 72.8234 },
  "colaba": { lat: 18.9217, lon: 72.8332 },
  "fort": { lat: 18.9352, lon: 72.8349 },
  "chowpatty": { lat: 18.9512, lon: 72.8174 },
  "breach candy": { lat: 18.9652, lon: 72.8041 },
  "worli": { lat: 18.9922, lon: 72.8181 },
  "nariman point": { lat: 18.9738, lon: 72.8191 },
  "khar": { lat: 19.0711, lon: 72.8364 },
  "santacruz": { lat: 19.0802, lon: 72.8402 },
  "vile parle": { lat: 19.1003, lon: 72.8424 },
  "jogeshwari": { lat: 19.1358, lon: 72.8491 },
  "goregaon": { lat: 19.1647, lon: 72.8491 },
  "malad": { lat: 19.1861, lon: 72.8421 },
  "kandivali": { lat: 19.2006, lon: 72.8462 },
  "borivali": { lat: 19.2285, lon: 72.8563 },
  
  // Delhi areas
  "connaught place": { lat: 28.6315, lon: 77.2197 },
  "cp": { lat: 28.6315, lon: 77.2197 },
  "karol bagh": { lat: 28.6401, lon: 77.1893 },
  "rajouri garden": { lat: 28.6473, lon: 77.1206 },
  "saket": { lat: 28.5237, lon: 77.2102 },
  "greater kailash": { lat: 28.5494, lon: 77.2411 },
  "gk": { lat: 28.5494, lon: 77.2411 },
  "hauz khas": { lat: 28.5494, lon: 77.1803 },
  "lajpat nagar": { lat: 28.5665, lon: 77.2391 },
  "saroswati": { lat: 28.5788, lon: 77.3102 },
  "vasant kunj": { lat: 28.5206, lon: 77.1575 },
  "dwarka": { lat: 28.5921, lon: 77.0465 },
  "rohini": { lat: 28.7408, lon: 77.0820 },
  "pitampura": { lat: 28.6911, lon: 77.1372 },
  "janakpuri": { lat: 28.6290, lon: 77.0930 },
  "paharganj": { lat: 28.6416, lon: 77.2164 },
  "chandni chowk": { lat: 28.6500, lon: 77.2334 },
  "khan market": { lat: 28.5956, lon: 77.2228 },
  "lodhi estate": { lat: 28.5889, lon: 77.2208 },
  "nehru place": { lat: 28.5547, lon: 77.2497 },
  
  // Bangalore areas
  "koramangala": { lat: 12.9352, lon: 77.6245 },
  "indiranagar": { lat: 12.9783, lon: 77.6408 },
  "mg road": { lat: 12.9754, lon: 77.6060 },
  "brigade road": { lat: 12.9790, lon: 77.6190 },
  "church street": { lat: 12.9763, lon: 77.5993 },
  "shivajinagar": { lat: 12.9867, lon: 77.6031 },
  "commercial street": { lat: 12.9783, lon: 77.6069 },
  "residency road": { lat: 12.9783, lon: 77.2208 },
  "richmond road": { lat: 12.9783, lon: 77.6047 },
  "basavanagudi": { lat: 12.9416, lon: 77.5711 },
  "malleswaram": { lat: 13.0033, lon: 77.5702 },
  "rajajinagar": { lat: 13.0097, lon: 77.5519 },
  "btm layout": { lat: 12.9166, lon: 77.6101 },
  "jp nagar": { lat: 12.9166, lon: 77.5856 },
  "jayanagar": { lat: 12.9166, lon: 77.5830 },
  "whitefield": { lat: 12.9698, lon: 77.7499 },
  "electronic city": { lat: 12.8455, lon: 77.6603 },
  "hebbal": { lat: 13.0358, lon: 77.5970 },
  "sadashivanagar": { lat: 13.0209, lon: 77.5853 },
  "frazer town": { lat: 12.9913, lon: 77.6202 },
  
  // Hyderabad areas
  "jubilee hills": { lat: 17.4511, lon: 78.4123 },
  "banjara hills": { lat: 17.4156, lon: 78.4266 },
  "gachibowli": { lat: 17.4400, lon: 78.3489 },
  "madhapur": { lat: 17.4489, lon: 78.3914 },
  "hitech city": { lat: 17.4433, lon: 78.3687 },
  "kukatpally": { lat: 17.4867, lon: 78.4183 },
  "ameerpet": { lat: 17.4961, lon: 78.4557 },
  "begumpet": { lat: 17.4911, lon: 78.4746 },
  "srnagar": { lat: 17.4025, lon: 78.4331 },
  "prakash nagar": { lat: 17.3928, lon: 78.4297 },
  "panjagutta": { lat: 17.4178, lon: 78.4599 },
  "somajiguda": { lat: 17.4097, lon: 78.4675 },
  "lakdi ka pool": { lat: 17.4050, lon: 78.4580 },
  "khairatabad": { lat: 17.3903, lon: 78.4714 },
  "abids": { lat: 17.3603, lon: 78.4714 },
  "charminar": { lat: 17.3616, lon: 78.4746 },
  "secunderabad": { lat: 17.4429, lon: 78.5013 },
  "tarnaka": { lat: 17.4325, lon: 78.5523 },
  "uppal": { lat: 17.4083, lon: 78.5647 },
  "lb nagar": { lat: 17.3475, lon: 78.5513 },
  
  // Chennai areas
  "t nagar": { lat: 13.0412, lon: 80.2417 },
  "anna nagar": { lat: 13.0833, lon: 80.2667 },
  "mylapore": { lat: 13.0367, lon: 80.2717 },
  "nungambakkam": { lat: 13.0517, lon: 80.2467 },
  "thousand lights": { lat: 13.0417, lon: 80.2517 },
  "kodambakkam": { lat: 13.0567, lon: 80.2317 },
  "vadapalani": { lat: 13.0567, lon: 80.2117 },
  "ashok nagar": { lat: 13.0517, lon: 80.2217 },
  "adyar": { lat: 13.0017, lon: 80.2567 },
  "besant nagar": { lat: 12.9917, lon: 80.2667 },
  "marina beach": { lat: 13.0583, lon: 80.2833 },
  "triplicane": { lat: 13.0583, lon: 80.2667 },
  "chepauk": { lat: 13.0583, lon: 80.2583 },
  "kilpauk": { lat: 13.0667, lon: 80.2583 },
  "purasawalkam": { lat: 13.0750, lon: 80.2667 },
  
  // Pune areas
  "koregaon park": { lat: 18.5361, lon: 73.9106 },
  "kharadi": { lat: 18.5311, lon: 73.9431 },
  "viman nagar": { lat: 18.5678, lon: 73.9144 },
  "shivaji nagar": { lat: 18.5311, lon: 73.8567 },
  "fc road": { lat: 18.5303, lon: 73.8272 },
  "JM Road": { lat: 18.5317, lon: 73.8361 },
  "deccan": { lat: 18.5311, lon: 73.8428 },
  "camp": { lat: 18.5183, lon: 73.8747 },
  "kothrud": { lat: 18.5083, lon: 73.8103 },
  "aundh": { lat: 18.5633, lon: 73.8167 },
  "baner": { lat: 18.5750, lon: 73.7747 },
  "wakad": { lat: 18.5978, lon: 73.7633 },
  "balewadi": { lat: 18.5922, lon: 73.7561 },
  "hadapsar": { lat: 18.5089, lon: 73.9278 },
  "mundhwa": { lat: 18.4933, lon: 73.9389 },
  
  // Kolkata areas
  "park street": { lat: 22.5523, lon: 88.3514 },
  "ballygunge": { lat: 22.5350, lon: 88.3546 },
  "salt lake": { lat: 22.5867, lon: 88.4089 },
  "sector v": { lat: 22.5722, lon: 88.4064 },
  "garia": { lat: 22.5283, lon: 88.3978 },
  "tollygunge": { lat: 22.5006, lon: 88.3417 },
  "jadavpur": { lat: 22.4956, lon: 88.3653 },
  "bewa": { lat: 22.4756, lon: 88.3528 },
  "alipore": { lat: 22.5389, lon: 88.3361 },
  "new town": { lat: 22.5956, lon: 88.4544 },
  "rajarhat": { lat: 22.6283, lon: 88.4714 },
  "howrah": { lat: 22.5958, lon: 88.2822 },
  "baghajatin": { lat: 22.4967, lon: 88.3758 },
  "broad street": { lat: 22.5667, lon: 88.3556 },
  
  // London areas
  "soho": { lat: 51.5134, lon: -0.1385 },
  "covent garden": { lat: 51.5120, lon: -0.1222 },
  "chelsea": { lat: 51.4875, lon: -0.1687 },
  "mayfair": { lat: 51.5122, lon: -0.1506 },
  "notting hill": { lat: 51.5080, lon: -0.2044 },
  "kensington": { lat: 51.5003, lon: -0.1917 },
  "shoreditch": { lat: 51.5220, lon: -0.0794 },
  "hoxton": { lat: 51.5246, lon: -0.0792 },
  "brick lane": { lat: 51.5218, lon: -0.0712 },
  "liverpool street": { lat: 51.5175, lon: -0.0832 },
  "canary wharf": { lat: 51.5055, lon: -0.0235 },
  "westminster": { lat: 51.4975, lon: -0.1357 },
  "paddington": { lat: 51.5124, lon: -0.1760 },
  "king's cross": { lat: 51.5308, lon: -0.1238 },
  "camden": { lat: 51.5362, lon: -0.1420 },
  
  // New York areas
  "times square ny": { lat: 40.7580, lon: -73.9855 },
  "midtown ny": { lat: 40.7549, lon: -73.9840 },
  "lower east side ny": { lat: 40.7159, lon: -73.9840 },
  "williamsburg ny": { lat: 40.7081, lon: -73.9571 },
  "brooklyn ny": { lat: 40.6501, lon: -73.9496 },
  "soho ny": { lat: 40.7233, lon: -74.0030 },
  "tribeca": { lat: 40.7163, lon: -74.0086 },
  "chelsea ny": { lat: 40.7465, lon: -74.0014 },
  "upper east side ny": { lat: 40.7736, lon: -73.9566 },
  "upper west side ny": { lat: 40.7870, lon: -73.9754 },
  "harlem": { lat: 40.8116, lon: -73.9465 },
  "greenwich village ny": { lat: 40.7336, lon: -74.0027 },
  "east village ny": { lat: 40.7264, lon: -73.9833 },
  "west village ny": { lat: 40.7339, lon: -74.0029 },
  "flatiron": { lat: 40.7395, lon: -73.9903 },
  
  // Paris areas
  "marais": { lat: 48.8566, lon: 2.3522 },
  "le marais": { lat: 48.8566, lon: 2.3522 },
  "saint-germain": { lat: 48.8515, lon: 2.3333 },
  "montmartre": { lat: 48.8867, lon: 2.3431 },
  "champs elysees": { lat: 48.8708, lon: 2.3052 },
  "opera": { lat: 48.8715, lon: 2.3327 },
  "latin quarter": { lat: 48.8462, lon: 2.3450 },
  "montparnasse": { lat: 48.8421, lon: 2.3265 },
  "belleville": { lat: 48.8718, lon: 2.3791 },
  "pigalle": { lat: 48.8818, lon: 2.3324 },
  "batignolles": { lat: 48.8887, lon: 2.3127 },
  "passage": { lat: 48.8755, lon: 2.3268 },
  "chaillot": { lat: 48.8651, lon: 2.2895 },
  "-place des vosges": { lat: 48.8557, lon: 2.3650 },
  
  // Tokyo areas
  "shibuya": { lat: 35.6595, lon: 139.7004 },
  "shinjuku": { lat: 35.6896, lon: 139.6917 },
  "ginza": { lat: 35.6717, lon: 139.7630 },
  "roppongi": { lat: 35.6654, lon: 139.7307 },
  "omotesando": { lat: 35.6654, lon: 139.7121 },
  "harajuku": { lat: 35.6706, lon: 139.7125 },
  "aoyama": { lat: 35.6721, lon: 139.7125 },
  "akasaka": { lat: 35.6763, lon: 139.7403 },
  "ebisu": { lat: 35.6469, lon: 139.7100 },
  "meguro": { lat: 35.6364, lon: 139.7160 },
  "shimokitazawa": { lat: 35.6345, lon: 139.6800 },
  "nakameguro": { lat: 35.6436, lon: 139.7007 },
  "daikanyama": { lat: 35.6486, lon: 139.7028 },
  "jinnan": { lat: 35.6600, lon: 139.7000 },
  "ueno": { lat: 35.7140, lon: 139.7774 },
  
  // Lucknow areas
  "gomti nagar": { lat: 26.8467, lon: 80.9462 },
  "hazratganj": { lat: 26.8467, lon: 80.9403 },
  "mall avenue": { lat: 26.8567, lon: 80.9314 },
  "charbagh": { lat: 26.8400, lon: 80.9197 },
  "indira nagar": { lat: 26.8767, lon: 80.9531 },
  "sahara": { lat: 26.8767, lon: 80.9792 },
  "shanaz": { lat: 26.8283, lon: 80.9283 },
  "maida mill": { lat: 26.8483, lon: 80.9083 },
  "alambagh": { lat: 26.8100, lon: 80.9250 },
  "mahanagar": { lat: 26.8750, lon: 80.9250 },
  "rajaji nagar": { lat: 26.8850, lon: 80.9650 },
  "vishwas khand": { lat: 26.8450, lon: 80.9550 },
  "nirala nagar": { lat: 26.8650, lon: 80.9850 },
  "krishna nagar": { lat: 26.8150, lon: 80.9150 },
};

const R = 6371;

function isWithinRadius(lat: number, lon: number, center: { lat: number; lon: number }, radiusKm: number): boolean {
  const dLat = (lat - center.lat) * (Math.PI / 180);
  const dLon = (lon - center.lon) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(center.lat * Math.PI / 180) *
    Math.cos(lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  
  const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return distance <= radiusKm;
}

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
  const normalizedArea = area?.toLowerCase().trim();
  const areaCenter = normalizedArea ? areaCoords[normalizedArea] : null;
  
  let overpassQuery: string;
  
  if (areaCenter) {
    console.log(`[OSM] Using radius search: ${normalizedArea} at (${areaCenter.lat}, ${areaCenter.lon})`);
    
    overpassQuery = `
[out:json][timeout:30];
(
  node["amenity"="restaurant"](around:5000, ${areaCenter.lat}, ${areaCenter.lon});
  way["amenity"="restaurant"](around:5000, ${areaCenter.lat}, ${areaCenter.lon});
);
out center tags 25;
`;
  } else {
    console.log(`[OSM] Using city-wide search for: ${city}`);
    
    overpassQuery = `
[out:json][timeout:30];
area["name"="${city}"]["admin_level"~"4|6|8"]->.city;
area.city(around:50000)->.search;
(
  node["amenity"="restaurant"](area.search);
  way["amenity"="restaurant"](area.search);
);
out center tags 25;
`;
  }

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
    let elements = data.elements?.filter((e: any) => e.tags?.name) || [];
    
    if (areaCenter && elements.length > 0) {
      console.log(`[OSM] Filtering ${elements.length} results within 5km of ${normalizedArea}`);
      
      elements = elements.filter((e: any) => {
        if (e.lat && e.lon) {
          return isWithinRadius(e.lat, e.lon, areaCenter, 5);
        }
        return true;
      });
      
      console.log(`[OSM] After filtering: ${elements.length} restaurants in ${normalizedArea}`);
    }
    
    return elements;
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
