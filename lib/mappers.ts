import type { CardColor, Group, Memo, MemoColor, Paper } from "@/types/paper";

/*
 * DB の行（snake_case）とアプリの型（camelCase）の変換。
 * 変換を一か所にまとめておくと、列名を変えたときの修正箇所が分かりやすい。
 */

export interface ArxivPaperRow {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  bullets: string[];
  tags: string[];
  url: string;
}

export interface UserPaperRow {
  id: string;
  arxiv_id: string;
  x: number;
  y: number;
  color: string;
  note: string;
  pdf_path: string | null;
  created_at: string;
  arxiv_papers: ArxivPaperRow;
}

/** user_papers を arxiv_papers と結合して取得するときの select 句 */
export const USER_PAPER_SELECT =
  "id, arxiv_id, x, y, color, note, pdf_path, created_at, arxiv_papers (id, title, authors, year, abstract, bullets, tags, url)";

export function toPaper(row: UserPaperRow): Paper {
  const info = row.arxiv_papers;
  return {
    id: row.id,
    arxivId: row.arxiv_id,
    title: info.title,
    authors: info.authors,
    year: info.year,
    bullets: info.bullets,
    abstract: info.abstract,
    tags: info.tags,
    url: info.url,
    createdDate: row.created_at.slice(0, 10),
    x: row.x,
    y: row.y,
    color: row.color as CardColor,
    note: row.note,
    pdfPath: row.pdf_path,
  };
}

export interface MemoRow {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  created_at: string;
}

export function toMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    text: row.text,
    x: row.x,
    y: row.y,
    color: row.color as MemoColor,
    createdDate: row.created_at.slice(0, 10),
  };
}

export interface GroupRow {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bg_color: string;
  border_color: string;
}

export function toGroup(row: GroupRow): Group {
  return {
    id: row.id,
    label: row.label,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    bgColor: row.bg_color,
    borderColor: row.border_color,
  };
}
