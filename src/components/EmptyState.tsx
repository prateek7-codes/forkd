"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  suggestion?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = "🍽️",
  title,
  description,
  suggestion,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-8">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 animate-bounce"
        style={{ background: "var(--bg-secondary, #fdf4f0)", border: "2px dashed var(--border, #f0d8c4)" }}
      >
        {icon}
      </div>
      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary, #2d2420)" }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm max-w-sm mb-2" style={{ color: "var(--text-secondary, #8a5a40)" }}>
          {description}
        </p>
      )}
      {suggestion && (
        <p className="text-sm max-w-sm mb-6 px-4 py-2 rounded-xl" style={{ 
          background: "var(--bg-secondary, #fef3c7)", 
          color: "var(--accent, #b45309)",
          border: "1px solid var(--border, #fcd34d)"
        }}>
          💡 {suggestion}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "var(--accent, linear-gradient(135deg, #c44a20, #d97706))",
            color: "white",
            boxShadow: "0 4px 15px rgba(196,74,32,0.3)",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  suggestion?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Oops! Something went wrong",
  message = "We couldn't load what you were looking for.",
  suggestion,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-8">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6"
        style={{ background: "#fef2f2", border: "2px solid #fecaca" }}
      >
        😔
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "#dc2626" }}
      >
        {title}
      </h2>
      <p className="text-sm max-w-sm mb-2" style={{ color: "var(--text-secondary, #8a5a40)" }}>
        {message}
      </p>
      {suggestion && (
        <p className="text-sm max-w-sm mb-6 px-4 py-2 rounded-xl" style={{ 
          background: "#fef3c7", 
          color: "#b45309",
        }}>
          💡 {suggestion}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "var(--accent, #c44a20)",
            color: "white",
            boxShadow: "0 4px 15px rgba(196,74,32,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  suggestion?: string;
}

export function LoadingState({ 
  message = "Loading delicious options...", 
  suggestion 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-8">
      <div className="relative w-16 h-16 mb-6">
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "var(--accent, #c44a20)", opacity: 0.3 }}
        />
        <div
          className="absolute inset-2 rounded-full animate-spin"
          style={{
            background: "conic-gradient(var(--accent, transparent 60%, var(--accent))",
            animation: "spin 1s linear infinite",
          }}
        />
        <div 
          className="absolute inset-0 flex items-center justify-center text-2xl"
        >
          🍴
        </div>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary, #2d2420)" }}>
        {message}
      </p>
      {suggestion && (
        <p className="text-xs" style={{ color: "var(--text-secondary, #8a5a40)" }}>
          {suggestion}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface EmptySearchProps {
  query: string;
  onClear: () => void;
  suggestions?: string[];
}

export function EmptySearch({ query, onClear, suggestions }: EmptySearchProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-8">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6"
        style={{ background: "var(--bg-secondary, #fdf4f0)", border: "2px dashed var(--border, #f0d8c4)" }}
      >
        🔍
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary, #2d2420)" }}
      >
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-sm max-w-sm mb-4" style={{ color: "var(--text-secondary, #8a5a40)" }}>
        We couldn&apos;t find any restaurants matching your search. Try different keywords or adjust your filters.
      </p>
      {suggestions && suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary, #8a5a40)" }}>
            Try searching for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "var(--bg-secondary, #f5e8d8)", color: "var(--text-primary, #6b3a20)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onClear}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        style={{
          background: "var(--accent, #c44a20)",
          color: "white",
        }}
      >
        Clear Search
      </button>
    </div>
  );
}