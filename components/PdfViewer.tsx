"use client";

import { IC } from "./Icons";

/** 添付 PDF を全画面のモーダルで表示する（ブラウザ内蔵の PDF ビューアを iframe で使う） */
export function PdfViewer({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/70 p-2 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} のPDF`}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="flex items-center gap-3 rounded-t-xl bg-[var(--card)] px-4 py-2.5">
        <span className="flex-1 truncate text-[13px] font-semibold text-[var(--foreground)]">
          {title}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[12px] text-[var(--primary)] hover:opacity-80"
        >
          <IC.External />
          新しいタブで開く
        </a>
        <button
          onClick={onClose}
          autoFocus
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          aria-label="PDFを閉じる"
        >
          <IC.X />
        </button>
      </div>
      <iframe src={url} title={title} className="w-full flex-1 rounded-b-xl bg-white" />
    </div>
  );
}
