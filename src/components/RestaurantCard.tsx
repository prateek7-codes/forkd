"use client";

import { useState } from "react";
import { type Restaurant } from "@/lib/data";
import { getRestaurantImage } from "@/lib/utils";

interface Props {
  restaurant: Restaurant;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  onSelect: () => void;
  compact?: boolean;
  darkMode?: boolean;
  isBestPick?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
            stroke="#f59e0b"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-semibold" style={{ color: "#2d2420" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function RestaurantCard({
  restaurant,
  isShortlisted,
  onToggleShortlist,
  onSelect,
  compact = false,
  darkMode = false,
  isBestPick = false,
}: Props) {
  const isDark = darkMode;
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";

  const { name, area, city, cuisine, budget, rating, totalReviews, description, topDishes, tags, imageColor, isManuallyAdded, badges, type } =
    restaurant;

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "AI Suggested": return "#7c3aed";
      case "Popular": return "#0284c7";
      case "Featured": return accent;
      case "Trending": return "#dc2626";
      default: return accent;
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case "AI Suggested": return "🤖";
      case "Popular": return "🌍";
      case "Featured": return "⭐";
      case "Trending": return "🔥";
      default: return "⭐";
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative"
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(196,74,32,0.06)",
       }}
       onClick={onSelect}
    >
        {/* Best Pick Highlight */}
        {isBestPick && (
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
            <span className="text-sm font-bold px-3 py-1.5 rounded-full shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white" }}>
              🏆 Best pick for your group
            </span>
          </div>
        )}
        {isBestPick && (
          <div className="absolute bottom-20 left-3 z-10">
            <span className="text-xs font-medium px-2 py-1 rounded-lg shadow-md bg-yellow-100/95 text-gray-800">
              Highly rated • Great for groups
            </span>
          </div>
        )}
       {/* Image placeholder */}
      {(() => {
        const imageUrl = getRestaurantImage(restaurant);
        return (
          <>
            <div
              className={`relative ${compact ? "h-28" : "h-40"} flex items-end p-3`}
              style={{
                background: imageUrl 
                  ? `url(${imageUrl}) center/cover no-repeat`
                  : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              }}
            >
              {!imageUrl && (
                <div className={`absolute inset-0 bg-gradient-to-br ${imageColor}`} />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-1">
                {badges?.map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: getBadgeColor(badge), color: "white" }}
                  >
                    {getBadgeIcon(badge)} {badge}
                  </span>
                ))}
                {isManuallyAdded && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#d97706", color: "white" }}
                  >
                    Added by you
                  </span>
                )}
                {type === "google" && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#0284c7", color: "white" }}
                  >
                    🌍 Popular
                  </span>
                )}
                {type === "ai" && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#7c3aed", color: "white" }}
                  >
                    🤖 AI
                  </span>
                )}
              </div>

              {/* Budget badge */}
              <span
                className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
              >
                {budget}
              </span>

              {/* Name over image */}
              <div className="relative z-10">
                <h3
                  className={`font-bold text-white ${compact ? "text-base" : "text-lg"} leading-tight`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {name}
                </h3>
                <p className="text-white/80 text-xs mt-0.5">
                  {area}, {city}
                </p>
              </div>
            </div>
          </>
        );
      })()}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={rating} />
              <span className="text-xs" style={{ color: textSecondary }}>
                ({totalReviews.toLocaleString()})
              </span>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: isDark ? "#252528" : "#fdf4f0", color: accent, border: `1px solid ${border}` }}
            >
              {cuisine}
            </span>
          </div>

          {/* Shortlist button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleShortlist();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 hover:scale-110"
            style={
              isShortlisted
                ? { 
                    background: accent, 
                    color: "white",
                    boxShadow: "0 2px 8px rgba(196,74,32,0.4)",
                  }
                : {
                    background: isDark ? "#252528" : "#fdf4f0",
                    color: accent,
                    border: `2px solid ${accent}`,
                  }
            }
            title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isShortlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        {!compact && (
          <>
            <p
              className="text-sm leading-relaxed mb-3 line-clamp-2"
              style={{ color: textSecondary }}
            >
              {description}
            </p>

            {/* Top dishes */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topDishes.slice(0, 3).map((dish) => (
                <span
                  key={dish}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: isDark ? "#252528" : "#fdf8f0", color: textSecondary, border: `1px solid ${border}` }}
                >
                  {dish}
                </span>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: isDark ? "#252528" : "#f5e8d8", color: textSecondary }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
