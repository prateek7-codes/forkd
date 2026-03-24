"use client";

import { useState, useEffect } from "react";
import { type Restaurant, type GroupMember, TIME_SLOTS } from "@/lib/data";

interface Props {
  restaurant: Restaurant;
  timeSlot: string;
  groupName: string;
  members: GroupMember[];
  onClose: () => void;
  darkMode: boolean;
}

export default function SelectionConfirmModal({
  restaurant,
  timeSlot,
  groupName,
  members,
  onClose,
  darkMode,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [googleCalLink, setGoogleCalLink] = useState<string | null>(null);

  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0e0cc";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDownloadICS = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        restaurantId: restaurant.id,
        timeSlot: timeSlot || "dinner-19",
        groupName,
        members: members.map(m => m.name).join(", "),
      });
      const res = await fetch(`/api/calendar-event?${params}`);
      const data = await res.json() as { ics?: string };
      
      if (data.ics) {
        const blob = new Blob([data.ics], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `forkd-dinner-${restaurant.name.toLowerCase().replace(/\s+/g, "-")}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to download ICS:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleGoogleCalendar = async () => {
    try {
      const params = new URLSearchParams({
        restaurantId: restaurant.id,
        timeSlot: timeSlot || "dinner-19",
        groupName,
      });
      const res = await fetch(`/api/calendar-event?${params}`);
      const data = await res.json() as { googleCalendarUrl?: string };
      
      if (data.googleCalendarUrl) {
        window.open(data.googleCalendarUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to open Google Calendar:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const timeLabel = TIME_SLOTS.find(s => s.value === timeSlot)?.label || "Dinner";
    const message = `🍽️ We're going to ${restaurant.name}!\n\n📍 ${restaurant.area}, ${restaurant.city}\n🕕 ${timeLabel}\n👥 ${members.map(m => m.name).join(", ")}\n\nSelected via Forkd!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const timeLabel = TIME_SLOTS.find(s => s.value === timeSlot)?.label || "Dinner";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,12,9,0.7)", backdropFilter: "blur(4px)" }}
      />

      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div
          className="h-32 bg-gradient-to-br relative"
          style={{ background: `linear-gradient(135deg, ${accent}, #d97706)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🎉</span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.3)", color: "white" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h2
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "var(--font-display)", color: textPrimary }}
          >
            We&apos;re Dining at {restaurant.name}!
          </h2>
          <p className="text-sm mb-4" style={{ color: textSecondary }}>
            {restaurant.area}, {restaurant.city}
          </p>

          {/* Details */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: isDark ? "#252528" : "#fdf4f0", border: `1px solid ${border}` }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span style={{ color: textSecondary }}>🕕</span>
                <span className="text-sm" style={{ color: textPrimary }}>{timeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: textSecondary }}>👥</span>
                <span className="text-sm" style={{ color: textPrimary }}>
                  {members.map(m => m.name).join(", ")}
                </span>
              </div>
              {restaurant.topDishes.length > 0 && (
                <div className="flex items-start gap-2">
                  <span style={{ color: textSecondary }}>🍽️</span>
                  <span className="text-sm" style={{ color: textPrimary }}>
                    Try: {restaurant.topDishes.slice(0, 2).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleGoogleCalendar}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{ background: isDark ? "#252528" : "white", border: `1px solid ${border}` }}
            >
              <span className="text-xl">📅</span>
              <span className="text-sm font-semibold" style={{ color: textPrimary }}>
                Add to Google Calendar
              </span>
            </button>

            <button
              onClick={handleDownloadICS}
              disabled={downloading}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{ background: isDark ? "#252528" : "white", border: `1px solid ${border}` }}
            >
              <span className="text-xl">📥</span>
              <span className="text-sm font-semibold" style={{ color: textPrimary }}>
                {downloading ? "Generating..." : "Download .ics File"}
              </span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{ background: "#25D366", color: "white" }}
            >
              <span className="text-xl">💬</span>
              <span className="text-sm font-semibold">Share on WhatsApp</span>
            </button>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: textSecondary }}>
            Selected by {groupName} via Forkd
          </p>
        </div>
      </div>
    </div>
  );
}