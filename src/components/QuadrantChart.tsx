import { useState } from 'react';
import type { UseCase } from '../types';
import { CATEGORY_META } from '../scoring';

interface Props {
  useCases: UseCase[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const PAD = { top: 44, right: 28, bottom: 58, left: 58 };
const SVG_W = 480;
const SVG_H = 360;
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;

function toX(complexity: number) {
  return PAD.left + ((complexity - 1) / 4) * PLOT_W;
}
function toY(alignment: number) {
  return PAD.top + ((5 - alignment) / 4) * PLOT_H;
}

const DIV_X = toX(3);
const DIV_Y = toY(3);

interface TooltipState {
  uc: UseCase;
  pctX: number;
  pctY: number;
}

export default function QuadrantChart({ useCases, selectedId, onSelect }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  if (useCases.length === 0) {
    return (
      <div className="chart-empty">
        <p>Add use cases to see the priority quadrant.</p>
      </div>
    );
  }

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="quadrant-svg"
        aria-label="Priority quadrant chart"
      >
        {/* Quadrant backgrounds */}
        <rect x={PAD.left}  y={PAD.top}   width={DIV_X - PAD.left}              height={DIV_Y - PAD.top}              fill="#dcfce7" opacity="0.45" />
        <rect x={DIV_X}     y={PAD.top}   width={PAD.left + PLOT_W - DIV_X}     height={DIV_Y - PAD.top}              fill="#dbeafe" opacity="0.45" />
        <rect x={PAD.left}  y={DIV_Y}     width={DIV_X - PAD.left}              height={PAD.top + PLOT_H - DIV_Y}     fill="#fef3c7" opacity="0.45" />
        <rect x={DIV_X}     y={DIV_Y}     width={PAD.left + PLOT_W - DIV_X}     height={PAD.top + PLOT_H - DIV_Y}     fill="#fee2e2" opacity="0.45" />

        {/* Divider lines */}
        <line x1={DIV_X} y1={PAD.top} x2={DIV_X} y2={PAD.top + PLOT_H} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 3" />
        <line x1={PAD.left} y1={DIV_Y} x2={PAD.left + PLOT_W} y2={DIV_Y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 3" />

        {/* Quadrant labels */}
        <text x={(PAD.left + DIV_X) / 2}                 y={PAD.top + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#15803d" opacity="0.8" letterSpacing="0.05em">QUICK WIN</text>
        <text x={(DIV_X + PAD.left + PLOT_W) / 2}        y={PAD.top + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1d4ed8" opacity="0.8" letterSpacing="0.05em">STRATEGIC BET</text>
        <text x={(PAD.left + DIV_X) / 2}                 y={PAD.top + PLOT_H - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#b45309" opacity="0.8" letterSpacing="0.05em">CONSIDER</text>
        <text x={(DIV_X + PAD.left + PLOT_W) / 2}        y={PAD.top + PLOT_H - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#b91c1c" opacity="0.8" letterSpacing="0.05em">RECONSIDER</text>

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="#475569" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top}           x2={PAD.left}           y2={PAD.top + PLOT_H} stroke="#475569" strokeWidth="1.5" />

        {/* X axis ticks */}
        {[1, 2, 3, 4, 5].map(n => (
          <g key={`xt${n}`}>
            <line x1={toX(n)} y1={PAD.top + PLOT_H} x2={toX(n)} y2={PAD.top + PLOT_H + 5} stroke="#475569" strokeWidth="1" />
            <text x={toX(n)} y={PAD.top + PLOT_H + 18} textAnchor="middle" fontSize="11" fill="#94a3b8">{n}</text>
          </g>
        ))}

        {/* Y axis ticks */}
        {[1, 2, 3, 4, 5].map(n => (
          <g key={`yt${n}`}>
            <line x1={PAD.left - 5} y1={toY(n)} x2={PAD.left} y2={toY(n)} stroke="#475569" strokeWidth="1" />
            <text x={PAD.left - 10} y={toY(n) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{n}</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={PAD.left + PLOT_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">
          Delivery Complexity →
        </text>
        <text
          transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}
          x={14}
          y={PAD.top + PLOT_H / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#64748b"
          fontWeight="500"
        >
          Strategic Alignment ↑
        </text>

        {/* Data points */}
        {useCases.map(uc => {
          const cx = toX(uc.scores.deliveryComplexity);
          const cy = toY(uc.scores.strategicAlignment);
          const meta = CATEGORY_META[uc.category];
          const isSelected = uc.id === selectedId;
          return (
            <g
              key={uc.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(uc.id)}
              onMouseEnter={() => setTooltip({ uc, pctX: cx / SVG_W, pctY: cy / SVG_H })}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 13 : 9}
                fill={meta.color}
                stroke="white"
                strokeWidth={isSelected ? 3 : 2}
                opacity={0.9}
              />
              {isSelected && (
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" style={{ pointerEvents: 'none' }}>
                  {uc.compositeScore}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="chart-tooltip"
          style={{ left: `${tooltip.pctX * 100}%`, top: `${tooltip.pctY * 100}%` }}
        >
          <div className="tt-name">{tooltip.uc.name}</div>
          {tooltip.uc.businessUnit && <div className="tt-unit">{tooltip.uc.businessUnit}</div>}
          <div className="tt-score">Score: <strong>{tooltip.uc.compositeScore}</strong></div>
          <div className="tt-dims">
            <span>Alignment: {tooltip.uc.scores.strategicAlignment}</span>
            <span>Complexity: {tooltip.uc.scores.deliveryComplexity}</span>
          </div>
        </div>
      )}
    </div>
  );
}
