"use client";

import { IC } from "./Icons";

/** キャンバスが空のときに表示する、使い方の案内 */
export function EmptyState({ onTrySample }: { onTrySample: () => void }) {
  const steps = [
    { icon: <IC.Link />, text: "上の入力欄に arXiv の URL を貼り付けて「解析」" },
    { icon: <IC.Sparkle />, text: "AI が日本語で要点3つとタグを作成します" },
    { icon: <IC.Layers />, text: "カードをドラッグして並べ、グループやメモで整理" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <div
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 shadow-xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2
          className="text-[17px] font-semibold text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PaperCanvas へようこそ
        </h2>
        <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">
          読んだ論文・読みたい論文を、ホワイトボードのように整理できます。
        </p>

        <ol className="mt-4 space-y-2.5">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center gap-3 text-[12px] text-[var(--foreground)]">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#86efac]">
                {step.icon}
              </span>
              {step.text}
            </li>
          ))}
        </ol>

        <button
          onClick={onTrySample}
          className="mt-5 w-full rounded-lg bg-[#166534] py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          試しに「Attention Is All You Need」を追加
        </button>

        <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">
          操作: ドラッグで移動 / ホイールでスクロール / Ctrl(⌘)+ホイールでズーム
        </p>
      </div>
    </div>
  );
}
