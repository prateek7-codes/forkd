"use client";

import { useState, useEffect } from "react";
import { type GroupMember } from "@/lib/data";

interface Props {
  members: GroupMember[];
  currentUser: GroupMember;
  groupName: string;
  onSelectUser: (member: GroupMember) => void;
  onClose: () => void;
  onUpdateGroupName: (name: string) => void;
  darkMode?: boolean;
}

export default function GroupSidebar({
  members,
  currentUser,
  groupName,
  onSelectUser,
  onClose,
  onUpdateGroupName,
  darkMode = false,
}: Props) {
  const isDark = darkMode;
  const bg = isDark ? "#0f0f10" : "#fdf8f0";
  const cardBg = isDark ? "#1a1a1d" : "white";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";
  const border = isDark ? "#2d2d30" : "#f0d8c4";
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(groupName);

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

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateGroupName(nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,12,9,0.5)", backdropFilter: "blur(4px)" }}
      />

      <div
        className="relative w-full max-w-sm h-full overflow-y-auto"
        style={{ background: "#fdf8f0", boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 border-b"
          style={{
            background: "linear-gradient(135deg, #c44a20, #d97706)",
            borderColor: "transparent",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Group Settings
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

          {/* Group name */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-white/70">
              Group Name
            </p>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  autoFocus
                  className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 text-white"
                onClick={() => setEditingName(true)}
              >
                <span className="font-semibold">{groupName}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="p-5">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: "#a06040" }}
          >
            Group Members — Tap to switch user
          </p>

          <div className="space-y-2">
            {members.map((member) => {
              const isActive = member.id === currentUser.id;
              return (
                <button
                  key={member.id}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left"
                  style={
                    isActive
                      ? {
                          background: "#fdf4f0",
                          border: "2px solid #c44a20",
                        }
                      : {
                          background: "white",
                          border: "1px solid #f0d8c4",
                        }
                  }
                  onClick={() => {
                    onSelectUser(member);
                    onClose();
                  }}
                >
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{ background: member.color }}
                  >
                    {member.avatar}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#2d2420" }}>
                      {member.name}
                    </p>
                    {isActive && (
                      <p className="text-xs" style={{ color: "#c44a20" }}>
                        Currently voting as this user
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c44a20" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="mt-6 rounded-2xl p-4"
            style={{ background: "#f5e8d8", border: "1px solid #e8d0b8" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#6b3a20" }}>
              How group voting works
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#8a5a40" }}>
              Switch between members to simulate the full group voting experience. Each member can vote once — switching users lets you vote for different people. In a real session, share the group link so everyone votes from their own device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
