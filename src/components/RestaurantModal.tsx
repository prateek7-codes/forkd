"use client";

import { useEffect } from "react";
import { type Restaurant } from "@/lib/data";

interface Props {
  restaurant: Restaurant;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  onClose: () => void;
}

function StarRating({ rating, large = false }: { rating: number; large?: boolean }) {
  const size = large ? 18 : 14;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
            stroke="#f59e0b"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span
        className={`font-bold ${large ? "text-lg" : "text-sm"}`}
        style={{ color: "#2d2420" }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function RestaurantModal({
  restaurant,
  isShortlisted,
  onToggleShortlist,
  onClose,
}: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const {
    name,
    area,
    city,
    cuisine,
    budget,
    rating,
    totalReviews,
    description,
    topDishes,
    tags,
    reviews,
    imageColor,
  } = restaurant;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,12,9,0.7)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg sm:rounded-3xl overflow-hidden"
        style={{
          background: "#fdf8f0",
          maxHeight: "90vh",
          borderRadius: "24px 24px 0 0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll container */}
        <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
          {/* Hero image */}
          <div
            className={`relative h-52 bg-gradient-to-br ${imageColor}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2
                    className="text-2xl font-bold text-white leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {name}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {area}, {city}
                  </p>
                </div>
                <span
                  className="text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
                >
                  {budget}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Rating + cuisine */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StarRating rating={rating} large />
                <span className="text-sm" style={{ color: "#8a5a40" }}>
                  ({totalReviews.toLocaleString()} reviews)
                </span>
              </div>
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: "#fdf4f0", color: "#c44a20", border: "1px solid #f7ccb9" }}
              >
                {cuisine}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#4a2c1c" }}>
              {description}
            </p>

            {/* Top dishes */}
            <div className="mb-4">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#a06040" }}
              >
                Must-Try Dishes
              </p>
              <div className="flex flex-wrap gap-2">
                {topDishes.map((dish) => (
                  <span
                    key={dish}
                    className="text-sm px-3 py-1.5 rounded-xl font-medium"
                    style={{
                      background: "#fdf4f0",
                      color: "#c44a20",
                      border: "1px solid #f7ccb9",
                    }}
                  >
                    🍽️ {dish}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-5">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#a06040" }}
              >
                Vibe
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "#f5e8d8", color: "#7c4a20" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mb-5">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#a06040" }}
                >
                  What People Say
                </p>
                <div className="space-y-3">
                  {reviews.map((review, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4"
                      style={{ background: "white", border: "1px solid #f0d8c4" }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{
                            background: `hsl(${(review.author.charCodeAt(0) * 37) % 360}, 60%, 50%)`,
                          }}
                        >
                          {review.avatar}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold" style={{ color: "#2d2420" }}>
                              {review.author}
                            </p>
                            <p className="text-xs" style={{ color: "#a06040" }}>
                              {review.date}
                            </p>
                          </div>
                          <div className="flex mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill={star <= review.rating ? "#f59e0b" : "none"}
                                stroke="#f59e0b"
                                strokeWidth="2"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "#4a2c1c" }}>
                        &ldquo;{review.text}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={onToggleShortlist}
              className="w-full py-3 rounded-2xl text-base font-bold transition-all"
              style={
                isShortlisted
                  ? {
                      background: "#fdf4f0",
                      color: "#c44a20",
                      border: "2px solid #c44a20",
                    }
                  : {
                      background: "linear-gradient(135deg, #c44a20, #d97706)",
                      color: "white",
                      boxShadow: "0 4px 20px rgba(196,74,32,0.4)",
                    }
              }
            >
              {isShortlisted ? "★ Remove from Shortlist" : "★ Add to Shortlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
