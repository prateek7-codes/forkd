"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseStyles = "bg-gray-200 dark:bg-gray-700";
  const animateStyles = animate ? "animate-pulse" : "";
  
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  const style: React.CSSProperties = {
    width: width ?? "100%",
    height: height ?? (variant === "text" ? "1em" : "100%"),
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animateStyles} ${className}`}
      style={style}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg, white)" }}>
      <Skeleton height={160} />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-1">
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={10} />
            </div>
          </div>
          <Skeleton variant="circular" width={36} height={36} />
        </div>
        <Skeleton width="100%" height={14} />
        <Skeleton width="70%" height={14} />
        <div className="flex gap-2">
          <Skeleton width={60} height={24} />
          <Skeleton width={80} height={24} />
          <Skeleton width={70} height={24} />
        </div>
      </div>
    </div>
  );
}

export function RestaurantListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
