import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Events & Programs | Tryon History Museum";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px 80px",
          background: "linear-gradient(160deg, #1A1311 0%, #5C1F1A 50%, #7B2D26 100%)",
          fontFamily: "serif",
        }}
      >
        <div style={{ position: "absolute", top: "60px", right: "80px", width: "60px", height: "3px", background: "#C4A35A" }} />
        <div style={{ fontSize: 16, letterSpacing: "0.3em", color: "#C4A35A", textTransform: "uppercase", marginBottom: "16px" }}>
          What&apos;s Happening
        </div>
        <div style={{ fontSize: 64, fontWeight: 300, color: "#FFFFFF", lineHeight: 1.1, marginBottom: "8px" }}>
          Events &
        </div>
        <div style={{ fontSize: 64, fontWeight: 600, fontStyle: "italic", color: "#FFFFFF", lineHeight: 1.1, marginBottom: "24px" }}>
          Programs
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, maxWidth: "640px" }}>
          Lectures, walking tours, special exhibits, and community gatherings at the Tryon History Museum.
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "#C4A35A" }} />
      </div>
    ),
    { ...size }
  );
}
