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

export function getRestaurantImage(restaurant: Restaurant): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  
  const refs = restaurant.photos;
  if (refs && refs.length > 0) {
    const ref = Array.isArray(refs) ? refs[0] : refs;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${ref}&key=${apiKey}`;
  }
  
  if (restaurant.type === "google" && restaurant.placeId) {
    return null;
  }
  
  return null;
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
  const rating = restaurant.rating * 8;
  
  const reviews = Math.max(1, restaurant.totalReviews);
  const logReviews = Math.log10(reviews);
  const reviewWeight = Math.min(20, logReviews * 4);
  
  const aiScore = calculateAIScore(restaurant);
  const aiBonus = aiScore * 30;
  
  const voteWeight = Math.min(10, voteCount * 5);
  
  const total = Math.min(100, rating + reviewWeight + aiBonus + voteWeight);
  
  return {
    total: Math.round(total * 10) / 10,
    rating: Math.round(rating * 10) / 10,
    reviewWeight: Math.round(reviewWeight * 10) / 10,
    aiBonus: Math.round(aiBonus * 10) / 10,
    voteWeight: Math.round(voteWeight * 10) / 10,
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
