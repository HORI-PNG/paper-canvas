"use client";

import React from "react";
import { IC } from "./Icons";

export type SaveState = "saving" | "saved" | "error";

interface HeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  urlInput: string;
  setUrlInput: (value: string) => void;
  handleAnalyze: () => void;
  loading: boolean;
  handleAddMemo: () => void;
  setShowGroupModal: (value: boolean) => void;
  paperCount: number;
  saveState: SaveState;
}

const SAVE_LABEL: Record<SaveState, string> = {
  saving: "保存中…",
  saved: "保存済み",
  error: "保存失敗",
};

export function Header({
  dark,
  onToggleDark,
  showMenu,
  setShowMenu,
  urlInput,
  setUrlInput,
  handleAnalyze,
  loading,
  handleAddMemo,
  setShowGroupModal,
  paperCount,
  saveState,
}: HeaderProps) {
  const fg = dark ? "#86efac" : "#166534";
  const subtleButton: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    color: fg,
    background: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.45)",
    border: `1px solid ${dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.25)"}`,
  };
  const divider = (
    <div
      className="hidden h-5 w-px flex-shrink-0 sm:block"
      style={{ background: "rgba(0,80,30,0.2)" }}
    />
  );

  return (
    <header
      className="flex flex-shrink-0 items-center gap-2 border-b px-3 sm:gap-3 sm:px-4"
      style={{
        height: "var(--header-h, 56px)",
        background: dark ? "#1a3d2b" : "#98fb98",
        borderColor: dark ? "#0f2d1e" : "#6ddb6d",
      }}
    >
      <button
        onClick={() => setShowMenu((visible) => !visible)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[rgba(134,239,172,0.15)]"
        style={{
          color: fg,
          background: showMenu ? "rgba(134,239,172,0.15)" : undefined,
        }}
        aria-label="メニューを開く"
        aria-expanded={showMenu}
      >
        <IC.Menu />
      </button>

      <span
        className="mr-1 hidden flex-shrink-0 text-[14px] font-semibold tracking-tight md:inline"
        style={{
          fontFamily: "var(--font-display)",
          color: dark ? "#bbf7d0" : "#14532d",
        }}
      >
        PaperCanvas
      </span>

      {divider}

      {/* form にしておくと Enter キーでの送信が自然に動く */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAnalyze();
        }}
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:max-w-[360px]"
        style={{
          background: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.55)",
          border: `1px solid ${dark ? "rgba(134,239,172,0.2)" : "rgba(0,80,30,0.2)"}`,
        }}
      >
        <span className="flex-shrink-0" style={{ color: "#4ade80" }}>
          <IC.Link />
        </span>

        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="arXiv の URL または ID を貼り付け…"
          aria-label="arXiv の URL または ID"
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#166534]/60 dark:placeholder:text-[#bbf7d0]/50"
          style={{ color: dark ? "#bbf7d0" : "#14532d" }}
        />

        <button
          type="submit"
          disabled={loading || !urlInput.trim()}
          className="flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-white transition-opacity disabled:opacity-50"
          style={{
            fontFamily: "var(--font-display)",
            background: "#166534",
            border: "1px solid #0f4d24",
          }}
        >
          {loading ? <IC.Loader /> : <IC.Sparkle />}
          {loading ? "解析中" : "解析"}
        </button>
      </form>

      {divider}

      <button
        onClick={handleAddMemo}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-80 sm:px-3"
        style={subtleButton}
        aria-label="メモ追加"
        title="メモ追加"
      >
        <IC.Pencil />
        <span className="hidden lg:inline">メモ追加</span>
      </button>

      <button
        onClick={() => setShowGroupModal(true)}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-80 sm:px-3"
        style={subtleButton}
        aria-label="グループ作成"
        title="グループ作成"
      >
        <IC.Layers />
        <span className="hidden lg:inline">グループ</span>
      </button>

      <span
        className="ml-auto hidden flex-shrink-0 items-center gap-1 text-[11px] md:flex"
        style={{
          color: saveState === "error" ? "#dc2626" : fg,
          opacity: saveState === "saved" ? 0.7 : 1,
        }}
        aria-live="polite"
      >
        {saveState === "saving" ? (
          <IC.Loader />
        ) : saveState === "error" ? (
          <IC.Alert />
        ) : (
          <IC.Check />
        )}
        {SAVE_LABEL[saveState]}
      </span>

      {divider}

      <button
        onClick={onToggleDark}
        className="hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[rgba(134,239,172,0.15)] sm:flex"
        style={{ color: fg }}
        aria-label={dark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      >
        {dark ? <IC.Sun /> : <IC.Moon />}
      </button>

      <span
        className="hidden flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline"
        style={{
          fontFamily: "var(--font-mono)",
          background: "rgba(134,239,172,0.15)",
          color: fg,
        }}
      >
        {paperCount}件
      </span>
    </header>
  );
}
