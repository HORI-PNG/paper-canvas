"use client";

import React from "react";
import { IC } from "./Icons";

interface HeaderProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  urlInput: string;
  setUrlInput: (value: string) => void;
  handleAnalyze: () => void;
  loading: boolean;
  handleAddMemo: () => void;
  setShowGroupModal: (value: boolean) => void;
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
      className="flex flex-shrink-0 items-center gap-3 border-b px-4"
      style={{
        height: "var(--header-h, 56px)",
        background: dark ? "#1a3d2b" : "#98fb98",
        borderColor: dark ? "#0f2d1e" : "#6ddb6d",
      }}
    >
      <button
        onClick={() => setShowMenu((visible) => !visible)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(134,239,172,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = showMenu
            ? "rgba(134,239,172,0.15)"
            : "transparent";
        }}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
        style={{
          color: dark ? "#86efac" : "#166534",
          background: showMenu ? "rgba(134,239,172,0.15)" : "transparent",
        }}
        aria-label="メニューを開く"
      >
        <IC.Menu />
      </button>

      <div className="mr-1 flex flex-shrink-0 items-center">
        <span
          className="text-[14px] font-semibold tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: dark ? "#bbf7d0" : "#14532d",
          }}
        >
          PaperCanvas
        </span>
      </div>

      <div
        className="h-5 w-px flex-shrink-0"
        style={{ background: "rgba(0,80,30,0.2)" }}
      />

      <div
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-shadow"
        style={{
          background: dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.55)",
          border: `1px solid ${
            dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.2)"
          }`,
          width: 320,
        }}
      >
        <span style={{ color: "#4ade80", flexShrink: 0 }}>
          <IC.Link />
        </span>

        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAnalyze();
          }}
          placeholder="arXiv URL を貼り付け..."
          className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
          style={{ color: dark ? "#bbf7d0" : "#14532d" }}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !urlInput.trim()}
          className="flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-opacity disabled:opacity-50"
          style={{
            fontFamily: "var(--font-display)",
            background: "#166534",
            color: "white",
            border: "1px solid #0f4d24",
          }}
        >
          {loading ? <IC.Loader /> : <IC.Sparkle />}
          解析
        </button>
      </div>

      <div
        className="h-5 w-px flex-shrink-0"
        style={{ background: "rgba(0,80,30,0.2)" }}
      />

      <button
        onClick={handleAddMemo}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
        style={{
          fontFamily: "var(--font-display)",
          color: dark ? "#86efac" : "#166534",
          background: dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.45)",
          border: `1px solid ${
            dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.25)"
          }`,
        }}
      >
        <IC.Pencil />
        メモ追加
      </button>

      <button
        onClick={() => setShowGroupModal(true)}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
        style={{
          fontFamily: "var(--font-display)",
          color: dark ? "#86efac" : "#166534",
          background: dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.45)",
          border: `1px solid ${
            dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.25)"
          }`,
        }}
      >
        <IC.Layers />
        グループ分け
      </button>

      <div
        className="ml-auto h-5 w-px flex-shrink-0"
        style={{ background: "rgba(0,80,30,0.2)" }}
      />

      <button
        onClick={() => setDark((current) => !current)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(134,239,172,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
        style={{ color: dark ? "#86efac" : "#166534" }}
        aria-label={dark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      >
        {dark ? <IC.Sun /> : <IC.Moon />}
      </button>

      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
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
