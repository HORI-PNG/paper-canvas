"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IC } from "./Icons";
import { useNotifications } from "./Notifications";

interface SettingsModalProps {
  email: string;
  dark: boolean;
  onToggleDark: () => void;
  onClose: () => void;
}

const DELETE_PHRASE = "削除する";

export function SettingsModal({ email, dark, onToggleDark, onClose }: SettingsModalProps) {
  const router = useRouter();
  const { notify } = useNotifications();

  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      notify("error", "パスワードは8文字以上にしてください");
      return;
    }
    setSavingPassword(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSavingPassword(false);
    if (error) {
      notify("error", `パスワードを変更できませんでした: ${error.message}`);
      return;
    }
    setPassword("");
    notify("success", "パスワードを変更しました");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const response = await fetch("/api/account", { method: "DELETE" });
    if (!response.ok) {
      setDeleting(false);
      notify("error", "アカウントを削除できませんでした。時間をおいて再度お試しください");
      return;
    }
    // サーバー側で Cookie は消えているが、ブラウザ側のクライアントの状態も破棄しておく
    await createClient().auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative max-h-[90vh] w-full max-w-[400px] animate-[fadeScaleIn_0.18s_ease-out_both] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--primary)]">
              <IC.Settings />
            </span>
            <h2
              id="settings-title"
              className="text-[13px] font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              設定
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            aria-label="設定を閉じる"
          >
            <IC.X />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <Section title="表示">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-[12px] text-[var(--foreground)]">ダークモード</span>
              <input
                type="checkbox"
                checked={dark}
                onChange={onToggleDark}
                className="h-4 w-4 accent-[#166534]"
              />
            </label>
          </Section>

          <Section title="アカウント">
            <p className="mb-3 text-[12px] text-[var(--muted-foreground)]">{email}</p>
            <form onSubmit={handleChangePassword} className="flex gap-2">
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新しいパスワード（8文字以上）"
                aria-label="新しいパスワード"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-[12px] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <button
                type="submit"
                disabled={savingPassword || !password}
                className="rounded-lg bg-[var(--primary)] px-3 py-2 text-[12px] font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
              >
                変更
              </button>
            </form>
          </Section>

          <Section title="アカウント削除">
            <p className="mb-3 text-[12px] leading-relaxed text-[var(--muted-foreground)]">
              論文・メモ・グループ・添付PDFを含むすべてのデータが削除され、元に戻せません。
              続けるには「{DELETE_PHRASE}」と入力してください。
            </p>
            <div className="flex gap-2">
              <input
                value={deletePhrase}
                onChange={(e) => setDeletePhrase(e.target.value)}
                placeholder={DELETE_PHRASE}
                aria-label="確認の文字列"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-[12px] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deletePhrase !== DELETE_PHRASE || deleting}
                className="rounded-lg bg-red-600 px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
              >
                {deleting ? "削除中…" : "削除"}
              </button>
            </div>
          </Section>

          <p className="text-center text-[11px] text-[var(--muted-foreground)]">
            <a href="/privacy" target="_blank" className="underline hover:text-[var(--foreground)]">
              プライバシーポリシー
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        className="mb-2 text-[10px] font-semibold tracking-widest text-[var(--muted-foreground)] uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
