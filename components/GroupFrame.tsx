"use client";

import React from "react";
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
  onMouseDown,
  onResizeStart,
}: GroupFrameProps) {
  return (
    <div
      className="absolute rounded-[14px] border-2 border-dashed"
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
        background: `${group.bgColor}BB`,
        borderColor: group.borderColor,
        cursor: "move",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e, group.id);
      }}
    >
      <div
        className="absolute -top-7 left-4 select-none rounded-md px-2.5 py-1 text-[11px] font-semibold"
        style={{
          fontFamily: "var(--font-display)",
          color: group.borderColor,
          background: group.bgColor,
          border: `1px solid ${group.borderColor}55`,
        }}
      >
        {group.label}
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
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, group.id, handle.id);
          }}
        />
      ))}
    </div>
  );
}
