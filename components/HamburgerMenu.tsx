"use client";

import React, { useState } from "react";
import type { CurrentUser } from "./CanvasApp";
import { IC } from "./Icons";
import { NoticeIcon, useNotifications } from "./Notifications";

interface HamburgerMenuProps {
  user: CurrentUser;
  counts: { papers: number; memos: number; groups: number };
  onOpenSettings: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const timeFormat = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormat = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" });

export function HamburgerMenu({
  user,
  counts,
  onOpenSettings,
  onLogout,
  onClose,
}: HamburgerMenuProps) {
  const { history, unreadCount, markAllRead, clearHistory } = useNotifications();
  const [showNotices, setShowNotices] = useState(false);

  const accountInfo = [
    { label: "登録日", value: dateFormat.format(new Date(user.createdAt)) },
    { label: "論文", value: `${counts.papers}件` },
    { label: "メモ / グループ", value: `${counts.memos} / ${counts.groups}` },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <aside
        className="fixed top-[var(--header-h)] bottom-0 left-0 z-50 flex w-72 max-w-[85vw] animate-[slideInLeft_0.22s_cubic-bezier(0.22,1,0.36,1)_both] flex-col shadow-2xl"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
        aria-label="メニュー"
      >
        <div
          className="border-b px-5 py-5"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-[16px] font-semibold text-white uppercase">
              {user.email.charAt(0) || <IC.User />}
            </div>
            <p className="min-w-0 truncate text-[13px] font-medium text-white" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>

        <div
          className="space-y-2 border-b px-5 py-4"
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        >
          {accountInfo.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--muted-foreground)]">{label}</span>
              <span
                className="text-right text-[11px] font-medium text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <nav className="thin-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          <MenuButton
            icon={<IC.Bell />}
            label="通知"
            badge={unreadCount > 0 ? unreadCount : undefined}
            onClick={() => {
              setShowNotices((visible) => !visible);
              markAllRead();
            }}
          />

          {showNotices && (
            <div className="mx-1 mb-2 rounded-xl border border-[var(--border)] p-2">
              {history.length === 0 ? (
                <p className="px-2 py-3 text-center text-[11px] text-[var(--muted-foreground)]">
                  このセッションの通知はまだありません
                </p>
              ) : (
                <>
                  <ul className="space-y-1">
                    {history.map((notice) => (
                      <li
                        key={notice.id}
                        className="flex gap-2 rounded-lg px-2 py-1.5 text-[11px] leading-relaxed text-[var(--foreground)]"
                      >
                        <NoticeIcon kind={notice.kind} />
                        <span className="flex-1">{notice.message}</span>
                        <time
                          className="flex-shrink-0 text-[10px] text-[var(--muted-foreground)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {timeFormat.format(notice.createdAt)}
                        </time>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={clearHistory}
                    className="mt-1 w-full rounded-lg py-1 text-[11px] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                  >
                    履歴を消去
                  </button>
                </>
              )}
            </div>
          )}

          <MenuButton icon={<IC.Settings />} label="設定" onClick={onOpenSettings} />
        </nav>

        <div className="border-t px-3 pt-3 pb-5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <IC.LogOut />
            ログアウト
          </button>
        </div>
      </aside>
    </>
  );
}

function MenuButton({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span className="text-[var(--muted-foreground)]">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span
          className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
