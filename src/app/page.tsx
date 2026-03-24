"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SEED_RESTAURANTS,
  SEED_MEMBERS,
  type Restaurant,
  type GroupMember,
} from "@/lib/data";
import DiscoverTab from "@/components/DiscoverTab";
import ShortlistTab from "@/components/ShortlistTab";
import VoteTab from "@/components/VoteTab";
import ManualAddTab from "@/components/ManualAddTab";
import RestaurantModal from "@/components/RestaurantModal";
import GroupSidebar from "@/components/GroupSidebar";
import ShareModal from "@/components/ShareModal";
import SelectionConfirmModal from "@/components/SelectionConfirmModal";

export type TabId = "discover" | "shortlist" | "vote" | "add";
export type SourceFilter = "all" | "ai" | "google" | "curated";

export interface VoteRecord {
  memberId: string;
  restaurantId: string;
  timestamp: number;
}

export interface AppState {
  restaurants: Restaurant[];
  shortlist: string[];
  votes: VoteRecord[];
  selectedTimeSlot: string;
  members: GroupMember[];
  currentUser: GroupMember;
  groupName: string;
  groupId: string;
}

function generateGroupId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function loadInitialState(): AppState {
  const base: AppState = {
    restaurants: SEED_RESTAURANTS,
    shortlist: [],
    votes: [],
    selectedTimeSlot: "",
    members: SEED_MEMBERS,
    currentUser: SEED_MEMBERS[0],
    groupName: "Weekend Dinner Crew",
    groupId: generateGroupId(),
  };

  if (typeof window === "undefined") return base;

  try {
    const saved = sessionStorage.getItem("forkd-state");
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AppState>;
      // Ensure votes have timestamp for backward compatibility
      const votes = (parsed.votes ?? base.votes).map((v: VoteRecord) => ({
        ...v,
        timestamp: v.timestamp ?? Date.now(),
      }));
      return {
        ...base,
        shortlist: parsed.shortlist ?? base.shortlist,
        votes,
        selectedTimeSlot: parsed.selectedTimeSlot ?? base.selectedTimeSlot,
        groupName: parsed.groupName ?? base.groupName,
        groupId: parsed.groupId ?? base.groupId,
        restaurants: [
          ...SEED_RESTAURANTS,
          ...(parsed.restaurants?.filter((r: Restaurant) => r.isManuallyAdded) ?? []),
        ],
      };
    }
  } catch {
    // ignore
  }

  return base;
}

function loadDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("forkd-dark-mode");
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("discover");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGroupSidebar, setShowGroupSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(loadDarkMode);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedWinner, setSelectedWinner] = useState<Restaurant | null>(null);

  const [state, setState] = useState<AppState>(loadInitialState);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("forkd-dark-mode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Session storage persistence
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "forkd-state",
        JSON.stringify({
          shortlist: state.shortlist,
          votes: state.votes,
          selectedTimeSlot: state.selectedTimeSlot,
          groupName: state.groupName,
          groupId: state.groupId,
          restaurants: state.restaurants.filter((r) => r.isManuallyAdded),
        })
      );
    } catch {
      // ignore
    }
  }, [state]);

  const toggleShortlist = useCallback((restaurantId: string) => {
    setState((prev) => ({
      ...prev,
      shortlist: prev.shortlist.includes(restaurantId)
        ? prev.shortlist.filter((id) => id !== restaurantId)
        : [...prev.shortlist, restaurantId],
    }));
  }, []);

   const castVote = useCallback(
     (restaurantId: string) => {
       setState((prev) => {
         const existingVote = prev.votes.find(
           (v) => v.memberId === prev.currentUser.id
         );
         if (existingVote) {
           return {
             ...prev,
             votes: prev.votes.map((v) =>
               v.memberId === prev.currentUser.id
                 ? { ...v, restaurantId, timestamp: Date.now() }
                 : v
             ),
           };
         }
         return {
           ...prev,
           votes: [
             ...prev.votes,
             { memberId: prev.currentUser.id, restaurantId, timestamp: Date.now() },
           ],
         };
       });
     },
     []
   );

  const resetVotes = useCallback(() => {
    setState((prev) => ({ ...prev, votes: [] }));
  }, []);

  const setTimeSlot = useCallback((slot: string) => {
    setState((prev) => ({ ...prev, selectedTimeSlot: slot }));
  }, []);

  const addManualRestaurant = useCallback((restaurant: Restaurant) => {
    setState((prev) => ({
      ...prev,
      restaurants: [restaurant, ...prev.restaurants],
    }));
  }, []);

  const setCurrentUser = useCallback((member: GroupMember) => {
    setState((prev) => ({ ...prev, currentUser: member }));
  }, []);

  const shortlistCount = state.shortlist.length;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "shortlist", label: "Shortlist", icon: "★" },
    { id: "vote", label: "Vote & Time", icon: "🗳️" },
    { id: "add", label: "Add", icon: "➕" },
  ];

  // Determine current winner from votes
  const voteMap: Record<string, string[]> = {};
  state.votes.forEach((v) => {
    if (!voteMap[v.restaurantId]) voteMap[v.restaurantId] = [];
    voteMap[v.restaurantId].push(v.memberId);
  });

  const shortlisted = state.restaurants.filter((r) => state.shortlist.includes(r.id));
  const maxVotes = Math.max(...shortlisted.map((r) => voteMap[r.id]?.length ?? 0), 0);
  const winners = shortlisted.filter(
    (r) => (voteMap[r.id]?.length ?? 0) === maxVotes && maxVotes > 0
  );
  const isTie = winners.length > 1;

  const handleConfirmWinner = () => {
    if (winners.length === 1 && !isTie) {
      setSelectedWinner(winners[0]);
    } else if (isTie) {
      // Can't confirm a tie - need to use wheel first
      setActiveTab("vote");
    }
  };

  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0e0cc";
  const headerBg = isDark ? "rgba(15,15,16,0.92)" : "rgba(253,248,240,0.92)";
  const tabBg = isDark ? "#1a1a1d" : "#f5e8d8";

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: headerBg,
          backdropFilter: "blur(12px)",
          borderColor: border,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: `linear-gradient(135deg, ${accent}, #d97706)` }}
            >
              F
            </div>
            <div>
              <h1
                className="text-xl font-bold leading-none"
                style={{ fontFamily: "var(--font-display)", color: textPrimary }}
              >
                Forkd
              </h1>
              <p className="text-xs leading-none mt-0.5" style={{ color: textSecondary }}>
                {state.groupName}
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                color: textSecondary,
              }}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Current user selector */}
            <button
              onClick={() => setShowGroupSidebar(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                color: textPrimary,
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: state.currentUser.color }}
              >
                {state.currentUser.avatar}
              </span>
              <span className="hidden sm:inline">{state.currentUser.name}</span>
            </button>

            {/* Share button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: `linear-gradient(135deg, ${accent}, #d97706)`,
                color: "white",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: tabBg }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  activeTab === tab.id
                    ? {
                        background: `linear-gradient(135deg, ${accent}, #d97706)`,
                        color: "white",
                        boxShadow: "0 4px 15px rgba(196,74,32,0.35)",
                      }
                    : { color: textSecondary }
                }
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === "shortlist" && shortlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background:
                        activeTab === "shortlist"
                          ? "rgba(255,255,255,0.3)"
                          : accent,
                    }}
                  >
                    {shortlistCount}
                  </span>
                )}
                {tab.id === "vote" && state.votes.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background:
                        activeTab === "vote"
                          ? "rgba(255,255,255,0.3)"
                          : "#059669",
                    }}
                  >
                    {state.votes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "discover" && (
          <DiscoverTab
            restaurants={state.restaurants}
            shortlist={state.shortlist}
            onToggleShortlist={toggleShortlist}
            onSelectRestaurant={setSelectedRestaurant}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            darkMode={darkMode}
          />
        )}
        {activeTab === "shortlist" && (
          <ShortlistTab
            restaurants={state.restaurants}
            shortlist={state.shortlist}
            votes={state.votes}
            members={state.members}
            onToggleShortlist={toggleShortlist}
            onSelectRestaurant={setSelectedRestaurant}
            onGoToVote={() => setActiveTab("vote")}
            onConfirmWinner={handleConfirmWinner}
            hasWinner={winners.length === 1 && !isTie}
            darkMode={darkMode}
          />
        )}
        {activeTab === "vote" && (
          <VoteTab
            restaurants={state.restaurants}
            shortlist={state.shortlist}
            votes={state.votes}
            members={state.members}
            currentUser={state.currentUser}
            selectedTimeSlot={state.selectedTimeSlot}
            onCastVote={castVote}
            onResetVotes={resetVotes}
            onSetTimeSlot={setTimeSlot}
            onSelectRestaurant={setSelectedRestaurant}
            darkMode={darkMode}
          />
        )}
        {activeTab === "add" && (
          <ManualAddTab
            onAddRestaurant={(r: Restaurant) => {
              addManualRestaurant(r);
              setActiveTab("discover");
            }}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t md:hidden z-40"
        style={{ 
          background: headerBg, 
          backdropFilter: "blur(12px)",
          borderColor: border,
          paddingBottom: "env(safe-area-inset-bottom)"
        }}>
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === tab.id ? "scale-105" : ""
              }`}
              style={{
                color: activeTab === tab.id ? accent : textSecondary,
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.id === "shortlist" && shortlistCount > 0 && (
                <span className="absolute top-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: accent, right: "20%" }}>
                  {shortlistCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          isShortlisted={state.shortlist.includes(selectedRestaurant.id)}
          onToggleShortlist={() => toggleShortlist(selectedRestaurant.id)}
          onClose={() => setSelectedRestaurant(null)}
          darkMode={darkMode}
        />
      )}

      {/* Selection Confirmation Modal */}
      {selectedWinner && (
        <SelectionConfirmModal
          restaurant={selectedWinner}
          timeSlot={state.selectedTimeSlot}
          groupName={state.groupName}
          members={state.members}
          onClose={() => setSelectedWinner(null)}
          darkMode={darkMode}
        />
      )}

      {/* Group Sidebar */}
      {showGroupSidebar && (
        <GroupSidebar
          members={state.members}
          currentUser={state.currentUser}
          groupName={state.groupName}
          onSelectUser={setCurrentUser}
          onClose={() => setShowGroupSidebar(false)}
          onUpdateGroupName={(name: string) =>
            setState((prev) => ({ ...prev, groupName: name }))
          }
          darkMode={darkMode}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          groupId={state.groupId}
          groupName={state.groupName}
          onClose={() => setShowShareModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}