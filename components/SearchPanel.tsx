"use client";

import React, { forwardRef, useState } from "react";
import type { TagCount } from "@/lib/search";
import type { Paper } from "@/types/paper";
import { IC } from "./Icons";

interface SearchPanelProps {
  query: string;
  onQueryChange: (query: string) => void;
  tags: TagCount[];
  selectedTags: string[];
  onToggleTag: (key: string) => void;
  onClear: () => void;
  /** 条件に合った論文（検索中・絞り込み中のときだけ渡す） */
  results: Paper[] | null;
  totalPapers: number;
  onJump: (paper: Paper) => void;
}

const MAX_RESULTS = 8;

/**
 * キャンバス左上に浮かぶ検索・タグ絞り込みパネル。
 * forwardRef で input 要素を親に渡し、ショートカットキー（/ や Ctrl+K）でフォーカスできるようにする。
 */
export const SearchPanel = forwardRef<HTMLInputElement, SearchPanelProps>(
  function SearchPanel(
    {
      query,
      onQueryChange,
      tags,
      selectedTags,
      onToggleTag,
      onClear,
      results,
      totalPapers,
      onJump,
    },
    inputRef,
  ) {
    const [showTags, setShowTags] = useState(false);
    const [focused, setFocused] = useState(false);
    const active = query.trim() !== "" || selectedTags.length > 0;
    const selectedLabels = tags.filter((tag) => selectedTags.includes(tag.key));

    return (
      <div
        className="absolute top-3 left-3 z-20 w-[calc(100%-1.5rem)] max-w-[340px]"
        // キャンバスのパン操作が始まらないようにする
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 shadow-md">
          <span className="text-[var(--muted-foreground)]">
            <IC.Search />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            // 一覧の項目をクリックする前に閉じないよう、少し待ってから閉じる
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClear();
                e.currentTarget.blur();
              }
              if (e.key === "Enter" && results?.[0]) onJump(results[0]);
            }}
            placeholder="論文・メモを検索（/ キー）"
            aria-label="論文・メモを検索"
            className="min-w-0 flex-1 bg-transparent py-0.5 text-[12px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
          />
          {active && (
            <span
              className="flex-shrink-0 text-[10px] text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
              aria-live="polite"
            >
              {results?.length ?? 0}/{totalPapers}件
            </span>
          )}
          {active && (
            <button
              onClick={onClear}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="検索と絞り込みを解除"
              title="解除"
            >
              <IC.X />
            </button>
          )}
          <button
            onClick={() => setShowTags((visible) => !visible)}
            className={`flex h-6 flex-shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium transition-colors ${
              showTags || selectedTags.length > 0
                ? "bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            }`}
            aria-expanded={showTags}
            aria-label="タグで絞り込み"
          >
            <IC.Tag />
            {selectedTags.length > 0 ? selectedTags.length : "タグ"}
          </button>
        </div>

        {/* 選択中のタグ（パネルを閉じていても見えるように） */}
        {selectedLabels.length > 0 && !showTags && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {selectedLabels.map((tag) => (
              <TagChip key={tag.key} tag={tag} selected onClick={() => onToggleTag(tag.key)} />
            ))}
          </div>
        )}

        {showTags && (
          <div className="mt-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-[var(--muted-foreground)] uppercase">
                タグ（選んだすべてを含む論文）
              </span>
              <button
                onClick={() => setShowTags(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="タグ一覧を閉じる"
              >
                <IC.X />
              </button>
            </div>
            {tags.length === 0 ? (
              <p className="py-2 text-[11px] text-[var(--muted-foreground)]">
                論文を追加するとタグが表示されます
              </p>
            ) : (
              <div className="thin-scroll flex max-h-56 flex-wrap gap-1 overflow-y-auto">
                {tags.map((tag) => (
                  <TagChip
                    key={tag.key}
                    tag={tag}
                    selected={selectedTags.includes(tag.key)}
                    onClick={() => onToggleTag(tag.key)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 検索欄にフォーカスしている間だけ、ヒットした論文の一覧を出す */}
        {focused && results && query.trim() && !showTags && (
          <ul className="thin-scroll mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
            {results.length === 0 ? (
              <li className="px-3 py-3 text-[11px] text-[var(--muted-foreground)]">
                一致する論文はありません
              </li>
            ) : (
              results.slice(0, MAX_RESULTS).map((paper) => (
                <li key={paper.id}>
                  <button
                    onClick={() => onJump(paper)}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-[var(--muted)]"
                  >
                    <span className="line-clamp-1 text-[12px] font-medium text-[var(--foreground)]">
                      {paper.title}
                    </span>
                    <span className="line-clamp-1 text-[10px] text-[var(--muted-foreground)]">
                      {paper.year} · {paper.authors.slice(0, 3).join(", ")}
                    </span>
                  </button>
                </li>
              ))
            )}
            {results.length > MAX_RESULTS && (
              <li className="px-3 py-1.5 text-[10px] text-[var(--muted-foreground)]">
                ほか {results.length - MAX_RESULTS} 件（キャンバス上で強調表示しています）
              </li>
            )}
          </ul>
        )}
      </div>
    );
  },
);

function TagChip({
  tag,
  selected,
  onClick,
}: {
  tag: TagCount;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
        selected
          ? "border-[#166534] bg-[#166534] text-white dark:border-[#86efac] dark:bg-[#86efac] dark:text-[#14532d]"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[#16a34a]"
      }`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      #{tag.label}
      <span className={selected ? "opacity-80" : "text-[var(--muted-foreground)]"}>
        {tag.count}
      </span>
    </button>
  );
}
