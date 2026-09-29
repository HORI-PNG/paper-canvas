"use client";

import React from "react";
import { Paper, CardColor } from "@/types/paper";
import { IC } from "./Icons";

// 論文カードのカラー定義
export const GLASS: Record<
  CardColor,
  { bg: string; border: string; accent: string; tagBg: string; text: string }
> = {
  sky: {
    bg: "rgba(240,249,255,0.85)",
    border: "rgba(186,230,253,0.8)",
    accent: "#0284c7",
    tagBg: "rgba(224,242,254,0.9)",
    text: "#0369a1",
  },
  indigo: {
    bg: "rgba(238,242,255,0.85)",
    border: "rgba(199,210,254,0.8)",
    accent: "#4f46e5",
    tagBg: "rgba(224,231,255,0.9)",
    text: "#3730a3",
  },
  emerald: {
    bg: "rgba(236,253,245,0.85)",
    border: "rgba(167,243,208,0.8)",
    accent: "#059669",
    tagBg: "rgba(209,250,229,0.9)",
    text: "#065f46",
  },
  violet: {
    bg: "rgba(245,243,255,0.85)",
    border: "rgba(221,214,254,0.8)",
    accent: "#7c3aed",
    tagBg: "rgba(237,233,254,0.9)",
    text: "#5b21b6",
  },
  rose: {
    bg: "rgba(255,241,242,0.85)",
    border: "rgba(254,205,211,0.8)",
    accent: "#e11d48",
    tagBg: "rgba(255,228,230,0.9)",
    text: "#9f1239",
  },
  amber: {
    bg: "rgba(254,252,232,0.85)",
    border: "rgba(254,240,138,0.8)",
    accent: "#d97706",
    tagBg: "rgba(254,249,195,0.9)",
    text: "#92400e",
  },
};

interface PaperCardProps {
  paper: Paper;
  selected: boolean;
  dark: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onSelectPaper: (p: Paper) => void;
  onDeletePaper: (id: string, e: React.MouseEvent) => void;
}

export function PaperCard({
  paper,
  selected,
  dark,
  zoom,
  onMouseDown,
  onSelectPaper,
  onDeletePaper,
}: PaperCardProps) {
  const g = GLASS[paper.color] || GLASS.sky;

  const darkBg = "rgba(26,29,38,0.92)";
  const darkBorder = selected ? "#818cf8" : "rgba(255,255,255,0.12)";

  return (
    <div
      className="paper-card rounded-2xl p-4 cursor-grab active:cursor-grabbing transition-shadow"
      style={{
        left: paper.x,
        top: paper.y,
        width: 320,
        backgroundColor: dark ? darkBg : g.bg,
        border: `1.5px solid ${dark ? darkBorder : selected ? g.accent : g.border}`,
        backdropFilter: "blur(12px)",
        boxShadow: selected
          ? `0 0 0 3px ${g.accent}33, 0 12px 32px rgba(0,0,0,0.15)`
          : "0 4px 20px rgba(0,0,0,0.06)",
      }}
      onMouseDown={(e) => onMouseDown(e, paper.id)}
    >
      {/* 上部ヘッダー：タグと削除ボタン */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {paper.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: dark ? "rgba(255,255,255,0.08)" : g.tagBg,
                color: dark ? "#a5b4fc" : g.text,
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => onDeletePaper(paper.id, e)}
          className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <IC.X />
        </button>
      </div>

      {/* タイトル */}
      <h3
        className="font-bold text-[13px] leading-snug mb-1.5 line-clamp-2"
        style={{
          color: dark ? "#f3f4f6" : "#111827",
          fontFamily: "var(--font-body)",
        }}
      >
        {paper.title}
      </h3>

      {/* 著者と発行年 */}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2.5 truncate">
        {paper.authors.join(", ")} • {paper.year}
      </p>

      {/* 要約箇条書き */}
      <div className="space-y-1 mb-3">
        {paper.bullets.map((b, i) => (
          <div
            key={i}
            className="flex items-start gap-1.5 text-[11px] leading-tight text-gray-600 dark:text-gray-300"
          >
            <span
              className="mt-1 w-1 h-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: g.accent }}
            />
            <span className="line-clamp-2">{b}</span>
          </div>
        ))}
      </div>

      {/* 下部アクション：詳細表示ボタン */}
      <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-mono">
          {paper.createdDate}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectPaper(paper);
          }}
          className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
          style={{ color: g.accent }}
        >
          詳細を見る <IC.Expand />
        </button>
      </div>
    </div>
  );
}
