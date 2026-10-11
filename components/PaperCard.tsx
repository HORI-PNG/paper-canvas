"use client";

import React from "react";
import { Paper, CardColor } from "@/types/paper";
import { IC } from "./Icons";

const GLASS: Record<
  CardColor,
  {
    rgb: string;
    border: string;
    tagBg: string;
    tagText: string;
    dot: string;
    headerRgb: string;
  }
> = {
  sky: {
    rgb: "14,165,233",
    border: "rgba(14,165,233,0.35)",
    tagBg: "rgba(14,165,233,0.18)",
    tagText: "#0369a1",
    dot: "#38bdf8",
    headerRgb: "14,165,233",
  },
  indigo: {
    rgb: "99,102,241",
    border: "rgba(99,102,241,0.35)",
    tagBg: "rgba(99,102,241,0.18)",
    tagText: "#4338ca",
    dot: "#818cf8",
    headerRgb: "99,102,241",
  },
  emerald: {
    rgb: "16,185,129",
    border: "rgba(16,185,129,0.35)",
    tagBg: "rgba(16,185,129,0.18)",
    tagText: "#047857",
    dot: "#34d399",
    headerRgb: "16,185,129",
  },
  violet: {
    rgb: "139,92,246",
    border: "rgba(139,92,246,0.35)",
    tagBg: "rgba(139,92,246,0.18)",
    tagText: "#6d28d9",
    dot: "#a78bfa",
    headerRgb: "139,92,246",
  },
  rose: {
    rgb: "244,63,94",
    border: "rgba(244,63,94,0.35)",
    tagBg: "rgba(244,63,94,0.18)",
    tagText: "#be123c",
    dot: "#fb7185",
    headerRgb: "244,63,94",
  },
  amber: {
    rgb: "245,158,11",
    border: "rgba(245,158,11,0.35)",
    tagBg: "rgba(245,158,11,0.18)",
    tagText: "#b45309",
    dot: "#fbbf24",
    headerRgb: "245,158,11",
  },
};

interface PaperCardProps {
  paper: Paper;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onSelectPaper: (paper: Paper) => void;
  onDeletePaper: (paper: Paper) => void;
}

export function PaperCard({
  paper,
  selected,
  onPointerDown,
  onSelectPaper,
  onDeletePaper,
}: PaperCardProps) {
  const color = GLASS[paper.color];

  const cardStyle: React.CSSProperties = {
    background: `rgba(${color.rgb}, 0.13)`,
    backdropFilter: "blur(18px) saturate(1.6)",
    WebkitBackdropFilter: "blur(18px) saturate(1.6)",
    border: `1.5px solid ${color.border}`,
    boxShadow: selected
      ? `0 0 0 2.5px ${color.dot}, 0 16px 48px rgba(${color.rgb},0.22), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.55)`
      : `0 8px 32px rgba(${color.rgb},0.14), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.55)`,
    borderRadius: 16,
  };

  const headerStyle: React.CSSProperties = {
    background: `rgba(${color.headerRgb}, 0.10)`,
    borderBottom: `1px solid rgba(${color.rgb}, 0.18)`,
  };

  return (
    <div
      className="paper-card group/card w-[268px] overflow-hidden"
      style={{
        left: paper.x,
        top: paper.y,
        zIndex: selected ? 2 : 1,
        ...cardStyle,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e, paper.id);
      }}
    >
      <div className="px-4 pt-3.5 pb-3" style={headerStyle}>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: color.dot,
            }}
          >
            {paper.year}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDeletePaper(paper);
              }}
              className="flex h-5 w-5 items-center justify-center rounded-md text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-red-500 focus:opacity-100"
              aria-label={`「${paper.title}」を削除`}
              title="削除"
            >
              <IC.Trash />
            </button>
            <div
              className="w-2 h-2 rounded-full shadow-sm"
              style={{
                background: color.dot,
                boxShadow: `0 0 6px ${color.dot}`,
              }}
            />
          </div>
        </div>

        <h3
          className="text-[13px] font-semibold leading-[1.35] line-clamp-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--card-foreground)",
          }}
        >
          {paper.title}
        </h3>

        <p
          className="text-[11px] mt-1 truncate"
          style={{ color: "var(--muted-foreground)" }}
        >
          {paper.authors.join(" · ")}
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ color: color.dot }}>
            <IC.Sparkle />
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--muted-foreground)",
            }}
          >
            AIサマリー
          </span>
        </div>

        <ul className="space-y-1.5">
          {paper.bullets.map((bullet, index) => (
            <li
              key={index}
              className="flex gap-2 text-[11px] leading-[1.5]"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span
                className="mt-[4px] flex-shrink-0 w-1 h-1 rounded-full"
                style={{ background: color.dot, opacity: 0.7 }}
              />
              <span className="line-clamp-2">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="px-4 pb-3.5 pt-2"
        style={{ borderTop: `1px solid rgba(${color.rgb},0.18)` }}
      >
        <div className="flex flex-wrap gap-1 mb-2.5">
          {paper.tags.map((tag) => (
            <span
              key={tag}
              className="paper-tag text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                background: `rgba(${color.rgb},0.18)`,
                color: color.tagText,
                  ["--tag-dark" as string]: color.dot,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--muted-foreground)",
            }}
          >
            {paper.createdDate}
          </span>

          <div className="flex items-center gap-2">
            {paper.note.trim() && (
              <span
                className="text-[var(--muted-foreground)]"
                title="個人メモあり"
              >
                <IC.Pencil />
              </span>
            )}
            {paper.pdfPath && (
              <span
                className="text-[var(--muted-foreground)]"
                title="PDF添付あり"
              >
                <IC.File />
              </span>
            )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPaper(paper);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-70 transition-opacity"
            style={{ color: color.dot }}
          >
            <IC.Expand />
            詳細
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** AI 解析中に表示する仮のカード */
export function PendingPaperCard({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="paper-card pulse-soft w-[268px] rounded-2xl border-[1.5px] border-dashed border-[#16a34a]/50 bg-[var(--card)]/80 p-4"
      style={{ left: x, top: y, cursor: "default" }}
      aria-busy="true"
    >
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[#16a34a]">
        <IC.Loader />
        AI が論文を解析中…
      </div>
      <div className="space-y-2">
        <div className="h-3 w-4/5 rounded bg-[var(--muted)]" />
        <div className="h-3 w-3/5 rounded bg-[var(--muted)]" />
        <div className="mt-4 h-2.5 w-full rounded bg-[var(--muted)]" />
        <div className="h-2.5 w-11/12 rounded bg-[var(--muted)]" />
        <div className="h-2.5 w-4/5 rounded bg-[var(--muted)]" />
      </div>
      <p className="mt-4 text-[10px] text-[var(--muted-foreground)]">
        初めて追加される論文は10〜30秒ほどかかります
      </p>
    </div>
  );
}
