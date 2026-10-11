"use client";

import React, { useId, useState } from "react";
import { IC } from "./Icons";

interface GroupCreatorProps {
  onClose: () => void;
  onCreateGroup: (label: string, bgColor: string, borderColor: string) => void;
}

const BG_PRESETS = [
  "#EEF2FF",
  "#ECFDF5",
  "#FFF7ED",
  "#FFF1F2",
  "#F5F3FF",
  "#F0F9FF",
  "#FAFAFA",
];

const BORDER_PRESETS = [
  "#4F46E5",
  "#059669",
  "#F59E0B",
  "#F43F5E",
  "#8B5CF6",
  "#0EA5E9",
  "#6B7280",
];

// 親が表示するときだけマウントするので、開くたびに state は初期値から始まる
export function GroupCreator({
  onClose,
  onCreateGroup,
}: GroupCreatorProps) {
  const [label, setLabel] = useState("新しいグループ");
  const [bgColor, setBgColor] = useState(BG_PRESETS[0]);
  const [borderColor, setBorderColor] = useState(BORDER_PRESETS[0]);
  const inputId = useId();

  const handleCreate = () => {
    onCreateGroup(label.trim() || "新しいグループ", bgColor, borderColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative w-[360px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl animate-[fadeScaleIn_0.18s_ease-out_both]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--primary)]">
              <IC.Layers />
            </span>
            <span
              className="text-[13px] font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              グループを作成
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
            aria-label="閉じる"
          >
            <IC.X />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <label
              htmlFor={inputId}
              className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              グループ名
            </label>
            <input
              id={inputId}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") onClose();
              }}
              autoFocus
              maxLength={100}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-[13px] text-[var(--foreground)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="例：言語モデル、画像認識…"
            />
          </div>

          <div>
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              背景カラー
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {BG_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBgColor(color)}
                    className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{
                      background: color,
                      borderColor:
                        bgColor === color ? "var(--ring)" : "var(--border)",
                      boxShadow:
                        bgColor === color ? "0 0 0 2px var(--ring)" : undefined,
                    }}
                    aria-label={`背景色 ${color}`}
                    aria-pressed={bgColor === color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-7 w-7 cursor-pointer overflow-hidden rounded-lg border border-[var(--border)]"
                aria-label="背景色を選択"
              />
            </div>
          </div>

          <div>
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ボーダーカラー
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {BORDER_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBorderColor(color)}
                    className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{
                      background: color,
                      borderColor:
                        borderColor === color ? "var(--ring)" : "transparent",
                      boxShadow:
                        borderColor === color
                          ? "0 0 0 2px var(--ring)"
                          : undefined,
                    }}
                    aria-label={`枠線の色 ${color}`}
                    aria-pressed={borderColor === color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="h-7 w-7 cursor-pointer overflow-hidden rounded-lg border border-[var(--border)]"
                aria-label="枠線の色を選択"
              />
            </div>
          </div>

          <div>
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              プレビュー
            </p>
            <div
              className="relative h-16 rounded-xl border-2 border-dashed"
              style={{ background: bgColor, borderColor }}
            >
              <div
                className="absolute -top-3 left-3 rounded-md px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: borderColor,
                  background: bgColor,
                  border: `1px solid ${borderColor}66`,
                }}
              >
                {label || "…"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border)] py-2 text-[12px] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            キャンセル
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-[12px] font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-display)" }}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}
