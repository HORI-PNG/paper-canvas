"use client";

import React, { useState } from "react";
import { IC } from "./Icons";
import { Group, ResizeHandle } from "@/types/paper";

const HANDLES: {
  id: ResizeHandle;
  cursor: string;
  style: React.CSSProperties;
}[] = [
  { id: "nw", cursor: "nw-resize", style: { top: -5, left: -5 } },
  {
    id: "n",
    cursor: "n-resize",
    style: { top: -5, left: "50%", transform: "translateX(-50%)" },
  },
  { id: "ne", cursor: "ne-resize", style: { top: -5, right: -5 } },
  {
    id: "e",
    cursor: "e-resize",
    style: { top: "50%", right: -5, transform: "translateY(-50%)" },
  },
  { id: "se", cursor: "se-resize", style: { bottom: -5, right: -5 } },
  {
    id: "s",
    cursor: "s-resize",
    style: { bottom: -5, left: "50%", transform: "translateX(-50%)" },
  },
  { id: "sw", cursor: "sw-resize", style: { bottom: -5, left: -5 } },
  {
    id: "w",
    cursor: "w-resize",
    style: { top: "50%", left: -5, transform: "translateY(-50%)" },
  },
];

interface GroupFrameProps {
  group: Group;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onResizeStart: (
    e: React.PointerEvent,
    id: string,
    handle: ResizeHandle,
  ) => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

export function GroupFrame({
  group,
  onPointerDown,
  onResizeStart,
  onRename,
  onDelete,
}: GroupFrameProps) {
  const [editing, setEditing] = useState(false);

  const finishEditing = (value: string) => {
    setEditing(false);
    const label = value.trim().slice(0, 100);
    if (label && label !== group.label) onRename(group.id, label);
  };

  return (
    <div
      className="group-frame group/frame absolute touch-none rounded-[14px] border-2 border-dashed"
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
        // zIndex: 0 で独立した重なり順を作り、リサイズハンドルが論文カードより上に出ないようにする
        zIndex: 0,
        ["--group-bg" as string]: group.bgColor,
        borderColor: group.borderColor,
        cursor: "move",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e, group.id);
      }}
    >
      <div
        className="absolute -top-7 left-4 flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold select-none"
        style={{
          fontFamily: "var(--font-display)",
          color: group.borderColor,
          background: group.bgColor,
          border: `1px solid ${group.borderColor}55`,
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title="ダブルクリックで名前を変更"
      >
        {editing ? (
          <input
            autoFocus
            defaultValue={group.label}
            maxLength={100}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={(e) => finishEditing(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-40 bg-transparent outline-none"
            aria-label="グループ名"
          />
        ) : (
          group.label
        )}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(group.id);
          }}
          className="ml-1 opacity-0 transition-opacity group-hover/frame:opacity-70 hover:!opacity-100 focus:opacity-100"
          aria-label={`グループ「${group.label}」を削除`}
          title="グループを削除"
        >
          <IC.X />
        </button>
      </div>

      {HANDLES.map((handle) => (
        <div
          key={handle.id}
          className="absolute z-10 h-2.5 w-2.5 rounded-sm border-2 border-white bg-white"
          style={{
            ...handle.style,
            cursor: handle.cursor,
            borderColor: group.borderColor,
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, group.id, handle.id);
          }}
        />
      ))}
    </div>
  );
}
