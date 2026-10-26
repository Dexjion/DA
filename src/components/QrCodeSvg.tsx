import React from 'react';
import { PaymentMethod } from '../utils/storeLogic';

interface QrCodeSvgProps {
  payload: string;
  method: PaymentMethod;
  size?: number;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  payload,
  method,
  size = 200,
}) => {
  const gridSize = 25;

  // Deterministic hash grid from payload string
  const isModuleDark = (row: number, col: number): boolean => {
    const inFinder = (r: number, c: number) =>
      r >= 0 && r < 7 && c >= 0 && c < 7;

    // Three 7x7 finder patterns
    if (inFinder(row, col)) {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true;
      if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    if (inFinder(row, col - (gridSize - 7))) {
      const c = col - (gridSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    if (inFinder(row - (gridSize - 7), col)) {
      const r = row - (gridSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }

    // Quiet zone around finder patterns
    if (
      (row === 7 && col <= 7) ||
      (col === 7 && row <= 7) ||
      (row === 7 && col >= gridSize - 8) ||
      (col === gridSize - 8 && row <= 7) ||
      (row === gridSize - 8 && col <= 7) ||
      (col === 7 && row >= gridSize - 8)
    ) {
      return false;
    }

    // Center badge cutout
    if (row >= 10 && row <= 14 && col >= 10 && col <= 14) {
      return false;
    }

    // Timing patterns
    if (row === 6) return col % 2 === 0;
    if (col === 6) return row % 2 === 0;

    // Deterministic bit from payload
    const idx = (row * gridSize + col) % Math.max(1, payload.length);
    const charCode = payload.charCodeAt(idx);
    const mix = (charCode * 31 + row * 17 + col * 13) % 7;
    return mix < 3;
  };

  const primaryColor = '#1E293B';
  const badgeText = method === 'vietqr' ? 'VietQR' : 'VietQR';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize + 4} ${gridSize + 4}`}
      className="bg-white rounded-xl border border-stone-200 p-2"
      role="img"
      aria-label={`Mã QR thanh toán ${badgeText}`}
    >
      <rect width={gridSize + 4} height={gridSize + 4} fill="#FFFFFF" rx="1.5" />
      <g transform="translate(2, 2)">
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((__, c) =>
            isModuleDark(r, c) ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={0.92}
                height={0.92}
                rx={0.18}
                fill={primaryColor}
              />
            ) : null
          )
        )}

        {/* Center Badge */}
        <rect
          x="9.6"
          y="9.6"
          width="5.8"
          height="5.8"
          rx="1"
          fill={primaryColor}
        />
        <text
          x="12.5"
          y="13.1"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="1.65"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          {badgeText}
        </text>
      </g>
    </svg>
  );
};
