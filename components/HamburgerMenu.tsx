"use client";

import React from "react";
import { IC } from "./Icons";

interface HamburgerMenuProps {
  showMenu: boolean;
  dark: boolean;
  setDark: (dark: boolean) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

const ACCOUNT_INFO = [
  { label: "ユーザーID", value: "yamada-taro-2024" },
  { label: "最終ログイン", value: "2026-09-29 09:14" },
  { label: "ストレージ", value: "2.4 GB / 10 GB" },
];

export function HamburgerMenu({ showMenu, onClose }: HamburgerMenuProps) {
  if (!showMenu) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <aside
        className="fixed bottom-0 left-0 top-[var(--header-h)] z-50 flex w-72 flex-col shadow-2xl animate-[slideInLeft_0.22s_cubic-bezier(0.22,1,0.36,1)_both]"
        style={{
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          className="border-b px-5 py-5"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-white">
              <IC.User />
            </div>

            <div>
              <p
                className="text-[14px] font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                山田 太郎
              </p>
              <p className="mt-0.5 text-[11px] text-white/70">
                taro.yamada@university.ac.jp
              </p>
              <span
                className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Proプラン
              </span>
            </div>
          </div>
        </div>

        <div
          className="border-b px-5 py-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--muted)",
          }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--muted-foreground)",
            }}
          >
            アカウント情報
          </p>

          <div className="space-y-2">
            {ACCOUNT_INFO.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3"
              >
                <span
                  className="text-[11px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {label}
                </span>
                <span
                  className="text-right text-[11px] font-medium"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--foreground)",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: "24%", background: "#16a34a" }}
            />
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-3">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-[var(--muted)]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--foreground)",
            }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>
              <IC.Bell />
            </span>
            <span className="flex-1 text-left">通知</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{
                background: "#dc2626",
                fontFamily: "var(--font-mono)",
              }}
            >
              3
            </span>
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-[var(--muted)]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--foreground)",
            }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>
              <IC.Settings />
            </span>
            <span className="flex-1 text-left">設定</span>
          </button>
        </nav>

        <div
          className="border-t px-3 pb-5 pt-3"
          style={{ borderColor: "var(--border)" }}
        >
          <button
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
