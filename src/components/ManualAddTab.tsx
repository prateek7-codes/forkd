"use client";

import { useState } from "react";
import { type Restaurant, type Budget, type Tag, BUDGETS, TAGS, CUISINES } from "@/lib/data";

interface Props {
  onAddRestaurant: (restaurant: Restaurant) => void;
  darkMode?: boolean;
}

export default function ManualAddTab({ onAddRestaurant, darkMode = false }: Props) {
  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";
  const inputBg = isDark ? "#1a1a1d" : "white";

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [customCuisine, setCustomCuisine] = useState("");
  const [budget, setBudget] = useState<Budget>("$$");
  const [rating, setRating] = useState("4.0");
  const [description, setDescription] = useState("");
  const [dishInput, setDishInput] = useState("");
  const [dishes, setDishes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const addDish = () => {
    if (dishInput.trim() && !dishes.includes(dishInput.trim())) {
      setDishes((prev) => [...prev, dishInput.trim()]);
      setDishInput("");
    }
  };

  const removeDish = (d: string) => {
    setDishes((prev) => prev.filter((x) => x !== d));
  };

  const toggleTag = (t: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Restaurant name is required";
    if (!area.trim()) errs.area = "Area / neighbourhood is required";
    if (!city.trim()) errs.city = "City is required";
    if (!cuisine && !customCuisine.trim()) errs.cuisine = "Cuisine is required";
    const r = parseFloat(rating);
    if (isNaN(r) || r < 1 || r > 5) errs.rating = "Rating must be between 1 and 5";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCuisine = customCuisine.trim() || cuisine || "Other";

    const restaurant: Restaurant = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      area: area.trim(),
      city: city.trim(),
      cuisine: finalCuisine,
      budget,
      rating: parseFloat(parseFloat(rating).toFixed(1)),
      totalReviews: 0,
      description: description.trim() || `A ${finalCuisine} restaurant in ${area.trim()}, ${city.trim()}.`,
      topDishes: dishes.length > 0 ? dishes : ["House Special"],
      tags: selectedTags,
      reviews: [],
      imageColor: "from-terracotta-700 to-amber-600",
      isManuallyAdded: true,
    };

    onAddRestaurant(restaurant);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
          style={{ background: "#fdf4f0", border: "2px solid #c44a20" }}
        >
          ✓
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
        >
          Restaurant Added!
        </h2>
        <p className="text-sm max-w-xs mb-6" style={{ color: "#8a5a40" }}>
          Your restaurant has been added to the top of the Discover feed. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
        >
          Add a Restaurant
        </h2>
        <p className="text-sm" style={{ color: "#8a5a40" }}>
          Know a great place that isn&apos;t in the list? Add it manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
            Restaurant Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Noma, Sukiyabashi Jiro..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "white",
              border: `1px solid ${errors.name ? "#ef4444" : "#f0d8c4"}`,
              color: "#2d2420",
            }}
          />
          {errors.name && (
            <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Area + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
              Area / Neighbourhood *
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Bandra, SoHo..."
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "white",
                border: `1px solid ${errors.area ? "#ef4444" : "#f0d8c4"}`,
                color: "#2d2420",
              }}
            />
            {errors.area && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                {errors.area}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
              City *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, Tokyo..."
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "white",
                border: `1px solid ${errors.city ? "#ef4444" : "#f0d8c4"}`,
                color: "#2d2420",
              }}
            />
            {errors.city && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                {errors.city}
              </p>
            )}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
            Cuisine *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CUISINES.filter((c) => c !== "All").map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCuisine(c); setCustomCuisine(""); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={
                  cuisine === c
                    ? { background: "#c44a20", color: "white" }
                    : { background: "#f5e8d8", color: "#6b3a20" }
                }
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={customCuisine}
            onChange={(e) => { setCustomCuisine(e.target.value); setCuisine(""); }}
            placeholder="Or type a custom cuisine..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "white",
              border: `1px solid ${errors.cuisine ? "#ef4444" : "#f0d8c4"}`,
              color: "#2d2420",
            }}
          />
          {errors.cuisine && (
            <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
              {errors.cuisine}
            </p>
          )}
        </div>

        {/* Budget + Rating */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
              Budget
            </label>
            <div className="flex gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={
                    budget === b
                      ? { background: "#059669", color: "white" }
                      : { background: "#f5e8d8", color: "#6b3a20" }
                  }
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
              Rating (1–5) *
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              min="1"
              max="5"
              step="0.1"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "white",
                border: `1px solid ${errors.rating ? "#ef4444" : "#f0d8c4"}`,
                color: "#2d2420",
              }}
            />
            {errors.rating && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                {errors.rating}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this place special?"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: "white",
              border: "1px solid #f0d8c4",
              color: "#2d2420",
            }}
          />
        </div>

        {/* Top dishes */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
            Top Dishes (optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={dishInput}
              onChange={(e) => setDishInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDish(); } }}
              placeholder="e.g. Butter Chicken..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "white", border: "1px solid #f0d8c4", color: "#2d2420" }}
            />
            <button
              type="button"
              onClick={addDish}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "#f5e8d8", color: "#6b3a20" }}
            >
              Add
            </button>
          </div>
          {dishes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dishes.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                  style={{ background: "#fdf4f0", color: "#c44a20", border: "1px solid #f7ccb9" }}
                >
                  {d}
                  <button
                    type="button"
                    onClick={() => removeDish(d)}
                    className="text-current opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#2d2420" }}>
            Vibe & Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
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

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-base font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #c44a20, #d97706)",
              color: "white",
              boxShadow: "0 4px 20px rgba(196,74,32,0.4)",
            }}
          >
            ➕ Add to Discover Feed
          </button>
        </div>
      </form>
    </div>
  );
}
