"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = "🍽️",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
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
        <p className="text-sm max-w-xs mb-6" style={{ color: "var(--text-secondary, #8a5a40)" }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "var(--accent, linear-gradient(135deg, #c44a20, #d97706))",
            color: "white",
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
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again later.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
        style={{ background: "#fef2f2", border: "2px solid #fecaca" }}
      >
        ⚠️
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "#dc2626" }}
      >
        {title}
      </h2>
      <p className="text-sm max-w-xs mb-6" style={{ color: "var(--text-secondary, #8a5a40)" }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "var(--accent, #c44a20)",
            color: "white",
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
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div className="w-12 h-12 mb-4 relative">
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "var(--accent, #c44a20)", opacity: 0.5 }}
        />
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: "conic-gradient(var(--accent, #c44a20) 0deg, transparent 120deg)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary, #8a5a40)" }}>
        {message}
      </p>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
