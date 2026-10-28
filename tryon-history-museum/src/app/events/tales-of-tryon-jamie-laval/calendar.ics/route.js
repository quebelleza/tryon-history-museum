import { createJamieLavalIcs } from "@/lib/events/jamieLaval";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(createJamieLavalIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tales-of-tryon-jamie-laval.ics"',
      "Cache-Control": "no-store",
    },
  });
}
