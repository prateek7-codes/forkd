import { useState, useEffect } from "react";
import { type Restaurant } from "@/lib/data";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function getGooglePhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

const UNSPLASH_IMAGES: Record<string, string> = {
  "Indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  "Italian": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
  "Japanese": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
  "Chinese": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
  "Mexican": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
  "American": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80",
  "Mediterranean": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
  "Thai": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80",
  "Korean": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80",
  "French": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=80",
  "Middle Eastern": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&q=80",
  "Continental": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  "Seafood": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "Steakhouse": "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80",
  "Fusion": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  "Taiwanese": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

export function getRestaurantImage(restaurant: Restaurant): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    const refs = restaurant.photos;
    if (refs && refs.length > 0) {
      const ref = Array.isArray(refs) ? refs[0] : refs;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${ref}&key=${apiKey}`;
    }
  }
  
  return UNSPLASH_IMAGES[restaurant.cuisine] || DEFAULT_IMAGE;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
  }
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  
  let prevRow: number[] = [];
  let currRow: number[] = [];
  
  for (let j = 0; j <= s2.length; j++) {
    currRow[j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    prevRow = currRow;
    currRow = [i];
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,
        currRow[j - 1] + 1,
        prevRow[j - 1] + cost
      );
    }
  }
  
  return 1 - currRow[s2.length] / maxLen;
}

function getLocationSimilarity(r1: Restaurant, r2: Restaurant): number {
  const areaSim = calculateSimilarity(r1.area, r2.area);
  const citySim = calculateSimilarity(r1.city, r2.city);
  return (areaSim * 0.7 + citySim * 0.3);
}

const SIMILARITY_THRESHOLD = 0.75;

export function deduplicateRestaurants(restaurants: Restaurant[]): Restaurant[] {
  if (restaurants.length <= 1) return restaurants;
  
  const seen = new Set<string>();
  const result: Restaurant[] = [];
  
  const priority: Record<string, number> = {
    google: 0,
    ai: 1,
    curated: 2,
    manually: 3,
  };
  
  const sorted = [...restaurants].sort((a, b) => {
    const pa = priority[a.type || "manually"];
    const pb = priority[b.type || "manually"];
    if (pa !== pb) return pa - pb;
    return b.rating - a.rating;
  });
  
  for (const restaurant of sorted) {
    let isDuplicate = false;
    
    for (const existingId of seen) {
      const existing = result.find(r => r.id === existingId);
      if (!existing) continue;
      
      const nameSimilarity = calculateSimilarity(restaurant.name, existing.name);
      const locationSimilarity = getLocationSimilarity(restaurant, existing);
      
      if (nameSimilarity >= SIMILARITY_THRESHOLD && locationSimilarity >= SIMILARITY_THRESHOLD * 0.8) {
        isDuplicate = true;
        
        if (restaurant.totalReviews > existing.totalReviews) {
          const idx = result.findIndex(r => r.id === existingId);
          if (idx !== -1) {
            result[idx] = {
              ...existing,
              ...restaurant,
              id: existing.id,
              badges: [...new Set([...(existing.badges || []), ...(restaurant.badges || [])])],
            };
          }
        }
        break;
      }
    }
    
    if (!isDuplicate) {
      seen.add(restaurant.id);
      result.push(restaurant);
    } else {
      seen.add(restaurant.id);
    }
  }
  
  return result;
}

export function calculateAIScore(restaurant: Restaurant): number {
  if (restaurant.type !== "ai") return 0;
  
  let score = 0;
  
  if (restaurant.description && restaurant.description.length > 50) score += 0.3;
  if (restaurant.topDishes && restaurant.topDishes.length >= 2) score += 0.3;
  if (restaurant.reviews && restaurant.reviews.length > 0) score += 0.2;
  if (restaurant.tags && restaurant.tags.length >= 2) score += 0.2;
  
  return score;
}

export interface RankingScore {
  total: number;
  rating: number;
  reviewWeight: number;
  aiBonus: number;
  voteWeight: number;
}

export function calculateRankingScore(
  restaurant: Restaurant,
  voteCount: number = 0
): RankingScore {
  const reviews = Math.max(1, restaurant.totalReviews);
  const logReviews = Math.log10(reviews);
  
  const ratingScore = restaurant.rating * 20 * 0.35;
  
  const reviewScore = logReviews * 10 * 0.25;
  
  const aiScore = calculateAIScore(restaurant);
  const aiBonusScore = aiScore * 100 * 0.25;
  
  const voteScore = voteCount * 10 * 0.15;
  
  let ratingBoost = 0;
  if (restaurant.rating > 4.4) ratingBoost += 5;
  if (restaurant.totalReviews > 1000) ratingBoost += 3;
  
  const total = Math.min(100, ratingScore + reviewScore + aiBonusScore + voteScore + ratingBoost);
  
  return {
    total: Math.round(total * 10) / 10,
    rating: Math.round(ratingScore * 10) / 10,
    reviewWeight: Math.round(reviewScore * 10) / 10,
    aiBonus: Math.round(aiBonusScore * 10) / 10,
    voteWeight: Math.round(voteScore * 10) / 10,
  };
}

export function sortByRanking(
  restaurants: Restaurant[],
  voteCounts: Record<string, number> = {}
): Restaurant[] {
  return [...restaurants].sort((a, b) => {
    const scoreA = calculateRankingScore(a, voteCounts[a.id] || 0);
    const scoreB = calculateRankingScore(b, voteCounts[b.id] || 0);
    return scoreB.total - scoreA.total;
  });
}
