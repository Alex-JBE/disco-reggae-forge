import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #1a1200 0%, #2d1f00 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1.5px solid #C9922A",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#C9922A",
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          𝄞
        </div>
      </div>
    ),
    { ...size }
  );
}
