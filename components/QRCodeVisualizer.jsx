"use client";

import React, { useMemo } from "react";
import { generateQrMatrix } from "@/lib/crypto-utils";

export default function QRCodeVisualizer({ text = "bc1qar0srvv7xfkvy5l643lydnw9re59gtzzwf5md", size = 180 }) {
  const { grid, size: matrixSize } = useMemo(() => generateQrMatrix(text), [text]);

  const moduleSize = size / matrixSize;

  return (
    <div
      style={{
        width: size + 24,
        height: size + 24,
        padding: 12,
        background: "#0E0E14",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: "0 0 24px -4px rgba(34, 211, 238, 0.15)",
      }}
    >
      {/* Cyan corner glow pip */}
      <span
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#22D3EE",
          boxShadow: "0 0 10px #22D3EE",
        }}
      />

      <svg
        id="invoice-qr-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
      >
        {/* White background square */}
        <rect width={size} height={size} fill="#FFFFFF" rx="8" />

        {/* Modules */}
        {grid.map((row, r) =>
          row.map((active, c) => {
            if (!active) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * moduleSize}
                y={r * moduleSize}
                width={moduleSize + 0.1}
                height={moduleSize + 0.1}
                fill="#0A0A0F"
              />
            );
          })
        )}

        {/* Center lightning brand glyph */}
        <g transform={`translate(${size / 2 - 14}, ${size / 2 - 14})`}>
          <rect width="28" height="28" rx="6" fill="#0A0A0F" stroke="#22D3EE" strokeWidth="2" />
          <path
            d="M15 4L8 15h6l-2 9 8-11h-6l3-9z"
            fill="#22D3EE"
          />
        </g>
      </svg>
    </div>
  );
}
