import { NextRequest, NextResponse } from "next/server";
import { type Restaurant } from "@/lib/data";

const COLORS = [
  "from-indigo-800 to-blue-600",
  "from-amber-900 to-orange-700",
  "from-green-900 to-teal-800",
  "from-purple-900 to-purple-700",
  "from-rose-900 to-red-700",
  "from-slate-800 to-slate-600",
  "from-blue-800 to-teal-700",
  "from-red-950 to-stone-900",
];

function buildPrompt(city: string, area?: string): string {
  const location = area ? `${area}, ${city}` : city;
  
  return `You are a restaurant recommendation assistant for a group dining app called Forkd.

STRICT REQUIREMENTS:
1. ALL 15 restaurants MUST be located in "${city}" ONLY
2. Do NOT include any restaurants from other cities or countries
3. NEVER mention any other city in descriptions, reviews, or anywhere
4. Each restaurant's "city" field must be EXACTLY "${city}"
5. Each restaurant's "area" field must be a real neighborhood in ${city}
6. Results must be UNIQUE and DIFFERENT each time - vary the restaurants you recommend
7. If area is provided ("${area}"), prioritize restaurants in that specific neighborhood

For each restaurant, return:

{
  id: string,           // unique, e.g. "${city.toLowerCase()}-1"
  name: string,         // realistic restaurant name (vary these!)
  area: string,         // REAL neighborhood in ${city}
  city: string,         // MUST be exactly "${city}"
  cuisine: string,      // cuisine appropriate for ${city} (e.g., sushi in Tokyo, biryani in Hyderabad)
  budget: "$" | "$$" | "$$$" | "$$$$",
  rating: number,       // 3.8 to 4.7
  totalReviews: number, // 100 to 5000
  description: string,  // about the restaurant - mention ONLY ${city}
  topDishes: string[],  // popular dishes there
  tags: string[],       // vibe tags
  reviews: Array<{author, avatar, rating, text, date}>
  imageColor: string,   // from: ${COLORS.join(", ")}
  isManuallyAdded: false
}

Generate 15 DIFFERENT, UNIQUE restaurants for "${location}". No duplicates!

Return ONLY valid JSON array of 15 objects.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { city?: string; area?: string };
    const city = (body.city ?? "").trim();
    const area = (body.area ?? "").trim();

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return curated fallback data
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI suggestions require an Anthropic API key (ANTHROPIC_API_KEY env var)" },
        { status: 503 }
      );
    }

    const prompt = buildPrompt(city, area);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 6000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return NextResponse.json(
        { error: "Failed to get AI suggestions" },
        { status: 502 }
      );
    }

    interface AnthropicResponse {
      content: Array<{ type: string; text: string }>;
    }

    const data = await response.json() as AnthropicResponse;
    const text = data.content?.[0]?.text ?? "";

    // Parse the JSON from the response
    let restaurants: Restaurant[];
    try {
      // Handle potential markdown code blocks
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      restaurants = JSON.parse(jsonMatch[0]) as Restaurant[];
    } catch {
      console.error("Failed to parse AI response:", text.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Validate and sanitize - STRICT city enforcement
    const cityLower = city.toLowerCase();
    const valid = restaurants
      .filter((r) => r.name && r.cuisine && r.budget)
      .filter((r) => {
        const rCity = (r.city ?? "").toLowerCase();
        return rCity === cityLower || rCity.includes(cityLower);
      })
      .map((r, i) => ({
        ...r,
        id: r.id || `ai-${city.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`,
        city: city,
        imageColor: COLORS[i % COLORS.length],
        isManuallyAdded: false,
        reviews: Array.isArray(r.reviews) ? r.reviews : [],
        tags: Array.isArray(r.tags) ? r.tags : [],
        topDishes: Array.isArray(r.topDishes) ? r.topDishes : [],
      }));

    return NextResponse.json({ restaurants: valid });
  } catch (err) {
    console.error("Suggest API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
