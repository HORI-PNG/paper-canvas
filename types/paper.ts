export type CardColor =
  | "sky"
  | "indigo"
  | "emerald"
  | "violet"
  | "rose"
  | "amber";
export type MemoColor = "yellow" | "pink" | "blue" | "green" | "purple";
export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  bullets: string[];
  abstract: string;
  tags: string[];
  url: string;
  createdDate: string;
  x: number;
  y: number;
  color: CardColor;
}

export interface Memo {
  id: string;
  text: string;
  x: number;
  y: number;
  color: MemoColor;
  createdDate: string;
}

export interface Group {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  borderColor: string;
}
