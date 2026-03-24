"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Restaurant } from "@/lib/data";
import { CUISINES, TAGS, BUDGETS, type Budget, type Tag } from "@/lib/data";
import RestaurantCard from "@/components/RestaurantCard";
import { sortByRanking, deduplicateRestaurants } from "@/lib/utils";
import { type SourceFilter } from "@/app/page";

interface AutocompleteSuggestion {
  displayName: string;
  location: string;
  city: string;
  area: string;
  state: string;
  country: string;
}

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
  const [searchedCityNormalized, setSearchedCityNormalized] = useState("");

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
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [osmpResults, setOsmpResults] = useState<Restaurant[]>([]);
  const [dataSource, setDataSource] = useState<"osm" | "ai" | "cache" | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    cityInputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
    };
  }, []);

  const normalizeSearchInput = (input: string): { city: string; area: string } => {
    const trimmed = input.trim();
    if (!trimmed) return { city: "", area: "" };
    
    const parts = trimmed.split(/[,\/]/).map(p => p.trim()).filter(Boolean);
    
    if (parts.length >= 2) {
      const cityPart = parts[parts.length - 1];
      const areaParts = parts.slice(0, -1);
      return {
        city: cityPart.charAt(0).toUpperCase() + cityPart.slice(1).toLowerCase(),
        area: areaParts.join(", ").replace(/\b\w/g, c => c.toUpperCase())
      };
    }
    
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words[words.length - 1].length <= 5) {
      const city = words.slice(0, -1).join(" ").replace(/\b\w/g, c => c.toUpperCase());
      const area = words[words.length - 1].charAt(0).toUpperCase() + words[words.length - 1].slice(1).toLowerCase();
      return { city, area };
    }
    
    return {
      city: trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
      area: ""
    };
  };

  const fetchAutocomplete = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setAutocompleteSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setAutocompleteSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchCity(value);
    
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    
    autocompleteTimeoutRef.current = setTimeout(() => {
      fetchAutocomplete(value);
      setShowAutocomplete(true);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    const location = suggestion.area ? `${suggestion.area}, ${suggestion.city}` : suggestion.city;
    setSearchCity(location);
    setSearchArea(suggestion.area);
    setAutocompleteSuggestions([]);
    setShowAutocomplete(false);
  };

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

  const handleSearch = async () => {
    if (searchCity.trim()) {
      setShowAutocomplete(false);
      const normalized = normalizeSearchInput(searchCity);
      setSearchedCityNormalized(normalized.city);
      
      if (normalized.area && !searchArea.trim()) {
        setSearchArea(normalized.area);
      }
      
      setIsSearching(true);
      setHasSearched(true);
      
      try {
        const response = await fetch("/api/restaurants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: normalized.city,
            area: normalized.area || searchArea.trim()
          }),
        });
        
        const data = await response.json();
        
        if (data.restaurants && data.restaurants.length > 0) {
          setOsmpResults(data.restaurants);
          setDataSource(data.source);
        } else {
          setOsmpResults(generateAIFallback(normalized.city, normalized.area || searchArea.trim()));
          setDataSource("ai");
        }
      } catch (error) {
        console.error("Restaurant fetch error:", error);
        setOsmpResults(generateAIFallback(normalized.city, normalized.area || searchArea.trim()));
        setDataSource("ai");
      } finally {
        setIsSearching(false);
      }
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
    setOsmpResults([]);
    setDataSource(null);
  };

  const activeFilterCount =
    (selectedCuisine !== "All" ? 1 : 0) +
    selectedBudgets.length +
    selectedTags.length;

  const generateAIFallback = (city: string, area?: string): Restaurant[] => {
    const normalizedCity = city.trim();
    const normalizedArea = area?.trim() || "";
    const cacheKey = `${normalizedCity.toLowerCase()}_${normalizedArea.toLowerCase() || "all"}`;
    
    const CITY_RESTAURANTS: Record<string, { names: string[], cuisines: string[], areas: string[], dishes: string[][] }> = {
      "hyderabad": {
        names: ["Paradise", "Bawarchi", "Shah Ghouse", "Hotel Shadab", "Ch尤其是", "Minerva", "Grand Hotel", "Nice", "Kamat", "4M", "Alpha", "D replicate", "Asian", "Raffah", "M均有"],
        cuisines: ["Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian"],
        areas: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Secunderabad", "Charminar", "Koti", "Abids", "Mehadipatnam", "Panjagutta", "Ameerpet", "Somajiguda", "Rajendra Nagar", "Lakdi Ka Pool", "Hill Road"],
        dishes: [["Hyderabadi Biryani", "Chicken 65", "Haleem"], ["Biryani", "Kebab", "Fried Rice"], ["Biryani", "Pathar Ghost", "Rumali Roti"], ["Biryani", "Chicken Fry", "Daal"], ["Biryani", "Mutton Korma", "Naan"]]
      },
      "chennai": {
        names: ["Murugan Idli", "Saravana Bhavan", "Anjappar", "Dosa Corner", "Sangeetha", "Vellappan", "Hot Breads", "Up Baker", "Amma", "RR", "Mathura", "Sea Shell", "Marine", "Bayview", "Palmyra"],
        cuisines: ["South Indian", "South Indian", "South Indian", "South Indian", "South Indian", "South Indian", "Bakery", "Bakery", "South Indian", "South Indian", "South Indian", "Seafood", "Seafood", "Continental", "Continental"],
        areas: ["T Nagar", "Anna Nagar", "Mylapore", "Nungambakkam", "Express Avenue", "Thousand Lights", "Besant Nagar", "Marina Beach", "Adyar", "Vadapalani", "Porur", "Guindy", "Kilpauk", "Kodambakkam", "Chepauk"],
        dishes: [["Idli", "Dosa", "Sambar"], ["Dosa", "Pongal", "Vada"], ["Chettinad Chicken", "Biryani", "Idiyappam"], ["Idli", "Pongal", "Filter Coffee"], ["Idli", "Vada", "Podi"]]
      },
      "paris": {
        names: ["Le Petit Bistro", "Café de Flore", "L'Atelier", "Le Cinq", "Septime", "Le Comptoir", "Bouillon Chartier", "Frenchie", "Le Marais", "Café de la Paix", "L'Ambroisie", "Le Pain Quotidien", "Café des Musées", "Les Philosophes", "Le Zimmer"],
        cuisines: ["French", "French", "French", "French", "French", "French", "French", "French", "French", "French", "French", "French", "French", "French", "French"],
        areas: ["Le Marais", "Saint-Germain", "Montmartre", "Champs-Élysées", "Latin Quarter", "Le Marais", "Grands Boulevards", "Le Marais", "Le Marais", "Opéra", "Place des Vosges", "Le Marais", "Marais", "Le Marais", "Châtelet"],
        dishes: [["Coq au Vin", "Bouillabaisse", "Soufflé"], ["Croissant", "Quiche", "Crème Brûlée"], ["Duck Confit", "Ratatouille", "Tarte Tatin"], ["Foie Gras", "Beef Bourguignon", "Chocolate Mousse"], ["Soupe à l'oignon", "Escargots", "Crêpes"]]
      },
      "tokyo": {
        names: ["Ichiran Ramen", "Sukiyabashi Jiro", "Den", "Narisawa", "Kikunoi", "Gonpachi", "Ichiro", "Tempura Kondo", "Sushi Saito", "Ramen Yama", "Matsukawa", "La Bombance", "Ukai-tei", "Kojitsu", "Sushi Kanesaka"],
        cuisines: ["Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese", "Japanese"],
        areas: ["Shibuya", "Ginza", "Omotesando", "Meguro", "Gion", "Roppongi", "Shibuya", "Ginza", "Minato", "Shinjuku", "Minato", "Ebisu", "Roppongi", "Aoyama", "Ginza"],
        dishes: [["Tonkotsu Ramen", "Chashu Bowl", "Takoyaki"], ["Sushi Omakase", "Uni", "Otoro"], ["Modern Kaiseki", "Wagyu", "Seasonal"], ["Satoyama Kitchen", "Wild Herbs", "Foraged"], ["Kaiseki", "Tempura", "Matcha"]]
      },
      "new york": {
        names: ["Eleven Madison Park", "Le Bernardin", "Per Se", "Carbone", "Keens", "Botequin", "Carbone", "Peter Luger", "Gramercy Tavern", "The Spotted Pig", "Momofuku Noodle Bar", "Nobu", "The Four Seasons", "L'Atelier", "Haagen-Dazs"],
        cuisines: ["American", "French", "American", "Italian", "Steakhouse", "Mexican", "Italian", "Steakhouse", "American", "American", "Japanese", "Japanese", "American", "French", "American"],
        areas: ["Flatbush", "Midtown", "Time Square", "Greenwich Village", "Murray Hill", "SoHo", "Greenwich Village", "Williamsburg", "Gramercy", "West Village", "East Village", "TriBeCa", "Midtown", "Midtown", "Upper West Side"],
        dishes: [["Lobter", "Truffle", "Wagyu"], ["Bass", "Caviar", "Sea"], ["Egg", "Oyster", "Game"], ["Pasta", "Osso Buco", "Tiramisu"], ["Porterhouse", "Bone Marrow", "Cobb"]]
      },
      "london": {
        names: ["Dishoom", "The Clove Club", "Padella", "Bao", "Hawksmoor", "The Ledbury", "Heston Blumenthal", "Marcus", "Sketch", "Restaurant Gordon Ramsay", "The Palm", "Sexy Fish", "The Ned", "Globe", "Boxcar"],
        cuisines: ["Indian", "Continental", "Italian", "Taiwanese", "Steakhouse", "French", "British", "British", "French", "French", "Seafood", "Seafood", "British", "British", "British"],
        areas: ["Covent Garden", "Shoreditch", "Borough Market", "Fitzrovia", "Seven Dials", "Notting Hill", "Battersea", "Knightsbridge", "Mayfair", "Chelsea", "Mayfair", "Mayfair", "City", "City", "King's Cross"],
        dishes: [["Black Dal", "Bacon Naan", "Pau Bhaji"], ["Chicken", "Beef", "Pudding"], ["Pici", "Ravioli", "Burrata"], ["Bao", "Fried Chicken", "Ice Cream"], ["Steak", "Chips", "Marrow"]]
      },
      "mumbai": {
        names: ["Trishna", "Bastian", "The Bombay Canteen", "Peshwari", "Oye", "Colaba", "Mahesh Lunch Home", "Pankaj", "Shatranj", "K", "Dum", "Salt Water", "Bademiya", "Cafe Mondegar", "The Table"],
        cuisines: ["Seafood", "Seafood", "Indian", "Indian", "Indian", "Seafood", "Seafood", "Indian", "Indian", "Indian", "Indian", "Seafood", "Indian", "Indian", "Continental"],
        areas: ["Fort", "Bandra West", "Lower Parel", "Andheri East", "Khar", "Colaba", "CST", "Marine Drive", "CST", "Khar", "Bandra", "Marine Drive", "Fort", "Fort", "Colaba"],
        dishes: [["Butter Crab", "Prawns", "Pomfret"], ["Lobster", "Truffle", "Prawn Toast"], ["Keema Pav", "Prawn Ghee", "Thepla"], ["Dal Bukhara", "Raan", "Naan"], ["Seekh Kebab", "Nihari", "Korma"]]
      },
      "delhi": {
        names: ["Indian Accent", "Bukhara", "Karims", "Big Chill", "Lavaash", "Sarbjit", "Diva", "Chor Bizarre", "Bisticks", "Al Qamar", "Nizams", "Khandani", "Daa", "Pickle", "Mamagoto"],
        cuisines: ["Indian", "Indian", "Indian", "Italian", "Fusion", "Indian", "Italian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Pan-Asian"],
        areas: ["Lodhi Estate", "Chanakyapuri", "Jama Masjid", "Khan Market", "Mehrauli", "Sunder Nagar", "Sundar Nagar", "Chandni Chowk", "Rajouri Garden", "Jama Masjid", "Jama Masjid", "Khan Market", "Vasant Kunj", "Hauz Khas", "Hauz Khas"],
        dishes: [["Dal Makhani", "Raan", "French Toast"], ["Dal Makhani", "Tandoori", "Kebab"], ["Korma", "Nihari", "Seekh"], ["Pasta Bake", "Cheesecake", "Lasagna"], ["Kebab Rolls", "Biryani", "Rose"]]
      },
      "bangalore": {
        names: ["Karavalli", "Toit", "Arbor", "Brahmin", "Jamavar", "Mavalli", "Vidyarthi", "Koshy", "Iron Hill", "Lazy", "The Hummingbird", "Punjab", "Adiga", "CTR", "MTR"],
        cuisines: ["Seafood", "Fusion", "American", "Indian", "Indian", "South Indian", "South Indian", "Continental", "Continental", "Cafe", "Cafe", "Punjabi", "South Indian", "South Indian", "South Indian"],
        areas: ["Shivajinagar", "Indiranagar", "Indiranagar", "Basavanagudi", "UB City", "Mavalli", "Malleswaram", "St. Marks", "Koramangala", "Koramangala", "Koramangala", "Brigade Road", "Malleswaram", "Shivajinagar", "Basavanagudi"],
        dishes: [["Neer Dosa", "Gassi", "Moilee"], ["Nachos", "Pizza", "Beermisu"], ["Burger", "Wings", "Fish"], ["Idli Vada", "Dosa", "Coffee"], ["Korma", "Salmon", "Cheesecake"]]
      },
      "pune": {
        names: ["Vaishali", "German Bakery", "Blue Longe", "Chitale", "MR", "Sujata", "Malgudi", "Co", "Shar", "Prem", "Swarali", "Ashraya", "Madhura", "Saffron", "Tertio"],
        cuisines: ["Indian", "Bakery", "Continental", "Indian", "Indian", "South Indian", "Indian", "Cafe", "Indian", "Indian", "Indian", "Indian", "Indian", "Indian", "Italian"],
        areas: ["FC Road", "Koregaon Park", "Viman Nagar", "Shivaji Nagar", "Deccan", "Camp", "Kothrud", "Aundh", "Baner", "Wakad", "Pashan", "E-Square", "JM Road", "Lakshmi Road", "NIBM"],
        dishes: [["Misal Pav", "Pav Bhaji", "Puran Poli"], ["Sandwich", "Pizza", "Pasta"], ["Pasta", "Salad", "Dessert"], ["Puran Poli", "Bhakri", "Khadakdas"], ["Vada Pav", "Kathi Roll", "Bhel"]]
      }
    };

    const fallbackData = CITY_RESTAURANTS[normalizedCity.toLowerCase()];
    
    if (!fallbackData) {
      const seed = normalizedCity.length;
      const pseudoRandom = (idx: number) => {
        const hash = seed * 1000 + idx * 17 + 7;
        return ((hash * 9301 + 49297) % 233280) / 233280;
      };
      
      const genericNames = [
        "The City Kitchen", "Taste of Place", "Urban Flavors", "The Local Eatery", "Harbor View",
        "The Garden Table", "Spice Route", "Downtown Dining", "The Corner Bistro", "Riverside Grill",
        "The Heritage Kitchen", "Metropolitan", "The Social House", "The Green Leaf", "Urban Spice"
      ];
      
      const genericCuisines = ["Indian", "Italian", "Chinese", "Japanese", "Mexican", "Continental", "Seafood", "Thai", "Korean", "French", "American", "Mediterranean"];
      
      const genericAreas = ["Downtown", "City Center", "Waterfront", "Old Town", "Arts District", "Financial District", "University District", "Harbor Area", "Midtown", "West End", "East Side", "South District", "North End", "Central", "Riverside"];
      
      return genericNames.map((name, idx) => ({
        id: `ai-fallback-${cacheKey}-${idx}`,
        name: `${name} ${normalizedCity}`.trim(),
        area: normalizedArea || genericAreas[idx % genericAreas.length],
        city: normalizedCity,
        cuisine: genericCuisines[idx % genericCuisines.length],
        budget: ["$", "$$", "$$$", "$$$$"][idx % 4] as Budget,
        rating: 3.8 + pseudoRandom(idx) * 0.9,
        totalReviews: Math.floor(100 + pseudoRandom(idx + 100) * 3000),
        description: `A popular dining destination in ${normalizedCity}${normalizedArea ? ` in ${normalizedArea}` : ''}, known for its excellent cuisine and welcoming atmosphere. Perfect for group gatherings and special occasions.`,
        topDishes: ["Signature Dish", "Chef's Special", "House Favorite", "Seasonal Delight"].slice(0, 3),
        tags: [["Family Friendly", "Large Groups", "Trendy"], ["Romantic", "Fine Dining", "Cocktail Bar"], ["Casual", "Quick Bites", "Late Night"], ["Outdoor Seating", "Brunch", "Vegetarian Friendly"], ["Large Groups", "Live Music", "Rooftop"]][idx % 5] as Tag[],
        reviews: [],
        imageColor: ["from-orange-600 to-red-500", "from-amber-600 to-yellow-500", "from-rose-600 to-pink-500", "from-emerald-600 to-teal-500", "from-violet-600 to-purple-500"][idx % 5],
        type: "ai" as const,
        badges: idx === 0 ? ["AI Suggested"] : undefined,
      }));
    }

    const { names, cuisines, areas, dishes } = fallbackData;
    const finalArea = normalizedArea || areas[0];
    
    const seed = normalizedCity.length;
    const pseudoRandom = (idx: number) => {
      const hash = seed * 1000 + idx * 17 + 7;
      return ((hash * 9301 + 49297) % 233280) / 233280;
    };
    
    return names.slice(0, 15).map((name, idx) => ({
      id: `ai-fallback-${cacheKey}-${idx}`,
      name,
      area: finalArea || areas[idx % areas.length],
      city: normalizedCity,
      cuisine: cuisines[idx % cuisines.length],
      budget: ["$", "$$", "$$$", "$$$$"][idx % 4] as Budget,
      rating: 3.8 + pseudoRandom(idx) * 0.9,
      totalReviews: Math.floor(100 + pseudoRandom(idx + 100) * 3000),
      description: `A popular dining destination in ${normalizedCity}${finalArea ? ` in ${finalArea}` : ''}, known for its excellent cuisine and welcoming atmosphere. Perfect for group gatherings and special occasions.`,
      topDishes: dishes[idx % dishes.length],
      tags: [["Family Friendly", "Large Groups", "Trendy"], ["Romantic", "Fine Dining", "Cocktail Bar"], ["Casual", "Quick Bites", "Late Night"], ["Outdoor Seating", "Brunch", "Vegetarian Friendly"], ["Large Groups", "Live Music", "Rooftop"]][idx % 5] as Tag[],
      reviews: [],
      imageColor: ["from-orange-600 to-red-500", "from-amber-600 to-yellow-500", "from-rose-600 to-pink-500", "from-emerald-600 to-teal-500", "from-violet-600 to-purple-500"][idx % 5],
      type: "ai" as const,
      badges: idx === 0 ? ["AI Suggested"] : undefined,
    }));
  };

  const findBestPick = (restaurantList: Restaurant[]): Restaurant | null => {
    if (restaurantList.length === 0) return null;

    const scored = restaurantList.map((r) => {
      let score = 0;
      
      score += r.rating * 20;
      
      if (r.totalReviews > 500) score += 15;
      else if (r.totalReviews > 200) score += 10;
      else if (r.totalReviews > 50) score += 5;
      
      if (r.tags.includes("Large Groups")) score += 25;
      if (r.tags.includes("Family Friendly")) score += 20;
      if (r.tags.includes("Casual")) score += 10;
      if (r.tags.includes("Romantic")) score += 5;
      if (r.tags.includes("Fine Dining")) score += 5;
      if (r.tags.includes("Outdoor Seating")) score += 8;
      if (r.tags.includes("Live Music")) score += 8;
      if (r.tags.includes("Rooftop")) score += 10;
      
      if (r.budget === "$$") score += 15;
      else if (r.budget === "$$$") score += 10;
      else if (r.budget === "$") score += 5;
      
      if (r.badges?.includes("Popular")) score += 20;
      if (r.badges?.includes("Featured")) score += 15;
      if (r.badges?.includes("Trending")) score += 10;
      
      return { restaurant: r, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.restaurant || null;
  };

  const filteredAndRanked = useMemo(() => {
    if (!hasSearched) return [];

    const normalizedCity = normalizeSearchInput(searchCity).city;
    const normalizedArea = searchArea.trim() || normalizeSearchInput(searchCity).area;
    
    const sourceRestaurants = osmpResults.length > 0 ? osmpResults : restaurants;
    const effectiveDataSource = osmpResults.length > 0 ? dataSource : null;

    const filtered = sourceRestaurants.filter((r) => {
      if (sourceFilter !== "all" && r.type !== sourceFilter) return false;
      
      const rCityLower = r.city.toLowerCase();
      const rAreaLower = r.area.toLowerCase();
      const sCityLower = normalizedCity.toLowerCase();
      const sAreaLower = normalizedArea.toLowerCase();
      
      const cityMatch = normalizedCity === "" || 
        rCityLower === sCityLower ||
        (rCityLower.includes(sCityLower) && sCityLower.length > 2);
      
      const areaMatch = normalizedArea === "" || 
        rAreaLower.includes(sAreaLower) ||
        sAreaLower.includes(rAreaLower);
       
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
    
    const validated = deduplicated.filter(r => {
      const rCityLower = r.city.toLowerCase();
      const sCityLower = normalizedCity.toLowerCase();
      return rCityLower === sCityLower || rCityLower.includes(sCityLower);
    });
    
    if (validated.length >= 5) {
      return sortByRanking(validated, {});
    }
    
    if (validated.length > 0) {
      return sortByRanking(validated, {});
    }
    
    if (normalizedCity && osmpResults.length === 0) {
      return generateAIFallback(normalizedCity, normalizedArea);
    }
    
    return sortByRanking(deduplicated, {});
  }, [restaurants, osmpResults, hasSearched, searchCity, searchArea, searchName, selectedCuisine, selectedBudgets, selectedTags, sourceFilter, dataSource]);

  const getSearchContext = () => {
    const parts: string[] = [];
    if (searchArea.trim()) parts.push(searchArea.trim());
    if (searchCity.trim()) parts.push(searchCity.trim());
    return parts.join(", ") || (searchCity.trim() || "");
  };

  const bestPick = useMemo(() => findBestPick(filteredAndRanked), [filteredAndRanked]);

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
            <div className="relative">
              <input
                ref={cityInputRef}
                type="text"
                value={searchCity}
                onChange={handleCityInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => searchCity.length >= 2 && setShowAutocomplete(true)}
                placeholder="e.g. Mumbai, Bandra"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-white/30"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              {showAutocomplete && autocompleteSuggestions.length > 0 && (
                <div
                  className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-lg"
                  style={{ background: cardBg, border: `1px solid ${border}` }}
                >
                  {autocompleteSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm hover:opacity-80 transition-opacity"
                      style={{ color: textPrimary }}
                    >
                      <div className="font-medium">{suggestion.city}{suggestion.area && `, ${suggestion.area}`}</div>
                      <div className="text-xs truncate" style={{ color: textSecondary }}>
                        {suggestion.state}{suggestion.country && `, ${suggestion.country}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showAutocomplete && isLoadingSuggestions && (
                <div
                  className="absolute z-50 w-full mt-1 rounded-xl p-3 shadow-lg text-center text-sm"
                  style={{ background: cardBg, color: textSecondary }}
                >
                  Loading...
                </div>
              )}
            </div>
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
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#d97706", color: "white" }}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Finding places...
            </>
          ) : (
            "Search Restaurants"
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
      {hasSearched && filteredAndRanked.length > 0 && (() => {
        const normalized = normalizeSearchInput(searchCity);
        const displayArea = searchArea.trim() || normalized.area;
        const displayCity = normalized.city;
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: textPrimary }}>
                📍 Showing results for {displayArea ? `${displayArea}, ` : ''}{displayCity}
              </p>
              {shortlist.length > 0 && (
                <p className="text-xs" style={{ color: accent }}>
                  {shortlist.length} shortlisted
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4">
              {dataSource === "osm" && (
                <p className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>
                  📍 Real places + smart insights
                </p>
              )}
              {dataSource === "cache" && (
                <p className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#dbeafe", color: "#1e40af" }}>
                  ⚡ Cached results
                </p>
              )}
              {dataSource === "ai" && (
                <p className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
                  ✨ AI-powered suggestions
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Best Pick Highlight Section */}
      {hasSearched && bestPick && (
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
              {bestPick.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold" style={{ color: "#b45309" }}>
                {bestPick.cuisine} • {bestPick.budget}
              </span>
              <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: "#f59e0b", color: "white" }}>
                ★ {bestPick.rating.toFixed(1)}
              </span>
              {bestPick.distanceKm && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "white", color: "#6b7280" }}>
                  📍 {bestPick.distanceKm} km away
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {bestPick.tags.includes("Large Groups") || bestPick.tags.includes("Family Friendly") ? (
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
            <button
              onClick={() => {
                onToggleShortlist(bestPick.id);
                onSelectRestaurant(bestPick);
              }}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-95"
              style={{ background: "#f59e0b", color: "white" }}
            >
              Add to Shortlist →
            </button>
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
            📍 Real places + smart insights
          </p>
        </div>
      ) : isSearching ? (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <svg className="animate-spin h-5 w-5" style={{ color: accent }} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: textPrimary }}>
                Finding restaurants in {searchArea || searchCity}...
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="h-48" style={{ background: isDark ? "#2a2a2d" : "#e5e7eb" }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded" style={{ background: isDark ? "#2a2a2d" : "#e5e7eb" }} />
                  <div className="h-3 w-1/2 rounded" style={{ background: isDark ? "#2a2a2d" : "#e5e7eb" }} />
                  <div className="h-3 w-2/3 rounded" style={{ background: isDark ? "#2a2a2d" : "#e5e7eb" }} />
                </div>
              </div>
            ))}
          </div>
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
              isBestPick={bestPick?.id === restaurant.id}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}