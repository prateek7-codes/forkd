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

function buildPrompt(city: string): string {
  return `You are a restaurant recommendation assistant for a group dining app called Forkd.

Suggest exactly 5 top restaurants in or near "${city}". For each restaurant, return a JSON object matching this TypeScript type:

{
  id: string,           // unique slug, e.g. "paris-1"
  name: string,         // real restaurant name
  area: string,         // neighbourhood/district
  city: string,         // the requested city
  cuisine: string,      // cuisine type (e.g. "French", "Japanese", "Indian")
  budget: "$" | "$$" | "$$$" | "$$$$",
  rating: number,       // 3.5 to 5.0
  totalReviews: number, // plausible number
  description: string,  // 2-3 sentences about the restaurant (compelling, editorial tone)
  topDishes: string[],  // 3-4 signature dishes
  tags: string[],       // 1-4 from: Romantic, Family Friendly, Large Groups, Rooftop, Outdoor Seating, Vegetarian Friendly, Vegan Options, Late Night, Brunch, Cocktail Bar, Live Music, Pet Friendly, Trendy, Traditional, Fine Dining, Casual, Quick Bites
  reviews: Array<{
    author: string,
    avatar: string,     // 1 capital letter
    rating: number,     // 4 or 5
    text: string,       // 1-2 sentences, first-person
    date: string,       // e.g. "1 week ago"
  }>,                   // 1-2 reviews per restaurant
  imageColor: string,   // one of the provided color strings
  isManuallyAdded: false
}

Use these imageColor values (assign one to each restaurant, variety preferred):
${COLORS.join(", ")}

Return ONLY a valid JSON array of 5 restaurant objects. No markdown, no explanation, just the JSON array.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { city?: string };
    const city = (body.city ?? "").trim();

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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: buildPrompt(city),
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

    // Validate and sanitize
    const valid = restaurants
      .filter((r) => r.name && r.cuisine && r.budget)
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
