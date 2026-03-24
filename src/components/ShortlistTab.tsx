"use client";

import { type Restaurant, type GroupMember } from "@/lib/data";
import { type VoteRecord } from "@/app/page";
import RestaurantCard from "@/components/RestaurantCard";

interface Props {
  restaurants: Restaurant[];
  shortlist: string[];
  votes: VoteRecord[];
  members: GroupMember[];
  onToggleShortlist: (id: string) => void;
  onSelectRestaurant: (r: Restaurant) => void;
  onGoToVote: () => void;
  onConfirmWinner?: () => void;
  hasWinner?: boolean;
  darkMode?: boolean;
}

export default function ShortlistTab({
  restaurants,
  shortlist,
  votes,
  members,
  onToggleShortlist,
  onSelectRestaurant,
  onGoToVote,
  onConfirmWinner,
  hasWinner,
  darkMode = false,
}: Props) {
  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";
  const shortlisted = restaurants.filter((r) => shortlist.includes(r.id));

  // Vote count per restaurant
  const voteMap: Record<string, string[]> = {};
  votes.forEach((v) => {
    if (!voteMap[v.restaurantId]) voteMap[v.restaurantId] = [];
    voteMap[v.restaurantId].push(v.memberId);
  });

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  if (shortlisted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
          style={{ background: "#fdf4f0", border: "2px dashed #f0d8c4" }}
        >
          ★
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
        >
          Your shortlist is empty
        </h2>
        <p className="text-sm max-w-xs mb-6" style={{ color: "#8a5a40" }}>
          Tap the star icon on any restaurant in the Discover tab to add it here.
        </p>
        <p className="text-xs" style={{ color: "#a06040" }}>
          Once you have a few restaurants here, share the list with your group and vote!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
          >
            Shortlist
          </h2>
          <p className="text-sm" style={{ color: "#8a5a40" }}>
            {shortlisted.length} restaurant{shortlisted.length !== 1 ? "s" : ""} · {votes.length} vote{votes.length !== 1 ? "s" : ""} cast
          </p>
        </div>
        <button
          onClick={onGoToVote}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #c44a20, #d97706)",
            color: "white",
          }}
        >
          <span>Vote Now</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Vote summary if votes exist */}
      {votes.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: "#fdf4f0", border: "1px solid #f7ccb9" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#a06040" }}>
            Live Vote Preview
          </p>
          <div className="space-y-2">
            {shortlisted
              .map((r) => ({
                restaurant: r,
                count: voteMap[r.id]?.length ?? 0,
              }))
              .sort((a, b) => b.count - a.count)
              .map(({ restaurant: r, count }) => {
                const pct = votes.length > 0 ? Math.round((count / votes.length) * 100) : 0;
                const voters = (voteMap[r.id] ?? [])
                  .map(getMemberById)
                  .filter(Boolean);
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#2d2420" }}>
                        {r.name}
                      </p>
                    </div>
                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#f0d8c4" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: count === Math.max(...shortlisted.map((s) => voteMap[s.id]?.length ?? 0))
                            && count > 0
                            ? "linear-gradient(90deg, #c44a20, #d97706)"
                            : "#e87d54",
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 w-20 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: "#2d2420" }}>
                        {pct}%
                      </span>
                      <div className="flex -space-x-1">
                        {voters.slice(0, 3).map((m) => (
                          <span
                            key={m!.id}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white"
                            style={{ background: m!.color }}
                            title={m!.name}
                          >
                            {m!.avatar}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Restaurant cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shortlisted.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isShortlisted={true}
            onToggleShortlist={() => onToggleShortlist(restaurant.id)}
            onSelect={() => onSelectRestaurant(restaurant)}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
}
