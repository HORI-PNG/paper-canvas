"use client";

import React, { useRef, useState } from "react";
import * as api from "@/lib/canvas-api";
import { CARD_COLORS, type CardColor, type Paper } from "@/types/paper";
import { IC } from "./Icons";
import { useNotifications } from "./Notifications";
import { PdfViewer } from "./PdfViewer";

interface RightDrawerProps {
  paper: Paper;
  userId: string;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Pick<Paper, "color" | "pdfPath">>) => void;
  onNoteChange: (id: string, note: string) => void;
  onDelete: (paper: Paper) => void;
  onTagClick: (tag: string) => void;
}

const COLOR_STYLES: Record<
  CardColor,
  { rgb: string; dot: string; tagBg: string; tagText: string }
> = {
  sky: { rgb: "14,165,233", dot: "#38bdf8", tagBg: "rgba(14,165,233,0.18)", tagText: "#0369a1" },
  indigo: { rgb: "99,102,241", dot: "#818cf8", tagBg: "rgba(99,102,241,0.18)", tagText: "#4338ca" },
  emerald: { rgb: "16,185,129", dot: "#34d399", tagBg: "rgba(16,185,129,0.18)", tagText: "#047857" },
  violet: { rgb: "139,92,246", dot: "#a78bfa", tagBg: "rgba(139,92,246,0.18)", tagText: "#6d28d9" },
  rose: { rgb: "244,63,94", dot: "#fb7185", tagBg: "rgba(244,63,94,0.18)", tagText: "#be123c" },
  amber: { rgb: "245,158,11", dot: "#fbbf24", tagBg: "rgba(245,158,11,0.18)", tagText: "#b45309" },
};

export function RightDrawer({
  paper,
  userId,
  onClose,
  onUpdate,
  onNoteChange,
  onDelete,
  onTagClick,
}: RightDrawerProps) {
  const { notify } = useNotifications();
  const color = COLOR_STYLES[paper.color];

  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const shareUrl = () =>
    `${window.location.origin}/papers/${paper.arxivId}`;

  const handleShare = async () => {
    const url = shareUrl();
    // スマホなどでは OS の共有メニューを使い、それ以外はクリップボードにコピー
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: paper.title, url });
        return;
      } catch {
        // ユーザーがキャンセルした場合など。コピーにフォールバックする
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notify("success", "共有リンクをコピーしました（要約とアブストラクトが公開されます。個人メモは含まれません）");
    } catch {
      window.prompt("このリンクをコピーしてください", url);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      notify("error", "PDF ファイルを選択してください");
      return;
    }
    if (file.size > api.PDF_MAX_BYTES) {
      notify("error", "PDF は 20MB までです");
      return;
    }

    setUploading(true);
    try {
      const path = await api.uploadPdf(userId, paper.id, file);
      onUpdate(paper.id, { pdfPath: path });
      notify("success", "PDF を添付しました");
    } catch (error) {
      console.error(error);
      notify("error", "PDF のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenPdf = async () => {
    if (!paper.pdfPath) return;
    try {
      setPdfUrl(await api.getPdfUrl(paper.pdfPath));
    } catch (error) {
      console.error(error);
      notify("error", "PDF を開けませんでした");
    }
  };

  const handleRemovePdf = async () => {
    if (!paper.pdfPath) return;
    if (!window.confirm("添付した PDF を削除しますか？")) return;
    try {
      await api.removePdf(paper.id, paper.pdfPath);
      onUpdate(paper.id, { pdfPath: null });
      notify("success", "PDF を削除しました");
    } catch (error) {
      console.error(error);
      notify("error", "PDF の削除に失敗しました");
    }
  };

  return (
    <aside
      className="panel-slide-in absolute inset-y-0 right-0 z-30 flex w-full flex-col overflow-hidden border-l bg-[var(--card)] shadow-2xl sm:static sm:w-[340px] sm:flex-shrink-0 sm:shadow-none"
      style={{ borderColor: "var(--border)" }}
      aria-label="論文詳細"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="カードの色">
          {CARD_COLORS.map((value) => (
            <button
              key={value}
              role="radio"
              aria-checked={paper.color === value}
              aria-label={value}
              onClick={() => onUpdate(paper.id, { color: value })}
              className="h-4 w-4 rounded-full transition-transform hover:scale-125"
              style={{
                background: COLOR_STYLES[value].dot,
                outline: paper.color === value ? `2px solid ${COLOR_STYLES[value].dot}` : "none",
                outlineOffset: 2,
              }}
            />
          ))}
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
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ fontFamily: "var(--font-mono)", background: color.dot }}
            >
              {paper.year}
            </span>
            {paper.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                title={`#${tag} で絞り込む`}
                className="paper-tag rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-70"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: color.tagBg,
                  color: color.tagText,
                  ["--tag-dark" as string]: color.dot,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>

          <h2
            className="mb-1.5 text-[15px] leading-snug font-semibold select-text"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            {paper.title}
          </h2>

          <p className="text-[11px] text-[var(--muted-foreground)] select-text">
            {paper.authors.join(", ")}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <ExternalLink href={paper.url}>arXiv</ExternalLink>
            <ExternalLink href={`https://arxiv.org/pdf/${paper.arxivId}`}>
              PDF（arXiv）
            </ExternalLink>
          </div>
        </div>

        <div className="space-y-5 px-5 py-4">
          <section>
            <SectionLabel icon={<IC.Sparkle />} label="AIサマリー" />
            <ul className="mt-2 space-y-2">
              {paper.bullets.map((bullet, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-[12px] leading-relaxed select-text"
                  style={{ color: "var(--foreground)", opacity: 0.85 }}
                >
                  <span
                    className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                    style={{ background: color.dot }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionLabel label="個人メモ" />
            <textarea
              value={paper.note}
              onChange={(e) => onNoteChange(paper.id, e.target.value)}
              placeholder="気づき、メモ、他論文との関連などを記入…（自動保存）"
              maxLength={20000}
              className="mt-2 h-32 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--foreground)] transition-shadow placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
            />
          </section>

          <section>
            <SectionLabel icon={<IC.File />} label="PDF添付" />
            {paper.pdfPath ? (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5">
                <span className="text-[var(--primary)]">
                  <IC.File />
                </span>
                <span className="flex-1 truncate text-[12px] text-[var(--foreground)]">
                  添付済みのPDF
                </span>
                <button
                  onClick={handleOpenPdf}
                  className="rounded-md bg-[var(--primary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary-foreground)] hover:opacity-90"
                >
                  開く
                </button>
                <button
                  onClick={handleRemovePdf}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-red-500"
                  aria-label="添付PDFを削除"
                >
                  <IC.Trash />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                className={`mt-2 flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors ${
                  dragOver
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                }`}
              >
                {uploading ? <IC.Loader /> : <IC.Upload />}
                <span className="text-[11px]">
                  {uploading
                    ? "アップロード中…"
                    : "PDFをドロップ、またはクリックして選択（20MBまで）"}
                </span>
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </section>

          <section>
            <SectionLabel label="アブストラクト" />
            <p
              className="mt-2 text-[12px] leading-relaxed select-text"
              style={{ color: "var(--foreground)", opacity: 0.72 }}
            >
              {paper.abstract}
            </p>
          </section>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[var(--border)] px-5 py-4">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] py-2 text-[12px] font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <IC.Share />
          共有リンクをコピー
        </button>
        <button
          onClick={() => onDelete(paper)}
          className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-[12px] text-[var(--muted-foreground)] transition-colors hover:border-red-300 hover:text-red-600"
          aria-label="この論文を削除"
        >
          <IC.Trash />
          削除
        </button>
      </div>

      {pdfUrl && (
        <PdfViewer url={pdfUrl} title={paper.title} onClose={() => setPdfUrl(null)} />
      )}
    </aside>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      <IC.External />
      {children}
    </a>
  );
}

function SectionLabel({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span style={{ color: "var(--primary)", opacity: 0.7 }}>{icon}</span>}
      <span
        className="text-[10px] font-semibold tracking-widest text-[var(--muted-foreground)] uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}
