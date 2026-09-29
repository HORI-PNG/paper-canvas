"use client";

import React from "react";
import { IC } from "./Icons";

interface HeaderProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  urlInput: string;
  setUrlInput: (val: string) => void;
  handleAnalyze: () => void;
  loading: boolean;
  handleAddMemo: () => void;
  setShowGroupModal: (val: boolean) => void;
  paperCount: number;
}

export function Header({
  dark,
  setDark,
  showMenu,
  setShowMenu,
  urlInput,
  setUrlInput,
  handleAnalyze,
  loading,
  handleAddMemo,
  setShowGroupModal,
  paperCount,
}: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 flex-shrink-0 flex items-center gap-3 px-4 z-20 border-b"
      style={{
        height: "var(--header-h, 56px)",
        background: dark ? "#1a3d2b" : "#98fb98",
        borderColor: dark ? "#0f2d1e" : "#6ddb6d",
      }}
    >
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
        style={{
          color: dark ? "#86efac" : "#166534",
          background: showMenu ? "rgba(134,239,172,0.15)" : "transparent",
        }}
      >
        <IC.Menu />
      </button>

      {/* ロゴ */}
      <div className="flex items-center flex-shrink-0 mr-1">
        <span
          className="font-semibold text-[14px] tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: dark ? "#bbf7d0" : "#14532d",
          }}
        >
          PaperCanvas
        </span>
      </div>

      <div
        className="w-px h-5 flex-shrink-0"
        style={{ background: "rgba(0,80,30,0.2)" }}
      />

      {/* URL入力 ＆ 解析ボタン */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-shadow"
        style={{
          background: dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.55)",
          border: `1px solid ${dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.2)"}`,
          width: 320,
        }}
      >
        <span style={{ color: "#4ade80", flexShrink: 0 }}>
          <IC.Link />
        </span>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="arXiv URL を貼り付け..."
          className="flex-1 text-[11px] bg-transparent outline-none min-w-0"
          style={{ color: dark ? "#bbf7d0" : "#14532d" }}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !urlInput.trim()}
          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md disabled:opacity-50 transition-opacity flex-shrink-0"
          style={{
            fontFamily: "var(--font-display)",
            background: "#166534",
            color: "white",
            border: "1px solid #0f4d24",
          }}
        >
          {loading ? <IC.Loader /> : <IC.Sparkle />} 解析
        </button>
      </div>

      <div
        className="w-px h-5 flex-shrink-0"
        style={{ background: "rgba(0,80,30,0.2)" }}
      />

      {/* メモ追加ボタン */}
      <button
        onClick={handleAddMemo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex-shrink-0"
        style={{
          fontFamily: "var(--font-display)",
          color: dark ? "#86efac" : "#166534",
          background: dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.45)",
          border: `1px solid ${dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.25)"}`,
        }}
      >
        <IC.Pencil /> メモ追加
      </button>

      {/* グループ分けボタン */}
      <button
        onClick={() => setShowGroupModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex-shrink-0"
        style={{
          fontFamily: "var(--font-display)",
          color: dark ? "#86efac" : "#166534",
          background: dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.45)",
          border: `1px solid ${dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.25)"}`,
        }}
      >
        <IC.Layers /> グループ分け
      </button>

      <div
        className="w-px h-5 flex-shrink-0"
        style={{ background: "rgba(0,80,30,0.2)" }}
      />

      {/* ダークモード切り替え */}
      <button
        onClick={() => setDark((d) => !d)}
        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
        style={{ color: dark ? "#86efac" : "#166534" }}
      >
        {dark ? <IC.Sun /> : <IC.Moon />}
      </button>

      {/* 件数バッジ */}
      <span
        className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
        style={{
          fontFamily: "var(--font-mono)",
          background: "rgba(134,239,172,0.15)",
          color: dark ? "#86efac" : "#166534",
        }}
      >
        {paperCount}件
      </span>
    </header>
  );
}
