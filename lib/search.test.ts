import { describe, expect, it } from "vitest";
import type { Memo, Paper } from "@/types/paper";
import { collectTags, matchMemo, matchPaper, normalize, parseQuery } from "./search";

const paper = (overrides: Partial<Paper> = {}): Paper => ({
  id: "1",
  arxivId: "1706.03762",
  title: "Attention Is All You Need",
  authors: ["Ashish Vaswani", "Noam Shazeer"],
  year: 2017,
  bullets: ["アテンション機構のみの新アーキテクチャを提案"],
  abstract: "The dominant sequence transduction models...",
  tags: ["Transformer", "NLP"],
  url: "https://arxiv.org/abs/1706.03762",
  createdDate: "2026-10-11",
  x: 0,
  y: 0,
  color: "sky",
  note: "ゼミで紹介する",
  pdfPath: null,
  ...overrides,
});

const memo = (text: string): Memo => ({
  id: "m",
  text,
  x: 0,
  y: 0,
  color: "yellow",
  createdDate: "2026-10-11",
});

describe("normalize / parseQuery", () => {
  it("全角・大文字をそろえる", () => {
    expect(normalize("ＢＥＲＴ")).toBe("bert");
    expect(normalize("ﾄﾗﾝｽﾌｫｰﾏｰ")).toBe("トランスフォーマー");
  });

  it("全角スペースでも区切る", () => {
    expect(parseQuery("  attention　Vaswani ")).toEqual(["attention", "vaswani"]);
    expect(parseQuery("   ")).toEqual([]);
  });
});

describe("matchPaper", () => {
  it("条件なしなら一致", () => {
    expect(matchPaper(paper(), [], [])).toBe(true);
  });

  it.each([
    ["attention", "タイトル"],
    ["vaswani", "著者"],
    ["transformer", "タグ"],
    ["アテンション", "AI要約"],
    ["transduction", "アブストラクト"],
    ["ゼミ", "個人メモ"],
    ["1706.03762", "arXiv ID"],
    ["2017", "年"],
  ])("%s で %s に一致", (term) => {
    expect(matchPaper(paper(), [term], [])).toBe(true);
  });

  it("複数語はすべて含むときだけ一致（AND）", () => {
    expect(matchPaper(paper(), ["attention", "vaswani"], [])).toBe(true);
    expect(matchPaper(paper(), ["attention", "bert"], [])).toBe(false);
  });

  it("タグは大文字小文字を区別せず、すべて持つときだけ一致（AND）", () => {
    expect(matchPaper(paper(), [], ["nlp"])).toBe(true);
    expect(matchPaper(paper(), [], ["nlp", "transformer"])).toBe(true);
    expect(matchPaper(paper(), [], ["nlp", "gan"])).toBe(false);
  });

  it("タグと検索語の両方を満たす必要がある", () => {
    expect(matchPaper(paper(), ["attention"], ["nlp"])).toBe(true);
    expect(matchPaper(paper(), ["bert"], ["nlp"])).toBe(false);
  });
});

describe("matchMemo", () => {
  it("本文で検索できる", () => {
    expect(matchMemo(memo("あとで読む"), ["読む"], [])).toBe(true);
    expect(matchMemo(memo("あとで読む"), ["書く"], [])).toBe(false);
  });

  it("タグで絞り込み中は対象外", () => {
    expect(matchMemo(memo("NLP"), [], ["nlp"])).toBe(false);
  });
});

describe("collectTags", () => {
  it("表記ゆれをまとめ、件数順に並べる", () => {
    const tags = collectTags([
      paper({ id: "1", tags: ["NLP", "Transformer"] }),
      paper({ id: "2", tags: ["nlp", "BERT", "BERT"] }),
      paper({ id: "3", tags: ["ＮＬＰ"] }),
    ]);
    expect(tags).toEqual([
      { key: "nlp", label: "NLP", count: 3 },
      { key: "bert", label: "BERT", count: 1 },
      { key: "transformer", label: "Transformer", count: 1 },
    ]);
  });
});
