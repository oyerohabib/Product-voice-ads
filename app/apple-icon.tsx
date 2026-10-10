import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BARS = [
  { height: 50, color: "#fafafa" },
  { height: 90, color: "#fafafa" },
  { height: 128, color: "#fbbf24" },
  { height: 74, color: "#fafafa" },
  { height: 36, color: "#fafafa" },
];

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "#18181b",
      }}
    >
      {BARS.map((bar, index) => (
        <div
          key={index}
          style={{ width: 14, height: bar.height, borderRadius: 7, background: bar.color }}
        />
      ))}
    </div>,
    size,
  );
}
