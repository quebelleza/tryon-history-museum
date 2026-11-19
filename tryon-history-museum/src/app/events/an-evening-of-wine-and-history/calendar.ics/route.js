import { createWineTastingIcs } from "@/lib/events/wineTasting";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(createWineTastingIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="an-evening-of-wine-and-history.ics"',
      "Cache-Control": "no-store",
    },
  });
}
