"use client";

import { useState, useEffect } from "react";

interface Props {
  groupId: string;
  groupName: string;
  onClose: () => void;
  darkMode?: boolean;
}

export default function ShareModal({ groupId, groupName, onClose, darkMode = false }: Props) {
  const [copied, setCopied] = useState(false);

  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}?group=${groupId}`
      : `https://forkd.app?group=${groupId}`;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Forkd — ${groupName}`,
          text: `Join our restaurant vote for "${groupName}" on Forkd!`,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,12,9,0.7)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "#fdf8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5"
          style={{ background: "linear-gradient(135deg, #c44a20, #d97706)" }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Share with Your Group
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Send this link so everyone can join the vote
          </p>
        </div>

        <div className="p-5">
          {/* Group info */}
          <div
            className="rounded-2xl p-4 mb-4 flex items-center gap-3"
            style={{ background: "white", border: "1px solid #f0d8c4" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: "linear-gradient(135deg, #c44a20, #d97706)" }}
            >
              F
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#2d2420" }}>
                {groupName}
              </p>
              <p className="text-xs" style={{ color: "#8a5a40" }}>
                Group ID: {groupId}
              </p>
            </div>
          </div>

          {/* Share URL */}
          <div className="mb-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#a06040" }}
            >
              Group Link
            </p>
            <div
              className="flex gap-2 p-3 rounded-2xl"
              style={{ background: "white", border: "1px solid #f0d8c4" }}
            >
              <p
                className="flex-1 text-sm truncate"
                style={{ color: "#6b4030" }}
              >
                {shareUrl}
              </p>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-xl transition-all"
                style={
                  copied
                    ? { background: "#059669", color: "white" }
                    : { background: "#f5e8d8", color: "#6b3a20" }
                }
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Share actions */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{ background: "white", border: "1px solid #f0d8c4" }}
            >
              <span className="text-xl">🔗</span>
              <span className="text-sm font-semibold" style={{ color: "#2d2420" }}>
                Copy Link
              </span>
              {copied && (
                <span className="ml-auto text-xs font-semibold" style={{ color: "#059669" }}>
                  Copied!
                </span>
              )}
            </button>

            {hasNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{ background: "white", border: "1px solid #f0d8c4" }}
              >
                <span className="text-xl">📤</span>
                <span className="text-sm font-semibold" style={{ color: "#2d2420" }}>
                  Share via...
                </span>
              </button>
            )}

            <button
              onClick={() => {
                const msg = `Join our restaurant vote for "${groupName}" on Forkd! ${shareUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{ background: "white", border: "1px solid #f0d8c4" }}
            >
              <span className="text-xl">💬</span>
              <span className="text-sm font-semibold" style={{ color: "#2d2420" }}>
                Share on WhatsApp
              </span>
            </button>
          </div>

          <p
            className="text-xs text-center mt-4"
            style={{ color: "#a06040" }}
          >
            Anyone with this link can view the shortlist and vote
          </p>
        </div>
      </div>
    </div>
  );
}
