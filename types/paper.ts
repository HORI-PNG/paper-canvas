export type CardColor =
  | "sky"
  | "indigo"
  | "emerald"
  | "violet"
  | "rose"
  | "amber";
export type MemoColor = "yellow" | "pink" | "blue" | "green" | "purple";
export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const CARD_COLORS: CardColor[] = [
  "sky",
  "indigo",
  "emerald",
  "violet",
  "rose",
  "amber",
];

export const MEMO_COLORS: MemoColor[] = [
  "yellow",
  "pink",
  "blue",
  "green",
  "purple",
];

/** キャンバス上の論文カード（arxiv_papers と user_papers を合体したもの） */
export interface Paper {
  /** user_papers.id（キャンバス上のカードのID） */
  id: string;
  arxivId: string;
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
  note: string;
  pdfPath: string | null;
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
