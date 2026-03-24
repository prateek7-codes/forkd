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

export type TabId = "discover" | "shortlist" | "vote" | "add";

export interface VoteRecord {
  memberId: string;
  restaurantId: string;
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
      return {
        ...base,
        shortlist: parsed.shortlist ?? base.shortlist,
        votes: parsed.votes ?? base.votes,
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("discover");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGroupSidebar, setShowGroupSidebar] = useState(false);

  const [state, setState] = useState<AppState>(loadInitialState);

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
                ? { ...v, restaurantId }
                : v
            ),
          };
        }
        return {
          ...prev,
          votes: [
            ...prev.votes,
            { memberId: prev.currentUser.id, restaurantId },
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

  return (
    <div className="min-h-screen" style={{ background: "#fdf8f0" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(253, 248, 240, 0.92)",
          backdropFilter: "blur(12px)",
          borderColor: "#f0e0cc",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "linear-gradient(135deg, #c44a20, #d97706)" }}
            >
              F
            </div>
            <div>
              <h1
                className="text-xl font-bold leading-none"
                style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
              >
                Forkd
              </h1>
              <p className="text-xs leading-none mt-0.5" style={{ color: "#a06040" }}>
                {state.groupName}
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* Current user selector */}
            <button
              onClick={() => setShowGroupSidebar(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: "#fdf4f0",
                border: "1px solid #f0d0c0",
                color: "#2d2420",
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
                background: "linear-gradient(135deg, #c44a20, #d97706)",
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
            style={{ background: "#f5e8d8" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  activeTab === tab.id
                    ? {
                        background:
                          "linear-gradient(135deg, #c44a20, #d97706)",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(196,74,32,0.35)",
                      }
                    : { color: "#8a5a40" }
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
                          : "#c44a20",
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
          />
        )}
        {activeTab === "add" && (
          <ManualAddTab
            onAddRestaurant={(r: Restaurant) => {
              addManualRestaurant(r);
              setActiveTab("discover");
            }}
          />
        )}
      </main>

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          isShortlisted={state.shortlist.includes(selectedRestaurant.id)}
          onToggleShortlist={() => toggleShortlist(selectedRestaurant.id)}
          onClose={() => setSelectedRestaurant(null)}
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
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          groupId={state.groupId}
          groupName={state.groupName}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
