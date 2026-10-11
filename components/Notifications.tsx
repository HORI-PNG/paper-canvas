"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { IC } from "./Icons";

export type NoticeKind = "success" | "error" | "info";

export interface Notice {
  id: number;
  kind: NoticeKind;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationsValue {
  notify: (kind: NoticeKind, message: string) => void;
  history: Notice[];
  unreadCount: number;
  markAllRead: () => void;
  clearHistory: () => void;
}

/*
 * Context を使うと、props で何階層も受け渡さずに
 * どのコンポーネントからでも notify() を呼べるようになる。
 *
 * 画面右下に数秒だけ出る「トースト」と、
 * メニューから後で見返せる「通知履歴」を同時に管理する。
 */
const NotificationsContext = createContext<NotificationsValue | null>(null);

const TOAST_MS = 4500;
const HISTORY_LIMIT = 50;

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<Notice[]>([]);
  const [toasts, setToasts] = useState<Notice[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (kind: NoticeKind, message: string) => {
      const notice: Notice = {
        id: nextId.current++,
        kind,
        message,
        createdAt: new Date(),
        read: false,
      };
      setToasts((items) => [...items.slice(-2), notice]);
      setHistory((items) => [notice, ...items].slice(0, HISTORY_LIMIT));
      window.setTimeout(() => dismiss(notice.id), TOAST_MS);
    },
    [dismiss],
  );

  const value = useMemo<NotificationsValue>(
    () => ({
      notify,
      history,
      unreadCount: history.filter((item) => !item.read).length,
      markAllRead: () =>
        setHistory((items) => items.map((item) => ({ ...item, read: true }))),
      clearHistory: () => setHistory([]),
    }),
    [notify, history],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}

      {/* aria-live: スクリーンリーダーに新しい通知を読み上げてもらう */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 left-1/2 z-[100] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className="toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--foreground)] shadow-xl"
          >
            <NoticeIcon kind={toast.kind} />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="通知を閉じる"
            >
              <IC.X />
            </button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function NoticeIcon({ kind }: { kind: NoticeKind }) {
  const color =
    kind === "error" ? "#dc2626" : kind === "success" ? "#16a34a" : "#0ea5e9";
  return (
    <span className="mt-0.5 flex-shrink-0" style={{ color }}>
      {kind === "success" ? <IC.Check /> : <IC.Alert />}
    </span>
  );
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error("useNotifications は NotificationsProvider の内側で使ってください");
  }
  return value;
}
