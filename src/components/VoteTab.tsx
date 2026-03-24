"use client";

import { useState, useRef, useEffect } from "react";
import { type Restaurant, type GroupMember, TIME_SLOTS } from "@/lib/data";
import { type VoteRecord } from "@/app/page";

interface Props {
  restaurants: Restaurant[];
  shortlist: string[];
  votes: VoteRecord[];
  members: GroupMember[];
  currentUser: GroupMember;
  selectedTimeSlot: string;
  onCastVote: (restaurantId: string) => void;
  onResetVotes: () => void;
  onSetTimeSlot: (slot: string) => void;
  onSelectRestaurant: (r: Restaurant) => void;
}

function WheelSpinner({
  restaurants,
  onResult,
}: {
  restaurants: Restaurant[];
  onResult: (winner: Restaurant) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number>(0);

  const COLORS = [
    "#c44a20", "#d97706", "#059669", "#7c3aed", "#db2777",
    "#0284c7", "#dc2626", "#ca8a04", "#16a34a", "#9333ea",
  ];

  useEffect(() => {
    drawWheel(rotationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants]);

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(cx, cy) - 10;
    const n = restaurants.length;
    const arc = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, W, H);

    restaurants.forEach((rest, i) => {
      const startAngle = rotation + i * arc;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.min(13, 120 / n)}px Inter, sans-serif`;
      const label = rest.name.length > 14 ? rest.name.slice(0, 14) + "…" : rest.name;
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#c44a20";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer
    ctx.beginPath();
    ctx.moveTo(cx + r - 5, cy);
    ctx.lineTo(cx + r + 15, cy - 10);
    ctx.lineTo(cx + r + 15, cy + 10);
    ctx.closePath();
    ctx.fillStyle = "#c44a20";
    ctx.fill();
  }

  function spin() {
    if (spinning || restaurants.length < 2) return;
    setSpinning(true);
    setWinner(null);

    const n = restaurants.length;
    const arc = (2 * Math.PI) / n;
    const extraSpins = 5 + Math.random() * 5;
    const finalAngle = Math.random() * 2 * Math.PI;
    const totalRotation = extraSpins * 2 * Math.PI + finalAngle;
    const duration = 3000;
    const start = performance.now();
    const startRotation = rotationRef.current;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      rotationRef.current = startRotation + totalRotation * easedProgress;
      drawWheel(rotationRef.current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Pointer is at angle 0 (right side), determine which segment
        const normalizedRotation =
          ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer at 0 degrees (right), so winning segment index:
        const pointerAngle = 0;
        const adjustedAngle =
          ((pointerAngle - normalizedRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const winnerIndex = Math.floor(adjustedAngle / arc) % n;
        const winnerRestaurant = restaurants[winnerIndex];
        setWinner(winnerRestaurant);
        onResult(winnerRestaurant);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="rounded-full"
          style={{ boxShadow: "0 8px 32px rgba(196,74,32,0.25)" }}
        />
      </div>
      <button
        onClick={spin}
        disabled={spinning || restaurants.length < 2}
        className="px-8 py-3 rounded-2xl text-base font-bold transition-all disabled:opacity-50"
        style={{
          background: spinning
            ? "#a06040"
            : "linear-gradient(135deg, #c44a20, #d97706)",
          color: "white",
          boxShadow: spinning ? "none" : "0 4px 20px rgba(196,74,32,0.4)",
        }}
      >
        {spinning ? "Spinning..." : "🎰 Spin the Wheel!"}
      </button>
      {winner && (
        <div
          className="rounded-2xl p-4 text-center w-full"
          style={{ background: "#fdf4f0", border: "2px solid #c44a20" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#a06040" }}>
            The wheel has spoken!
          </p>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "#c44a20" }}
          >
            🏆 {winner.name}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#8a5a40" }}>
            {winner.area}, {winner.city}
          </p>
        </div>
      )}
    </div>
  );
}

export default function VoteTab({
  restaurants,
  shortlist,
  votes,
  members,
  currentUser,
  selectedTimeSlot,
  onCastVote,
  onResetVotes,
  onSetTimeSlot,
  onSelectRestaurant,
}: Props) {
  const [showWheel, setShowWheel] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<Restaurant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Pre-generate confetti positions to avoid Math.random in render
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    left: ((i * 37 + 13) % 100),
    delay: ((i * 17) % 50) / 100,
    duration: 2 + ((i * 23) % 150) / 100,
    color: ["#c44a20", "#d97706", "#f59e0b", "#059669", "#7c3aed"][i % 5],
  }));

  const shortlisted = restaurants.filter((r) => shortlist.includes(r.id));

  // Vote counts
  const voteMap: Record<string, string[]> = {};
  votes.forEach((v) => {
    if (!voteMap[v.restaurantId]) voteMap[v.restaurantId] = [];
    voteMap[v.restaurantId].push(v.memberId);
  });

  const maxVotes = Math.max(...shortlisted.map((r) => voteMap[r.id]?.length ?? 0), 0);
  const winners = shortlisted.filter(
    (r) => (voteMap[r.id]?.length ?? 0) === maxVotes && maxVotes > 0
  );
  const isTie = winners.length > 1;

  const myVote = votes.find((v) => v.memberId === currentUser.id);
  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const handleVote = (restaurantId: string) => {
    onCastVote(restaurantId);
    if (!myVote) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  };

  const handleWheelResult = (winner: Restaurant) => {
    setWheelWinner(winner);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  if (shortlisted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
          style={{ background: "#fdf4f0", border: "2px dashed #f0d8c4" }}
        >
          🗳️
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
        >
          No restaurants to vote on
        </h2>
        <p className="text-sm max-w-xs" style={{ color: "#8a5a40" }}>
          Head to the Discover tab and add some restaurants to your shortlist first.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map((piece, i) => (
            <div
              key={i}
              className="confetti-piece absolute w-2 h-2 rounded-sm"
              style={{
                left: `${piece.left}%`,
                top: "-20px",
                background: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* Time slot selector */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "white", border: "1px solid #f0d8c4" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#a06040" }}
          >
            📅 Pick a Time Slot
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                onClick={() => onSetTimeSlot(slot.value)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={
                  selectedTimeSlot === slot.value
                    ? {
                        background: "linear-gradient(135deg, #c44a20, #d97706)",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(196,74,32,0.3)",
                      }
                    : {
                        background: "#f5e8d8",
                        color: "#6b3a20",
                      }
                }
              >
                {slot.label}
              </button>
            ))}
          </div>
          {selectedTimeSlot && (
            <p className="text-xs mt-2" style={{ color: "#c44a20" }}>
              ✓ Time locked in: {TIME_SLOTS.find((s) => s.value === selectedTimeSlot)?.label}
            </p>
          )}
        </div>

        {/* Voting section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
              >
                Cast Your Vote
              </h2>
              <p className="text-sm" style={{ color: "#8a5a40" }}>
                Voting as{" "}
                <span
                  className="font-semibold px-1.5 py-0.5 rounded-full text-white text-xs"
                  style={{ background: currentUser.color }}
                >
                  {currentUser.name}
                </span>
              </p>
            </div>
            {votes.length > 0 && (
              <button
                onClick={onResetVotes}
                className="text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
                style={{ background: "#fdf4f0", color: "#c44a20", border: "1px solid #f7ccb9" }}
              >
                Reset Votes
              </button>
            )}
          </div>

          {/* Winner banner */}
          {winners.length === 1 && !isTie && votes.length > 0 && (
            <div
              className="rounded-2xl p-4 mb-4 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #c44a20, #d97706)",
                color: "white",
              }}
            >
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Current Leader
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {winners[0].name}
                </p>
                <p className="text-xs opacity-80">
                  {voteMap[winners[0].id]?.length ?? 0} vote{(voteMap[winners[0].id]?.length ?? 0) !== 1 ? "s" : ""}
                  {selectedTimeSlot && ` · ${TIME_SLOTS.find((s) => s.value === selectedTimeSlot)?.label}`}
                </p>
              </div>
            </div>
          )}

          {isTie && votes.length > 0 && (
            <div
              className="rounded-2xl p-4 mb-4 flex items-start gap-3"
              style={{ background: "#fdf4f0", border: "2px solid #f7ccb9" }}
            >
              <span className="text-2xl">⚖️</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "#c44a20" }}>
                  It&apos;s a tie! Use the wheel to break it.
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8a5a40" }}>
                  {winners.map((w) => w.name).join(" vs ")} are tied
                </p>
                <button
                  onClick={() => setShowWheel(true)}
                  className="mt-2 text-xs font-semibold underline"
                  style={{ color: "#c44a20" }}
                >
                  Spin the Tiebreaker Wheel →
                </button>
              </div>
            </div>
          )}

          {/* Vote bars */}
          <div className="space-y-3 mb-6">
            {shortlisted
              .map((r) => ({
                restaurant: r,
                count: voteMap[r.id]?.length ?? 0,
              }))
              .sort((a, b) => b.count - a.count)
              .map(({ restaurant, count }) => {
                const total = votes.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const isMyVote = myVote?.restaurantId === restaurant.id;
                const isLeader = count === maxVotes && count > 0 && !isTie;
                const voters = (voteMap[restaurant.id] ?? [])
                  .map(getMemberById)
                  .filter(Boolean);

                return (
                  <div
                    key={restaurant.id}
                    className="rounded-2xl p-4 transition-all cursor-pointer"
                    style={{
                      background: isMyVote ? "#fdf4f0" : "white",
                      border: isMyVote
                        ? "2px solid #c44a20"
                        : isLeader
                        ? "2px solid #d97706"
                        : "1px solid #f0d8c4",
                    }}
                    onClick={() => onSelectRestaurant(restaurant)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {isLeader && (
                            <span className="text-base">🏆</span>
                          )}
                          <p
                            className="font-bold text-base"
                            style={{
                              fontFamily: "var(--font-display)",
                              color: "#2d2420",
                            }}
                          >
                            {restaurant.name}
                          </p>
                        </div>
                        <p className="text-xs" style={{ color: "#8a5a40" }}>
                          {restaurant.area}, {restaurant.city} · {restaurant.cuisine} · {restaurant.budget}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(restaurant.id);
                        }}
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                        style={
                          isMyVote
                            ? {
                                background: "#c44a20",
                                color: "white",
                              }
                            : {
                                background: "#f5e8d8",
                                color: "#6b3a20",
                              }
                        }
                      >
                        {isMyVote ? "✓ Voted" : "Vote"}
                      </button>
                    </div>

                    {/* Vote bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="flex-1 h-2.5 rounded-full overflow-hidden"
                        style={{ background: "#f0d8c4" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background:
                              isLeader
                                ? "linear-gradient(90deg, #c44a20, #d97706)"
                                : "#e87d54",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold w-9 text-right"
                        style={{ color: "#2d2420" }}
                      >
                        {pct}%
                      </span>
                      <div className="flex -space-x-1 w-16">
                        {voters.slice(0, 4).map((m) => (
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

        {/* Spin the wheel section */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: "1px solid #f0d8c4" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#2d2420" }}
              >
                🎰 Spin the Wheel
              </h3>
              <p className="text-sm" style={{ color: "#8a5a40" }}>
                Can&apos;t decide? Let fate choose from your shortlist.
              </p>
            </div>
            <button
              onClick={() => setShowWheel((v) => !v)}
              className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{ background: "#f5e8d8", color: "#6b3a20" }}
            >
              {showWheel ? "Hide" : "Show Wheel"}
            </button>
          </div>

          {showWheel && (
            <WheelSpinner
              restaurants={shortlisted}
              onResult={handleWheelResult}
            />
          )}

          {wheelWinner && !showWheel && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: "#fdf4f0", border: "1px solid #f7ccb9" }}
            >
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2d2420" }}>
                  Wheel chose: {wheelWinner.name}
                </p>
                <button
                  onClick={() => setShowWheel(true)}
                  className="text-xs underline"
                  style={{ color: "#c44a20" }}
                >
                  Spin again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Group vote status */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "white", border: "1px solid #f0d8c4" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#a06040" }}
          >
            Group Status ({votes.length}/{members.length} voted)
          </p>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const memberVote = votes.find((v) => v.memberId === member.id);
              const votedFor = memberVote
                ? restaurants.find((r) => r.id === memberVote.restaurantId)
                : null;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: memberVote ? "#fdf4f0" : "#f5f5f5",
                    border: `1px solid ${memberVote ? "#f7ccb9" : "#e5e7eb"}`,
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: member.color }}
                  >
                    {member.avatar}
                  </span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#2d2420" }}>
                      {member.name}
                      {member.id === currentUser.id && (
                        <span className="ml-1 text-xs opacity-60">(you)</span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: memberVote ? "#c44a20" : "#9ca3af" }}>
                      {votedFor ? votedFor.name : "Not voted yet"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
