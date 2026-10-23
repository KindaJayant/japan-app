import { ImageResponse } from "next/og";

export const alt = "Japan Saathi: Japan, without the guesswork";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link preview for WhatsApp / iMessage / Slack: a vintage poster card. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6efe3", padding: 36 }}>
        <div style={{ flex: 1, display: "flex", border: "6px solid #2b2522", background: "#f6efe3" }}>
          <div style={{ width: 520, display: "flex", position: "relative", background: "#f4cfc8", borderRight: "6px solid #2b2522" }}>
            <div style={{ position: "absolute", left: 250, top: 70, width: 210, height: 210, borderRadius: 999, background: "#fbf3e6" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 170, background: "#d9968c" }} />
            <div style={{ position: "absolute", left: 128, top: 214, width: 34, height: 300, background: "#d4573b" }} />
            <div style={{ position: "absolute", left: 330, top: 214, width: 34, height: 300, background: "#d4573b" }} />
            <div style={{ position: "absolute", left: 100, top: 260, width: 292, height: 22, background: "#d4573b" }} />
            <div style={{ position: "absolute", left: 84, top: 206, width: 324, height: 22, background: "#d4573b" }} />
            <div style={{ position: "absolute", left: 60, top: 178, width: 372, height: 28, background: "#2b2522" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", color: "#2b2522" }}>
            <div style={{ fontSize: 26, letterSpacing: 6, fontWeight: 700 }}>JAPAN SAATHI</div>
            <div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 800, marginTop: 18 }}>Japan, without the</div>
            <div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 800, color: "#d4573b", fontStyle: "italic" }}>guesswork.</div>
            <div style={{ fontSize: 28, marginTop: 28, lineHeight: 1.4, color: "#5d544e" }}>
              Veg, Jain & halal label scans · trips verified in ₹ · taxi cards
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
