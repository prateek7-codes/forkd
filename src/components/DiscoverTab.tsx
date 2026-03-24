"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Restaurant } from "@/lib/data";
import { CUISINES, TAGS, BUDGETS, type Budget, type Tag } from "@/lib/data";
import RestaurantCard from "@/components/RestaurantCard";
import { sortByRanking, deduplicateRestaurants } from "@/lib/utils";
import { type SourceFilter } from "@/app/page";

interface Props {
  restaurants: Restaurant[];
  shortlist: string[];
  onToggleShortlist: (id: string) => void;
  onSelectRestaurant: (r: Restaurant) => void;
  sourceFilter: SourceFilter;
  onSourceFilterChange: (filter: SourceFilter) => void;
  viewMode: "grid" | "map";
  onViewModeChange: (mode: "grid" | "map") => void;
  darkMode: boolean;
}

const CITIES = ["Mumbai", "Delhi", "Bangalore", "London"];

export default function DiscoverTab({
  restaurants,
  shortlist,
  onToggleShortlist,
  onSelectRestaurant,
  sourceFilter,
  onSourceFilterChange,
  viewMode,
  onViewModeChange,
  darkMode,
}: Props) {
  const [searchCity, setSearchCity] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [searchName, setSearchName] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const isDark = darkMode;
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";
  const inputBg = isDark ? "#1a1a1d" : "white";
  
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedBudgets, setSelectedBudgets] = useState<Budget[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cityInputRef.current?.focus();
  }, []);

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

  const handleSearch = () => {
    if (searchCity.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        setHasSearched(true);
        setIsSearching(false);
      }, 600);
    }
  };

  const clearAll = () => {
    setSearchCity("");
    setSearchArea("");
    setSearchName("");
    setSelectedCuisine("All");
    setSelectedBudgets([]);
    setSelectedTags([]);
    setHasSearched(false);
    setIsSearching(false);
    setShowFilters(false);
  };

  const activeFilterCount =
    (selectedCuisine !== "All" ? 1 : 0) +
    selectedBudgets.length +
    selectedTags.length;

  const generateAIFallback = (city: string): Restaurant[] => {
    const cuisines = ["Indian", "Italian", "Chinese", "Japanese", "Mexican", "Continental", "Seafood"];
    const names = [
      "The Grand Feast", "Spice Garden", "Urban Tadka", "Bay View", "The Roof Garden",
      "Curry House", "Coastal Kitchen", "Urban Palette", "The Spice Route", "Garden Terrace",
      "The Local Kitchen", "Harbor Lights", "The Fusion House", "Street Food Corner", "The Royal Table"
    ];
    const areas = ["City Center", "Downtown", "Marina Bay", "Old Town", "Tech Park", "Lakeside", "Heritage Quarter"];
    const tags: Tag[] = ["Family Friendly", "Large Groups", "Romantic", "Trendy", "Casual", "Fine Dining"];
    const budgets: Budget[] = ["$", "$$", "$$$"];
    
    return names.map((name, idx) => ({
      id: `ai-fallback-${city.toLowerCase()}-${idx}`,
      name,
      area: areas[idx % areas.length],
      city,
      cuisine: cuisines[idx % cuisines.length],
      budget: budgets[idx % budgets.length],
      rating: 4.0 + Math.random() * 0.7,
      totalReviews: Math.floor(200 + Math.random() * 1500),
      description: `A popular dining destination in ${city}, known for its excellent cuisine and welcoming atmosphere. Perfect for group gatherings and special occasions.`,
      topDishes: ["Signature Dish", "Chef's Special", "House Favorite", "Seasonal Delight"].slice(0, 3),
      tags: [tags[idx % tags.length], tags[(idx + 1) % tags.length], tags[(idx + 2) % tags.length]].filter(Boolean),
      reviews: [],
      imageColor: ["from-orange-600 to-red-500", "from-amber-600 to-yellow-500", "from-rose-600 to-pink-500", "from-emerald-600 to-teal-500", "from-violet-600 to-purple-500"][idx % 5],
      type: "ai" as const,
      badges: idx === 0 ? ["AI Suggested"] : undefined,
    }));
  };

  const filteredAndRanked = useMemo(() => {
    if (!hasSearched) return [];

    const filtered = restaurants.filter((r) => {
      if (sourceFilter !== "all" && r.type !== sourceFilter) return false;
      
      const cityMatch = searchCity.trim() === "" || 
        r.city.toLowerCase().includes(searchCity.toLowerCase());
      const areaMatch = searchArea.trim() === "" || 
        r.area.toLowerCase().includes(searchArea.toLowerCase());
      const nameMatch = searchName.trim() === "" ||
        r.name.toLowerCase().includes(searchName.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchName.toLowerCase());
      
      if (!cityMatch || !areaMatch || !nameMatch) return false;
      
      if (selectedCuisine !== "All" && r.cuisine !== selectedCuisine) return false;
      if (selectedBudgets.length > 0 && !selectedBudgets.includes(r.budget)) return false;
      if (selectedTags.length > 0 && !selectedTags.some((t) => r.tags.includes(t))) return false;
      
      return true;
    });
    
    const deduplicated = deduplicateRestaurants(filtered);
    
    if (deduplicated.length === 0 && searchCity.trim()) {
      return generateAIFallback(searchCity.trim());
    }
    
    return sortByRanking(deduplicated, {});
  }, [
    restaurants,
    hasSearched,
    searchCity,
    searchArea,
    searchName,
    selectedCuisine,
    selectedBudgets,
    selectedTags,
    sourceFilter,
  ]);

  const getSearchContext = () => {
    const parts: string[] = [];
    if (searchArea.trim()) parts.push(searchArea.trim());
    if (searchCity.trim()) parts.push(searchCity.trim());
    return parts.join(", ") || (searchCity.trim() || "");
  };

  return (
    <div>
      {/* Unified Search Input Group */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{
          background: "linear-gradient(135deg, #3b120a 0%, #6d2917 50%, #a33a18 100%)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#f0a888" }}
        >
          Find Restaurants
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <div>
            <label className="text-xs text-white/70 mb-1 block">City (required)</label>
            <input
              ref={cityInputRef}
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Mumbai"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">Area (optional)</label>
            <input
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Bandra"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">Restaurant (optional)</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={!searchCity.trim() || isSearching}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "#d97706", color: "white" }}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Finding...
            </>
          ) : (
            "Find Restaurants"
          )}
        </button>
      </div>

      {/* Source Switcher + View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: isDark ? "#1a1a1d" : "#f5e8d8" }}>
          {[
            { id: "all" as SourceFilter, label: "All", icon: "🍽️" },
            { id: "ai" as SourceFilter, label: "Smart Picks", icon: "🤖" },
            { id: "google" as SourceFilter, label: "Top Rated", icon: "🌍" },
            { id: "curated" as SourceFilter, label: "Editor's Picks", icon: "⭐" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSourceFilterChange(opt.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={
                sourceFilter === opt.id
                  ? { background: accent, color: "white" }
                  : { color: textSecondary }
              }
            >
              <span>{opt.icon}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 rounded-xl" style={{ background: isDark ? "#1a1a1d" : "#f5e8d8" }}>
          <button
            onClick={() => onViewModeChange("grid")}
            className="p-2 rounded-lg transition-all"
            style={
              viewMode === "grid"
                ? { background: accent, color: "white" }
                : { color: textSecondary }
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("map")}
            className="p-2 rounded-lg transition-all"
            style={
              viewMode === "map"
                ? { background: accent, color: "white" }
                : { color: textSecondary }
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Toggle - only show when there are results */}
      {hasSearched && filteredAndRanked.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: showFilters ? accent : "white",
              color: showFilters ? "white" : textPrimary,
              border: `1px solid ${border}`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: showFilters ? "white" : accent, color: showFilters ? accent : "white" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>
              Cuisine
            </p>
            <div className="flex flex-wrap gap-2">
              {["All", ...CUISINES].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={
                    selectedCuisine === c
                      ? { background: "#d97706", color: "white" }
                      : { background: isDark ? "#252528" : "#f5e8d8", color: textSecondary }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>
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
                      : { background: isDark ? "#252528" : "#f5e8d8", color: textSecondary }
                  }
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>
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
                      : { background: isDark ? "#252528" : "#f5e8d8", color: textSecondary }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedCuisine("All");
                setSelectedBudgets([]);
                setSelectedTags([]);
              }}
              className="text-sm font-medium underline"
              style={{ color: accent }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Search Context Header */}
      {hasSearched && filteredAndRanked.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: textPrimary }}>
              📍 Showing results for {searchArea.trim() ? `${searchArea.trim()}, ` : ''}{searchCity.trim()}
            </p>
            {shortlist.length > 0 && (
              <p className="text-xs" style={{ color: accent }}>
                {shortlist.length} shortlisted
              </p>
            )}
          </div>
          <p className="text-sm font-medium mb-4" style={{ color: accent }}>
            ✨ Smart picks tailored for your group
          </p>
        </div>
      )}

      {/* Best Pick Highlight Section */}
      {hasSearched && filteredAndRanked.length > 0 && filteredAndRanked[0] && (
        <div 
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{ 
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            border: "2px solid #f59e0b",
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <svg viewBox="0 0 200 200" fill="#f59e0b">
              <path d="M100 0L123 77L200 100L123 123L100 200L77 123L0 100L77 77Z"/>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#92400e" }}>
                Best pick for your group
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "#1f2937" }}>
              {filteredAndRanked[0].name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold" style={{ color: "#b45309" }}>
                {filteredAndRanked[0].cuisine} • {filteredAndRanked[0].budget}
              </span>
              <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: "#f59e0b", color: "white" }}>
                ★ {filteredAndRanked[0].rating.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredAndRanked[0].tags.includes("Large Groups") || filteredAndRanked[0].tags.includes("Family Friendly") ? (
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "white", color: "#6b7280" }}>
                  👥 Great for groups
                </span>
              ) : null}
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "white", color: "#6b7280" }}>
                💰 Balanced pricing
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "white", color: "#6b7280" }}>
                ⭐ Highly rated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty / Default State */}
      {!hasSearched ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <div className="text-6xl mb-6">🍽️</div>
          <p className="font-bold text-xl mb-3" style={{ color: textPrimary }}>
            Find the perfect place for your group 🍽️
          </p>
          <p className="text-base mb-4" style={{ color: textSecondary }}>
            Try Mumbai, Delhi, Bangalore, or London
          </p>
          <p className="text-sm font-medium" style={{ color: accent }}>
            ✨ Smart picks tailored for your group
          </p>
        </div>
      ) : filteredAndRanked.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <div className="text-5xl mb-4">✨</div>
          <p className="font-bold text-lg mb-2" style={{ color: textPrimary }}>
            We could not find exact matches, showing great picks instead
          </p>
          <p className="text-sm mb-4" style={{ color: textSecondary }}>
            Try a different city or adjust your filters
          </p>
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: accent, color: "white" }}
          >
            Start New Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndRanked.map((restaurant: Restaurant, index: number) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isShortlisted={shortlist.includes(restaurant.id)}
              onToggleShortlist={() => onToggleShortlist(restaurant.id)}
              onSelect={() => onSelectRestaurant(restaurant)}
              isBestPick={index === 0}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}