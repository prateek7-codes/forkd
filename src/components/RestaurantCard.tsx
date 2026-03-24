"use client";

import { type Restaurant } from "@/lib/data";

interface Props {
  restaurant: Restaurant;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  onSelect: () => void;
  compact?: boolean;
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
}: Props) {
  const { name, area, city, cuisine, budget, rating, totalReviews, description, topDishes, tags, imageColor, isManuallyAdded } =
    restaurant;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group"
      style={{
        background: "white",
        border: "1px solid #f0d8c4",
        boxShadow: "0 2px 8px rgba(196,74,32,0.06)",
      }}
      onClick={onSelect}
    >
      {/* Image placeholder */}
      <div
        className={`relative ${compact ? "h-28" : "h-40"} bg-gradient-to-br ${imageColor} flex items-end p-3`}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badge */}
        {isManuallyAdded && (
          <span
            className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#d97706", color: "white" }}
          >
            Added by you
          </span>
        )}

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

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={rating} />
              <span className="text-xs" style={{ color: "#8a5a40" }}>
                ({totalReviews.toLocaleString()})
              </span>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#fdf4f0", color: "#c44a20", border: "1px solid #f7ccb9" }}
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
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={
              isShortlisted
                ? { background: "#c44a20", color: "white" }
                : {
                    background: "#fdf4f0",
                    color: "#c44a20",
                    border: "1px solid #f7ccb9",
                  }
            }
            title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
          >
            <svg
              width="16"
              height="16"
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
              style={{ color: "#6b4030" }}
            >
              {description}
            </p>

            {/* Top dishes */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topDishes.slice(0, 3).map((dish) => (
                <span
                  key={dish}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "#fdf8f0", color: "#8a5a40", border: "1px solid #f0d8c4" }}
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
                  style={{ background: "#f5e8d8", color: "#7c4a20" }}
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
