"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Restaurant } from "@/lib/data";
import { CUISINES, TAGS, BUDGETS, type Budget, type Tag } from "@/lib/data";
import RestaurantCard from "@/components/RestaurantCard";
import { getRestaurantImage, sortByRanking, deduplicateRestaurants, useDebounce } from "@/lib/utils";
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

const CITIES = ["All", "Mumbai", "Delhi", "Bangalore", "London"];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedArea, setSelectedArea] = useState("All");
  
  // Debounce search to avoid unnecessary re-renders
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";
  const inputBg = isDark ? "#1a1a1d" : "white";
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedBudgets, setSelectedBudgets] = useState<Budget[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [aiCity, setAiCity] = useState("");
  // Debounce AI city input
  const debouncedAiCity = useDebounce(aiCity, 500);
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
    (selectedArea !== "All" ? 1 : 0) +
    (selectedCuisine !== "All" ? 1 : 0) +
    selectedBudgets.length +
    selectedTags.length;

  // Calculate vote counts for each restaurant
  const voteCounts: Record<string, number> = {};
  // Votes would need to be passed as prop or accessed from context
  // For now, we'll skip vote counting in ranking as it requires prop drilling

  const filteredAndRanked = useMemo(() => {
    const base = aiResults.length > 0 ? aiResults : restaurants;
    const filtered = base.filter((r) => {
      // Source filter
      if (sourceFilter !== "all" && r.type !== sourceFilter) return false;
      
      if (
        debouncedSearch &&
        !r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !r.description.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !r.cuisine.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
        return false;
      if (selectedCity !== "All" && r.city !== selectedCity) return false;
      if (selectedArea !== "All" && r.area !== selectedArea) return false;
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
    
    // Apply deduplication to remove duplicates between AI and Google results
    const deduplicated = deduplicateRestaurants(filtered);
    
    // Apply smart ranking (without vote count for now)
    return sortByRanking(deduplicated, {});
  }, [
    restaurants,
    aiResults,
    debouncedSearch,
    selectedCity,
    selectedArea,
    selectedCuisine,
    selectedBudgets,
    selectedTags,
    sourceFilter,
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
               {selectedArea !== "All" ? ` in ${selectedArea}` : ""}
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

      {/* Source Switcher + View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: isDark ? "#1a1a1d" : "#f5e8d8" }}>
          {[
            { id: "all" as SourceFilter, label: "All", icon: "🍽️" },
            { id: "ai" as SourceFilter, label: "AI Picks", icon: "🤖" },
            { id: "google" as SourceFilter, label: "Popular", icon: "🌍" },
            { id: "curated" as SourceFilter, label: "Curated", icon: "⭐" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSourceFilterChange(opt.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
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

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: textSecondary }}
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
              background: inputBg,
              border: `1px solid ${border}`,
              color: textPrimary,
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

          {/* Area */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a06040" }}>
              Area
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                key="All"
                onClick={() => setSelectedArea("All")}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={
                  selectedArea === "All"
                    ? { background: "#c44a20", color: "white" }
                    : { background: "#f5e8d8", color: "#6b3a20" }
                }
              >
                All Areas
              </button>
              {/* Add some common areas for demonstration */}
              <button
                key="Bandra"
                onClick={() => setSelectedArea("Bandra")}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={
                  selectedArea === "Bandra"
                    ? { background: "#c44a20", color: "white" }
                    : { background: "#f5e8d8", color: "#6b3a20" }
                }
              >
                Bandra
              </button>
              <button
                key="Connaught Place"
                onClick={() => setSelectedArea("Connaught Place")}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={
                  selectedArea === "Connaught Place"
                    ? { background: "#c44a20", color: "white" }
                    : { background: "#f5e8d8", color: "#6b3a20" }
                }
              >
                Connaught Place
              </button>
            </div>
          </div>
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
           {filteredAndRanked.length} restaurant{filteredAndRanked.length !== 1 ? "s" : ""}
           {selectedCity !== "All" && selectedArea !== "All" ? ` in ${selectedArea}, ${selectedCity}` : 
            selectedCity !== "All" ? ` in ${selectedCity}` : 
            selectedArea !== "All" ? ` in ${selectedArea}` : ""}
         </p>
         {shortlist.length > 0 && (
           <p className="text-xs" style={{ color: "#a06040" }}>
             {shortlist.length} shortlisted
           </p>
         )}
       </div>

       {/* Restaurant grid */}
       {filteredAndRanked.length === 0 ? (
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
            {filteredAndRanked.map((restaurant: Restaurant, index: number) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isShortlisted={shortlist.includes(restaurant.id)}
                onToggleShortlist={() => onToggleShortlist(restaurant.id)}
                onSelect={() => onSelectRestaurant(restaurant)}
                isBestPick={index === 0}
              />
            ))}
          </div>
       )}
    </div>
  );
}
