"use client";

import React, { useEffect, useState } from "react";
import { Paper } from "@/types/paper";
import { IC } from "./Icons";

interface RightDrawerProps {
  paper: Paper | null;
  dark: boolean;
  onClose: () => void;
}

const CARD_COLORS = {
  sky: {
    rgb: "14,165,233",
    dot: "#38bdf8",
    tagBg: "rgba(14,165,233,0.18)",
    tagText: "#0369a1",
  },
  indigo: {
    rgb: "99,102,241",
    dot: "#818cf8",
    tagBg: "rgba(99,102,241,0.18)",
    tagText: "#4338ca",
  },
  emerald: {
    rgb: "16,185,129",
    dot: "#34d399",
    tagBg: "rgba(16,185,129,0.18)",
    tagText: "#047857",
  },
  violet: {
    rgb: "139,92,246",
    dot: "#a78bfa",
    tagBg: "rgba(139,92,246,0.18)",
    tagText: "#6d28d9",
  },
  rose: {
    rgb: "244,63,94",
    dot: "#fb7185",
    tagBg: "rgba(244,63,94,0.18)",
    tagText: "#be123c",
  },
  amber: {
    rgb: "245,158,11",
    dot: "#fbbf24",
    tagBg: "rgba(245,158,11,0.18)",
    tagText: "#b45309",
  },
} as const;

export function RightDrawer({ paper, onClose }: RightDrawerProps) {
  const [note, setNote] = useState("");
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (paper) {
      setNote("");
      setAnimationKey((current) => current + 1);
    }
  }, [paper?.id]);

  if (!paper) return null;

  const color = CARD_COLORS[paper.color];

  return (
    <aside
      key={animationKey}
      className="panel-slide-in flex h-full w-[320px] flex-shrink-0 flex-col overflow-hidden border-l bg-[var(--card)]"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: color.dot,
              boxShadow: `0 0 6px ${color.dot}`,
            }}
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            論文詳細
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
          aria-label="詳細を閉じる"
        >
          <IC.X />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto">
        <div
          className="border-b border-[var(--border)] px-5 py-4"
          style={{ background: `rgba(${color.rgb},0.07)` }}
        >
          <div className="mb-2 flex flex-wrap gap-1">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                background: color.dot,
                color: "#fff",
              }}
            >
              {paper.year}
            </span>

            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: color.tagBg,
                  color: color.tagText,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <h2
            className="mb-1.5 text-[15px] font-semibold leading-snug"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--foreground)",
            }}
          >
            {paper.title}
          </h2>

          <p
            className="text-[11px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {paper.authors.join(", ")}
          </p>
        </div>

        <div className="space-y-5 px-5 py-4">
          <section>
            <SectionLabel icon={<IC.Sparkle />} label="AIサマリー" />
            <ul className="mt-2 space-y-2">
              {paper.bullets.map((bullet, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-[12px] leading-relaxed"
                  style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
                  <span
                    className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                    style={{ background: color.dot, opacity: 0.7 }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionLabel label="アブストラクト" />
            <p
              className="mt-2 text-[12px] leading-relaxed"
              style={{ color: "var(--foreground)", opacity: 0.72 }}
            >
              {paper.abstract}
            </p>
          </section>

          <section>
            <SectionLabel label="ソースURL" />
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 break-all text-[11px] transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              <IC.Link />
              {paper.url}
            </a>
          </section>

          <section>
            <SectionLabel icon={<IC.File />} label="PDFプレビュー" />
            <div className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]">
              <IC.Upload />
              <span className="text-[11px]">PDFをドロップして添付</span>
            </div>
          </section>

          <section>
            <SectionLabel label="個人メモ" />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="気づき、メモ、他論文との関連などを記入…"
              className="mt-2 h-32 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </section>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[var(--border)] px-5 py-4">
        <button
          className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-[12px] font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          メモを保存
        </button>
        <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-[12px] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]">
          共有
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && (
        <span style={{ color: "var(--primary)", opacity: 0.7 }}>{icon}</span>
      )}
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}
