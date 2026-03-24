import { NextRequest, NextResponse } from "next/server";
import { SEED_RESTAURANTS } from "@/lib/data";

interface Restaurant {
  id: string;
  name: string;
  area: string;
  city: string;
  address?: string;
  topDishes: string[];
  description: string;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Format date for ICS in UTC (Z notation)
function formatICSDateUTC(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Format date for ICS with timezone (floating time)
function formatICSDateFloating(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

interface TimeSlotResult {
  hour: number;
  isPM: boolean;
  minutes?: number;
}

function parseTimeSlot(timeSlot: string): TimeSlotResult {
  const timeMap: Record<string, TimeSlotResult> = {
    "lunch-12": { hour: 12, isPM: false },
    "lunch-13": { hour: 13, isPM: false },
    "lunch-14": { hour: 14, isPM: false },
    "dinner-18": { hour: 18, isPM: true },
    "dinner-19": { hour: 19, isPM: true },
    "dinner-1930": { hour: 19, isPM: true, minutes: 30 },
    "dinner-20": { hour: 20, isPM: true },
    "dinner-2030": { hour: 20, isPM: true, minutes: 30 },
    "dinner-21": { hour: 21, isPM: true },
    "late-22": { hour: 22, isPM: true },
    "late-23": { hour: 23, isPM: true },
  };

  return timeMap[timeSlot] || { hour: 19, isPM: true };
}

function createICSEvent(
  restaurant: Restaurant,
  startDate: Date,
  endDate: Date,
  groupName: string,
  members: string
): string {
  const now = new Date();
  const uid = `forkd-${restaurant.id}-${Date.now()}@forkd.app`;

  const location = restaurant.address || `${restaurant.area}, ${restaurant.city}`;
  
  const description = [
    `Selected by Forkd`,
    `Group: ${groupName}`,
    members ? `Attendees: ${members}` : "",
    "",
    `Restaurant: ${restaurant.name}`,
    restaurant.description ? `About: ${restaurant.description}` : "",
    "",
    `Top dishes to try: ${restaurant.topDishes.join(", ")}`,
    "",
    "---",
    "Created with Forkd - Restaurant Decision App",
  ].filter(Boolean).join("\\n");

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Forkd//Restaurant Decision//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Forkd - Restaurant Plans",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDateUTC(now)}`,
    `DTSTART:${formatICSDateFloating(startDate)}`,
    `DTEND:${formatICSDateFloating(endDate)}`,
    `SUMMARY:Dinner at ${escapeICSText(restaurant.name)}`,
    `LOCATION:${escapeICSText(location)}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "TRANSP:OPAQUE",
    // 1 hour before reminder
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Dinner at " + escapeICSText(restaurant.name) + " in 1 hour",
    "END:VALARM",
    // 30 minutes before reminder
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Dinner at " + escapeICSText(restaurant.name) + " in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}

function createGoogleCalendarUrl(
  restaurant: Restaurant,
  startDate: Date,
  endDate: Date,
  groupName: string,
  members: string
): string {
  const googleUrl = new URL("https://calendar.google.com/calendar/render");
  
  googleUrl.searchParams.set("action", "TEMPLATE");
  googleUrl.searchParams.set("text", `Dinner at ${restaurant.name}`);
  
  // Format dates for Google Calendar (ISO without separators)
  const formatGoogleDate = (d: Date): string => {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };
  
  googleUrl.searchParams.set("dates", `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
  
  const details = [
    `Selected by Forkd`,
    `Group: ${groupName}`,
    members ? `Attendees: ${members}` : "",
    "",
    restaurant.description,
    "",
    `Top dishes: ${restaurant.topDishes.join(", ")}`,
  ].filter(Boolean).join("\n");
  
  googleUrl.searchParams.set("details", details);
  
  const location = restaurant.address || `${restaurant.area}, ${restaurant.city}`;
  googleUrl.searchParams.set("location", location);
  
  // Set reminder
  googleUrl.searchParams.set("rem", "60,30");
  
  return googleUrl.toString();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get("restaurantId");
    const timeSlot = searchParams.get("timeSlot") || "dinner-19";
    const dateStr = searchParams.get("date");
    const groupName = searchParams.get("groupName") || "Forkd Group";
    const members = searchParams.get("members") || "";
    const format = searchParams.get("format") || "json"; // json, ics, or google

    // Validation
    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 }
      );
    }

    // Find restaurant - search all seeded restaurants
    const restaurant = SEED_RESTAURANTS.find((r) => r.id === restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found", restaurantId },
        { status: 404 }
      );
    }

    // Parse time slot
    const { hour, isPM, minutes = 0 } = parseTimeSlot(timeSlot);
    
    // Validate and parse date
    let eventDate: Date;
    if (dateStr) {
      eventDate = new Date(dateStr);
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Use ISO format (YYYY-MM-DD)." },
          { status: 400 }
        );
      }
    } else {
      // Default to tomorrow
      eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 1);
    }
    
    // Validate hour
    if (hour < 0 || hour > 23) {
      return NextResponse.json(
        { error: "Invalid time slot" },
        { status: 400 }
      );
    }
    
    eventDate.setHours(hour, minutes, 0, 0);
    
    // End time: 2 hours later
    const endDate = new Date(eventDate);
    endDate.setHours(hour + 2, 0, 0, 0);

    // Return ICS format directly
    if (format === "ics") {
      const icsContent = createICSEvent(restaurant, eventDate, endDate, groupName, members);
      
      return new NextResponse(icsContent, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": `attachment; filename="forkd-${restaurant.name.toLowerCase().replace(/\s+/g, "-")}.ics"`,
          "Cache-Control": "no-cache, must-revalidate",
        },
      });
    }

    // Return Google Calendar URL
    if (format === "google") {
      const googleUrl = createGoogleCalendarUrl(restaurant, eventDate, endDate, groupName, members);
      return NextResponse.json({ url: googleUrl });
    }

    // Return JSON with all options
    const icsContent = createICSEvent(restaurant, eventDate, endDate, groupName, members);
    const googleCalendarUrl = createGoogleCalendarUrl(restaurant, eventDate, endDate, groupName, members);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        area: restaurant.area,
        city: restaurant.city,
      },
      event: {
        title: `Dinner at ${restaurant.name}`,
        location: restaurant.address || `${restaurant.area}, ${restaurant.city}`,
        startTime: eventDate.toISOString(),
        endTime: endDate.toISOString(),
        timeSlot,
        groupName,
        members: members.split(",").filter(Boolean),
      },
      export: {
        ics: icsContent,
        googleCalendarUrl,
        googleCalendarDirect: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Dinner at ${restaurant.name}`)}`,
      },
    });
  } catch (err) {
    console.error("Calendar event API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
