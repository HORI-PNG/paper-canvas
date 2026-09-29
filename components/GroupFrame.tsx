"use client";

import React from "react";
import { Group, ResizeHandle } from "@/types/paper";
import { IC } from "./Icons";

// リサイズハンドルの定義
export const HANDLES: ResizeHandle[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

interface GroupFrameProps {
  group: Group;
  dark: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (
    e: React.MouseEvent,
    id: string,
    handle: ResizeHandle,
  ) => void;
  onDeleteGroup: (id: string, e: React.MouseEvent) => void;
}

export function GroupFrame({
  group,
  dark,
  zoom,
  onMouseDown,
  onResizeStart,
  onDeleteGroup,
}: GroupFrameProps) {
  return (
    <div
      className="absolute rounded-2xl transition-shadow group cursor-grab active:cursor-grabbing"
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
        backgroundColor: dark ? "rgba(255,255,255,0.02)" : group.bgColor,
        border: `2px dashed ${dark ? "rgba(255,255,255,0.2)" : group.borderColor}`,
      }}
      onMouseDown={(e) => onMouseDown(e, group.id)}
    >
      {/* グループラベル＆削除ボタン */}
      <div className="absolute -top-3.5 left-4 flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm select-none">
        <span
          className="text-[11px] font-bold tracking-wide"
          style={{ color: dark ? "#e5e7eb" : group.borderColor }}
        >
          {group.label}
        </span>
        <button
          onClick={(e) => onDeleteGroup(group.id, e)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <IC.X />
        </button>
      </div>

      {/* 8方向のリサイズハンドル */}
      {HANDLES.map((h) => {
        const style: React.CSSProperties = {
          position: "absolute",
          width: 10 / zoom,
          height: 10 / zoom,
          backgroundColor: group.borderColor,
          borderRadius: "50%",
          zIndex: 10,
        };

        if (h.includes("n")) style.top = -5 / zoom;
        if (h.includes("s")) style.bottom = -5 / zoom;
        if (h.includes("w")) style.left = -5 / zoom;
        if (h.includes("e")) style.right = -5 / zoom;
        if (h === "n" || h === "s") style.left = "50%";
        if (h === "e" || h === "w") style.top = "50%";

        const cursorMap: Record<ResizeHandle, string> = {
          nw: "nwse-resize",
          se: "nwse-resize",
          ne: "nesw-resize",
          sw: "nesw-resize",
          n: "ns-resize",
          s: "ns-resize",
          e: "ew-resize",
          w: "ew-resize",
        };

        return (
          <div
            key={h}
            style={{ ...style, cursor: cursorMap[h] }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, group.id, h)}
          />
        );
      })}
    </div>
  );
}
