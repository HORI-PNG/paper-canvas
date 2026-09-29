"use client";

import React from "react";
import { Memo, MemoColor } from "@/types/paper";
import { IC } from "./Icons";

// 付箋メモのカラー定義
export const MEMO_COLORS: Record<
  MemoColor,
  { bg: string; border: string; text: string; header: string }
> = {
  yellow: {
    bg: "#fef9c3",
    border: "#fef08a",
    text: "#713f12",
    header: "#fde047",
  },
  pink: {
    bg: "#fce7f3",
    border: "#fbcfe8",
    text: "#831843",
    header: "#f472b6",
  },
  blue: {
    bg: "#e0f2fe",
    border: "#bae6fd",
    text: "#075985",
    header: "#38bdf8",
  },
  green: {
    bg: "#dcfce7",
    border: "#bbf7d0",
    text: "#14532d",
    header: "#4ade80",
  },
  purple: {
    bg: "#f3e8ff",
    border: "#e9d5ff",
    text: "#581c87",
    header: "#c084fc",
  },
};

interface MemoCardProps {
  memo: Memo;
  dark: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onDeleteMemo: (id: string, e: React.MouseEvent) => void;
  onChangeColor: (id: string, color: MemoColor) => void;
}

export function MemoCard({
  memo,
  dark,
  onMouseDown,
  onUpdateText,
  onDeleteMemo,
  onChangeColor,
}: MemoCardProps) {
  const mc = MEMO_COLORS[memo.color] || MEMO_COLORS.yellow;

  return (
    <div
      className="absolute rounded-xl shadow-md cursor-grab active:cursor-grabbing flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
      style={{
        left: memo.x,
        top: memo.y,
        width: 220,
        minHeight: 160,
        backgroundColor: dark ? "#1e2028" : mc.bg,
        border: `1.5px solid ${dark ? "#2a2d38" : mc.border}`,
      }}
      onMouseDown={(e) => onMouseDown(e, memo.id)}
    >
      {/* メモヘッダー（カラー変更パレット＆削除ボタン） */}
      <div
        className="flex items-center justify-between px-3 py-1.5 cursor-grab"
        style={{
          backgroundColor: dark ? "#191b22" : mc.header,
          opacity: dark ? 1 : 0.6,
        }}
      >
        <div className="flex items-center gap-1">
          {(["yellow", "pink", "blue", "green", "purple"] as MemoColor[]).map(
            (c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeColor(memo.id, c);
                }}
                className="w-3 h-3 rounded-full transition-transform hover:scale-125"
                style={{
                  backgroundColor: MEMO_COLORS[c].header,
                  border: memo.color === c ? "1.5px solid #000" : "none",
                }}
              />
            ),
          )}
        </div>
        <button
          onClick={(e) => onDeleteMemo(memo.id, e)}
          className="text-gray-500 hover:text-red-500 p-0.5 rounded transition-colors"
        >
          <IC.X />
        </button>
      </div>

      {/* メモ本文入力エリア */}
      <textarea
        value={memo.text}
        onChange={(e) => onUpdateText(memo.id, e.target.value)}
        onMouseDown={(e) => e.stopPropagation()} // ドラッグイベントと干渉しないよう伝播を停止
        placeholder="メモを入力..."
        className="w-full flex-1 p-3 bg-transparent resize-none outline-none text-[12px] leading-relaxed"
        style={{
          color: dark ? "#eceef2" : mc.text,
          fontFamily: "var(--font-body)",
        }}
      />

      {/* 作成日時 */}
      <div className="px-3 pb-2 text-[9px] text-gray-400 font-mono text-right select-none">
        {memo.createdDate}
      </div>
    </div>
  );
}
