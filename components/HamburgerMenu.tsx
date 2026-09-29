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

export function HamburgerMenu({
  showMenu,
  dark,
  setDark,
  zoom,
  setZoom,
  onClose,
}: HamburgerMenuProps) {
  if (!showMenu) return null;

  return (
    <div
      className="fixed top-0 left-0 h-full w-[280px] z-40 shadow-2xl flex flex-col border-r"
      style={{
        backgroundColor: dark ? "#191b22" : "#ffffff",
        borderColor: dark ? "#2a2d38" : "#e5e7eb",
        color: dark ? "#eceef2" : "#1a1d23",
        animation: "slideInLeft 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <span className="text-[13px] font-bold tracking-tight">
            PaperCanvas
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <IC.X />
        </button>
      </div>

      {/* ユーザーカード */}
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
          <IC.User />
        </div>
        <div className="overflow-hidden">
          <p className="text-[13px] font-bold truncate">研究者 ユーザー</p>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono font-medium">
            Pro Plan Member
          </p>
        </div>
      </div>

      {/* メニュー本文 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 thin-scroll">
        {/* キャンバスコントロール */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-2.5 tracking-wider">
            Canvas Control
          </p>
          <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400">
              <span>Zoom Level</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
                className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 text-gray-600 dark:text-gray-300"
              >
                <IC.Minus />
              </button>
              <input
                type="range"
                min="0.4"
                max="1.8"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <button
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
                className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 text-gray-600 dark:text-gray-300"
              >
                <IC.Plus />
              </button>
            </div>
          </div>
        </div>

        {/* テーマ切り替え */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-2.5 tracking-wider">
            Appearance
          </p>
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center justify-between w-full p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-[12px] font-semibold">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-indigo-900/50 text-amber-600 dark:text-indigo-300">
                {dark ? <IC.Moon /> : <IC.Sun />}
              </span>
              <span>{dark ? "ダークモード" : "ライトモード"}</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${dark ? "bg-indigo-600" : "bg-gray-300"}`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${dark ? "left-4.5" : "left-0.5"}`}
              />
            </div>
          </button>
        </div>

        {/* ナビゲーション */}
        <div className="space-y-1 pt-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono mb-2 tracking-wider">
            Menu
          </p>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-[12px] font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 transition-colors group">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <IC.Grid />
            </span>
            ダッシュボード
          </button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-[12px] font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 transition-colors group">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <IC.Bell />
            </span>
            更新通知
          </button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-[12px] font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 transition-colors group">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <IC.Settings />
            </span>
            設定
          </button>
        </div>
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-black/5 dark:border-white/5">
        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <IC.LogOut /> ログアウト
        </button>
      </div>
    </div>
  );
}
