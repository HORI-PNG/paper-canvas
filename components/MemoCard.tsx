"use client";

import React, { useState } from "react";
import { MEMO_COLORS as MEMO_COLOR_LIST, Memo, MemoColor } from "@/types/paper";
import { IC } from "./Icons";

const MEMO_COLORS: Record<
  MemoColor,
  {
    bg: string;
    border: string;
    text: string;
    placeholder: string;
  }
> = {
  yellow: {
    bg: "#fefce8",
    border: "#fde047",
    text: "#713f12",
    placeholder: "#a16207",
  },
  pink: {
    bg: "#fdf2f8",
    border: "#f9a8d4",
    text: "#831843",
    placeholder: "#be185d",
  },
  blue: {
    bg: "#eff6ff",
    border: "#93c5fd",
    text: "#1e3a5f",
    placeholder: "#3b82f6",
  },
  green: {
    bg: "#f0fdf4",
    border: "#86efac",
    text: "#14532d",
    placeholder: "#16a34a",
  },
  purple: {
    bg: "#faf5ff",
    border: "#d8b4fe",
    text: "#581c87",
    placeholder: "#9333ea",
  },
};

interface MemoCardProps {
  memo: Memo;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onDeleteMemo: (id: string) => void;
  onChangeColor: (id: string, color: MemoColor) => void;
}

export function MemoCard({
  memo,
  onPointerDown,
  onUpdateText,
  onDeleteMemo,
  onChangeColor,
}: MemoCardProps) {
  const [showPicker, setShowPicker] = useState(false);
  const color = MEMO_COLORS[memo.color];

  return (
    <div
      className="paper-card w-52 overflow-visible rounded-2xl shadow-md"
      style={{
        left: memo.x,
        top: memo.y,
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        borderRadius: 16,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e, memo.id);
      }}
    >
      <div
        className="flex items-center justify-between rounded-t-2xl px-3 py-2"
        style={{
          background: `${color.border}55`,
          borderBottom: `1px solid ${color.border}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span style={{ color: color.placeholder }}>
            <IC.Pencil />
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              color: color.placeholder,
            }}
          >
            {memo.createdDate}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker((visible) => !visible);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded-full border-2 border-white/60 shadow-sm transition-transform hover:scale-110"
              style={{ background: color.border }}
              title="色を変更"
              aria-label="メモの色を変更"
            />

            {showPicker && (
              <div
                className="absolute top-7 right-0 z-50 flex gap-1.5 rounded-xl border p-2 shadow-xl"
                style={{ background: "white", borderColor: "#e5e7eb" }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {MEMO_COLOR_LIST.map((memoColor) => (
                  <button
                    key={memoColor}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeColor(memo.id, memoColor);
                      setShowPicker(false);
                    }}
                    className="h-5 w-5 rounded-full border-2 shadow-sm transition-transform hover:scale-125"
                    style={{
                      background: MEMO_COLORS[memoColor].border,
                      borderColor:
                        memo.color === memoColor
                          ? "#374151"
                          : "rgba(255,255,255,0.6)",
                    }}
                    aria-label={`${memoColor}に変更`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteMemo(memo.id);
              setShowPicker(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ color: color.placeholder }}
            aria-label="メモを削除"
          >
            <IC.X />
          </button>
        </div>
      </div>

      <textarea
        value={memo.text}
        onChange={(e) => onUpdateText(memo.id, e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="メモを入力..."
        maxLength={5000}
        aria-label="メモの内容"
        className="w-full select-text resize-none rounded-b-2xl bg-transparent px-3 py-2.5 text-[12px] leading-relaxed outline-none"
        style={{
          color: color.text,
          fontFamily: "var(--font-body)",
          height: 120,
          touchAction: "auto",
        }}
      />
    </div>
  );
}
