import { NextRequest, NextResponse } from "next/server";
import { SEED_RESTAURANTS } from "@/lib/data";

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const restaurantId = searchParams.get("restaurantId");
  const timeSlot = searchParams.get("timeSlot") || "dinner-19";
  const dateStr = searchParams.get("date");
  const groupName = searchParams.get("groupName") || "Forkd Group";
  const members = searchParams.get("members") || "";

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
  }

  // Find the restaurant in seed data or manually added
  const restaurant = SEED_RESTAURANTS.find((r) => r.id === restaurantId);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  // Parse time slot to get hour
  const timeMap: Record<string, number> = {
    "lunch-12": 12, "lunch-13": 13, "lunch-14": 14,
    "dinner-18": 18, "dinner-19": 19, "dinner-1930": 19,
    "dinner-20": 20, "dinner-2030": 20, "dinner-21": 21,
    "late-22": 22, "late-23": 23,
  };
  
  const hour = timeMap[timeSlot] || 19;
  
  // Use provided date or default to tomorrow
  let eventDate: Date;
  if (dateStr) {
    eventDate = new Date(dateStr);
  } else {
    eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 1);
  }
  eventDate.setHours(hour, 0, 0, 0);

  const endDate = new Date(eventDate);
  endDate.setHours(hour + 2, 0, 0, 0); // 2 hour duration

  const now = new Date();
  const uid = `${restaurantId}-${Date.now()}@forkd.app`;
  const dtstamp = formatICSDate(now);
  const dtstart = formatICSDate(eventDate);
  const dtend = formatICSDate(endDate);

  const location = restaurant.address || `${restaurant.area}, ${restaurant.city}`;
  const description = `Selected by Forkd\nGroup: ${escapeICS(groupName)}\n\nTop dishes: ${restaurant.topDishes.join(", ")}\n\nEnjoy!`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Forkd//Restaurant Plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:Dinner at ${escapeICS(restaurant.name)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Dinner at " + escapeICS(restaurant.name),
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const googleCalendarUrl = new URL("https://calendar.google.com/calendar/render");
  googleCalendarUrl.searchParams.set("action", "TEMPLATE");
  googleCalendarUrl.searchParams.set("text", `Dinner at ${restaurant.name}`);
  googleCalendarUrl.searchParams.set("dates", `${dtstart}/${dtend}`);
  googleCalendarUrl.searchParams.set("details", description);
  googleCalendarUrl.searchParams.set("location", location);

  return NextResponse.json({
    ics: icsContent,
    googleCalendarUrl: googleCalendarUrl.toString(),
    event: {
      title: `Dinner at ${restaurant.name}`,
      location,
      startTime: eventDate.toISOString(),
      endTime: endDate.toISOString(),
      description,
    },
  });
}