"use client";

import { useState, useMemo } from "react";
import {
  type Restaurant,
  CUISINES,
  TAGS,
  BUDGETS,
  type Budget,
  type Tag,
} from "@/lib/data";
import RestaurantCard from "@/components/RestaurantCard";

interface Props {
  restaurants: Restaurant[];
  shortlist: string[];
  onToggleShortlist: (id: string) => void;
  onSelectRestaurant: (r: Restaurant) => void;
}

const CITIES = ["All", "Mumbai", "Delhi", "Bangalore", "London"];

export default function DiscoverTab({
  restaurants,
  shortlist,
  onToggleShortlist,
  onSelectRestaurant,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedBudgets, setSelectedBudgets] = useState<Budget[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [aiCity, setAiCity] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResults, setAiResults] = useState<Restaurant[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleBudget = (b: Budget) => {
    setSelectedBudgets((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const toggleTag = (t: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("All");
    setSelectedCuisine("All");
    setSelectedBudgets([]);
    setSelectedTags([]);
  };

  const activeFilterCount =
    (selectedCity !== "All" ? 1 : 0) +
    (selectedCuisine !== "All" ? 1 : 0) +
    selectedBudgets.length +
    selectedTags.length;

  const filtered = useMemo(() => {
    const base = aiResults.length > 0 ? aiResults : restaurants;
    return base.filter((r) => {
      if (
        searchQuery &&
        !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (selectedCity !== "All" && r.city !== selectedCity) return false;
      if (selectedCuisine !== "All" && r.cuisine !== selectedCuisine)
        return false;
      if (
        selectedBudgets.length > 0 &&
        !selectedBudgets.includes(r.budget)
      )
        return false;
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((t) => r.tags.includes(t))
      )
        return false;
      return true;
    });
  }, [
    restaurants,
    aiResults,
    searchQuery,
    selectedCity,
    selectedCuisine,
    selectedBudgets,
    selectedTags,
  ]);

  const fetchAiSuggestions = async () => {
    if (!aiCity.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResults([]);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: aiCity }),
      });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json() as { restaurants: Restaurant[] };
      setAiResults(data.restaurants);
      setSelectedCity("All");
    } catch {
      setAiError("Could not fetch AI suggestions. Showing existing results.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      {/* AI Search Bar */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{
          background: "linear-gradient(135deg, #3b120a 0%, #6d2917 50%, #a33a18 100%)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "#f0a888" }}
        >
          AI Restaurant Discovery
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiCity}
            onChange={(e) => setAiCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAiSuggestions()}
            placeholder="Enter any city (e.g. Tokyo, Paris, NYC...)"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
          <button
            onClick={fetchAiSuggestions}
            disabled={aiLoading || !aiCity.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: "#d97706", color: "white" }}
          >
            {aiLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="20 60" />
                </svg>
                <span className="hidden sm:inline">Finding...</span>
              </span>
            ) : (
              "✨ Find"
            )}
          </button>
        </div>
        {aiError && (
          <p className="text-xs mt-2" style={{ color: "#fcd34d" }}>
            {aiError}
          </p>
        )}
        {aiResults.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs" style={{ color: "#f0a888" }}>
              Showing {aiResults.length} AI suggestions for &ldquo;{aiCity}&rdquo;
            </p>
            <button
              onClick={() => setAiResults([])}
              className="text-xs underline"
              style={{ color: "#f0a888" }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#a06040" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "white",
              border: "1px solid #f0d8c4",
              color: "#2d2420",
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
          style={{
            background: showFilters ? "#c44a20" : "white",
            color: showFilters ? "white" : "#2d2420",
            border: "1px solid #f0d8c4",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "#c44a20" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: "white", border: "1px solid #f0d8c4" }}
        >
          {/* City */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a06040" }}>
              City
            </p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={
                    selectedCity === city
                      ? { background: "#c44a20", color: "white" }
                      : { background: "#f5e8d8", color: "#6b3a20" }
                  }
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a06040" }}>
              Cuisine
            </p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={
                    selectedCuisine === c
                      ? { background: "#d97706", color: "white" }
                      : { background: "#f5e8d8", color: "#6b3a20" }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a06040" }}>
              Budget
            </p>
            <div className="flex gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleBudget(b)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={
                    selectedBudgets.includes(b)
                      ? { background: "#059669", color: "white" }
                      : { background: "#f5e8d8", color: "#6b3a20" }
                  }
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a06040" }}>
              Vibe / Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={
                    selectedTags.includes(t)
                      ? { background: "#7c3aed", color: "white" }
                      : { background: "#f5e8d8", color: "#6b3a20" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium underline"
              style={{ color: "#c44a20" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* City quick-select pills (always visible) */}
      {!showFilters && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={
                selectedCity === city
                  ? { background: "#c44a20", color: "white" }
                  : { background: "white", color: "#6b3a20", border: "1px solid #f0d8c4" }
              }
            >
              {city === "All" ? "🌍 All" : city}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: "#8a5a40" }}>
          {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}
          {selectedCity !== "All" ? ` in ${selectedCity}` : ""}
        </p>
        {shortlist.length > 0 && (
          <p className="text-xs" style={{ color: "#a06040" }}>
            {shortlist.length} shortlisted
          </p>
        )}
      </div>

      {/* Restaurant grid */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "white", border: "1px solid #f0d8c4" }}
        >
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-semibold text-lg mb-1" style={{ color: "#2d2420" }}>
            No restaurants found
          </p>
          <p className="text-sm" style={{ color: "#8a5a40" }}>
            Try adjusting your filters or search a new city with AI
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isShortlisted={shortlist.includes(restaurant.id)}
              onToggleShortlist={() => onToggleShortlist(restaurant.id)}
              onSelect={() => onSelectRestaurant(restaurant)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
