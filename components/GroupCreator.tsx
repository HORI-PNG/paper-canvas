"use client";

import React, { useState } from "react";
import { IC } from "./Icons";

interface GroupCreatorProps {
  show: boolean;
  dark: boolean;
  onClose: () => void;
  onCreateGroup: (label: string, bgColor: string, borderColor: string) => void;
}

// プリセットカラーの定義
const COLOR_PRESETS = [
  { name: "ブルー", bg: "rgba(224,242,254,0.4)", border: "#0284c7" },
  { name: "パープル", bg: "rgba(237,233,254,0.4)", border: "#7c3aed" },
  { name: "グリーン", bg: "rgba(209,250,229,0.4)", border: "#059669" },
  { name: "ピンク", bg: "rgba(255,228,230,0.4)", border: "#e11d48" },
  { name: "アンバー", bg: "rgba(254,249,195,0.4)", border: "#d97706" },
];

export function GroupCreator({
  show,
  dark,
  onClose,
  onCreateGroup,
}: GroupCreatorProps) {
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onCreateGroup(label, selectedColor.bg, selectedColor.border);
    setLabel("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="w-[360px] rounded-2xl p-6 shadow-2xl border"
        style={{
          backgroundColor: dark ? "#191b22" : "#ffffff",
          borderColor: dark ? "#2a2d38" : "#e5e7eb",
          color: dark ? "#eceef2" : "#1a1d23",
          animation: "fadeScaleIn 0.18s ease-out both",
        }}
      >
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold font-display">
            新規グループ作成
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400"
          >
            <IC.X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* グループ名入力 */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 font-mono">
              グループ名
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例: 深層学習、NLP関連..."
              autoFocus
              className="w-full px-3 py-2 rounded-xl text-[13px] border outline-none transition-all"
              style={{
                backgroundColor: dark ? "#111318" : "#f8fafc",
                borderColor: dark ? "#2a2d38" : "#e2e8f0",
                color: dark ? "#f3f4f6" : "#111827",
              }}
            />
          </div>

          {/* カラー選択 */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 font-mono">
              枠カラー
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSelectedColor(preset)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: preset.border,
                    borderColor:
                      selectedColor.name === preset.name
                        ? dark
                          ? "#fff"
                          : "#000"
                        : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* ボタンエリア */}
          <div className="pt-2 flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
            >
              グループを作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
