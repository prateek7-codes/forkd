"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { type Restaurant } from "@/lib/data";

interface MapViewProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedId?: string;
  darkMode?: boolean;
}

interface MapCenter {
  lat: number;
  lng: number;
}

const DEFAULT_CENTER: MapCenter = { lat: 19.076, lng: 72.8777 };

function getCenterFromRestaurants(restaurants: Restaurant[]): MapCenter | null {
  const withGeo = restaurants.filter((r) => r.geometry?.lat && r.geometry?.lng);
  if (withGeo.length === 0) return null;

  const sumLat = withGeo.reduce((sum, r) => sum + (r.geometry?.lat ?? 0), 0);
  const sumLng = withGeo.reduce((sum, r) => sum + (r.geometry?.lng ?? 0), 0);

  return {
    lat: sumLat / withGeo.length,
    lng: sumLng / withGeo.length,
  };
}

export default function MapView({
  restaurants,
  onSelectRestaurant,
  darkMode = false,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<unknown>(null);

  const isDark = darkMode;
  const mapContainerBg = isDark ? "#1a1a1d" : "#fdf8f0";
  const textPrimary = isDark ? "#f5f5f5" : "#2d2420";
  const textSecondary = isDark ? "#9ca3af" : "#8a5a40";
  const accent = isDark ? "#ff8a3d" : "#c44a20";

  // Check for Google Maps API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Initialize error state with lazy initializer to avoid setState in effect
  const [mapError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    if (!apiKey) return "Google Maps API key not configured";
    return null;
  });

  // Check if Google Maps is already loaded
  const checkGoogleMaps = useCallback(() => {
    return typeof window !== "undefined" && 
           typeof (window as unknown as { google?: unknown }).google !== "undefined" &&
           (window as unknown as { google?: { maps?: unknown } }).google?.maps;
  }, []);

  useEffect(() => {
    if (!apiKey || mapError) {
      return;
    }

    if (checkGoogleMaps()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (checkGoogleMaps()) {
          clearInterval(checkInterval);
          setMapLoaded(true);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      // Silently fail - error state already handled by lazy init
    };

    document.head.appendChild(script);
  }, [apiKey, checkGoogleMaps, mapError]);

  // Initialize map when loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const google = (window as unknown as { google?: { maps: unknown } }).google;
    if (!google?.maps) return;

    const gm = google.maps as {
      Map: new (element: HTMLElement, options: unknown) => unknown;
      Marker: new (options: { position: { lat: number; lng: number }; map: unknown; title?: string; animation?: number }) => { addListener: (event: string, cb: () => void) => void };
      InfoWindow: new (options: { content?: string }) => { open: (map: unknown, marker: unknown) => void; addListener: (event: string, cb: () => void) => void };
      LatLngBounds: new () => { extend: (position: { lat: number; lng: number }) => void; fitBounds: (bounds: unknown, padding: number) => void };
      Animation: { DROP: number };
    };

    const center = getCenterFromRestaurants(restaurants) ?? DEFAULT_CENTER;

    mapInstanceRef.current = new gm.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: isDark ? DARK_MAP_STYLES : undefined,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    });

    restaurants.forEach((restaurant) => {
      if (!restaurant.geometry?.lat || !restaurant.geometry?.lng) return;

      const marker = new gm.Marker({
        position: {
          lat: restaurant.geometry.lat,
          lng: restaurant.geometry.lng,
        },
        map: mapInstanceRef.current,
        title: restaurant.name,
        animation: gm.Animation.DROP,
      });

      const infoContent = `
        <div style="padding: 8px; max-width: 200px; font-family: system-ui, sans-serif;">
          <h3 style="font-weight: bold; margin: 0 0 4px; font-size: 14px;">${restaurant.name}</h3>
          <p style="margin: 0; font-size: 11px; color: #666;">${restaurant.cuisine} · ${restaurant.budget}</p>
          <p style="margin: 4px 0 0; font-size: 11px;">⭐ ${restaurant.rating.toFixed(1)} (${restaurant.totalReviews.toLocaleString()})</p>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('selectRestaurant', { detail: '${restaurant.id}' }))"
            style="margin-top: 8px; padding: 4px 12px; background: ${accent}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;"
          >
            View Details
          </button>
        </div>
      `;

      const infoWindow = new gm.InfoWindow({ content: infoContent });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });
    });

    if (restaurants.length > 1) {
      const bounds = new gm.LatLngBounds();
      restaurants.forEach((r) => {
        if (r.geometry?.lat && r.geometry?.lng) {
          bounds.extend({ lat: r.geometry.lat, lng: r.geometry.lng });
        }
      });
      (mapInstanceRef.current as { fitBounds: (b: unknown, p: number) => void }).fitBounds(bounds, 50);
    }

    const handleSelectRestaurant = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const restaurant = restaurants.find((r) => r.id === customEvent.detail);
      if (restaurant) {
        onSelectRestaurant(restaurant);
      }
    };

    window.addEventListener("selectRestaurant", handleSelectRestaurant);

    return () => {
      window.removeEventListener("selectRestaurant", handleSelectRestaurant);
    };
  }, [mapLoaded, restaurants, isDark, onSelectRestaurant, accent]);

  if (mapError) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{ 
          background: mapContainerBg, 
          minHeight: "400px",
          border: `1px solid ${isDark ? "#2d2d30" : "#f0d8c4"}` 
        }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="font-semibold mb-1" style={{ color: textPrimary }}>
            Map View Unavailable
          </p>
          <p className="text-sm" style={{ color: textSecondary }}>
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{ 
          background: mapContainerBg, 
          minHeight: "400px",
          border: `1px solid ${isDark ? "#2d2d30" : "#f0d8c4"}` 
        }}
      >
        <div className="text-center">
          <div 
            className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-t-transparent animate-spin" 
            style={{ borderColor: accent, borderTopColor: "transparent" }} 
          />
          <p className="text-sm" style={{ color: textSecondary }}>
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="rounded-2xl overflow-hidden"
      style={{ 
        height: "500px", 
        width: "100%",
        border: `1px solid ${isDark ? "#2d2d30" : "#f0d8c4"}` 
      }}
    />
  );
}

// Dark mode map styles
const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
];
