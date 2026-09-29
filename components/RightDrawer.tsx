"use client";

import React from "react";
import { Paper } from "@/types/paper";
import { IC } from "./Icons";

interface RightDrawerProps {
  paper: Paper | null;
  dark: boolean;
  onClose: () => void;
}

export function RightDrawer({ paper, dark, onClose }: RightDrawerProps) {
  if (!paper) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full w-[420px] z-30 shadow-2xl flex flex-col panel-slide-in border-l"
      style={{
        backgroundColor: dark ? "#191b22" : "#ffffff",
        borderColor: dark ? "#2a2d38" : "#e5e7eb",
        color: dark ? "#eceef2" : "#1a1d23",
      }}
    >
      {/* パネルヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
        <span className="text-[12px] font-semibold tracking-wider text-gray-400 uppercase font-mono">
          Paper Details
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500"
        >
          <IC.X />
        </button>
      </div>

      {/* パネルコンテンツ（スクロール領域） */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 thin-scroll">
        {/* タイトル ＆ タグ */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {paper.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: dark ? "rgba(99,102,241,0.2)" : "#eef2ff",
                  color: dark ? "#818cf8" : "#4338ca",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <h2 className="text-xl font-bold leading-snug mb-2 font-display">
            {paper.title}
          </h2>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            {paper.authors.join(", ")} ({paper.year})
          </p>
        </div>

        {/* AI要約セクション */}
        <div
          className="p-4 rounded-xl space-y-2 border"
          style={{
            backgroundColor: dark ? "rgba(99,102,241,0.08)" : "#f8fafc",
            borderColor: dark ? "rgba(99,102,241,0.2)" : "#e2e8f0",
          }}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-500">
            <IC.Sparkle /> Key Takeaways
          </div>
          <ul className="space-y-1.5 pl-1">
            {paper.bullets.map((b, i) => (
              <li
                key={i}
                className="text-[12px] leading-relaxed flex items-start gap-2"
              >
                <span className="text-indigo-500 font-bold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 抄録 (Abstract) */}
        <div>
          <h3 className="text-[12px] font-bold tracking-wider text-gray-400 uppercase font-mono mb-2">
            Abstract
          </h3>
          <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
            {paper.abstract}
          </p>
        </div>
      </div>

      {/* フッター（外部リンクボタン） */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/10">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
        >
          <IC.Link /> arXiv で論文を開く
        </a>
      </div>
    </div>
  );
}
