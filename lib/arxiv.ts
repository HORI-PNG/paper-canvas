import { XMLParser } from "fast-xml-parser";

/*
 * arXiv の ID には2つの形式がある。
 *   新形式 (2007年4月〜): 1706.03762, 2401.00001  … "YYMM.番号(4〜5桁)"
 *   旧形式:              cs/0601001, hep-th/9901001, math.GT/0309136
 * どちらにも末尾にバージョン (v2 など) が付くことがある。
 * 要約はバージョン間でほぼ同じなので、キャッシュのキーにはバージョンを外した ID を使う。
 */
const NEW_STYLE = /(\d{4}\.\d{4,5})(?:v\d+)?/;
const OLD_STYLE = /([a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?/;

/**
 * URL や文字列から arXiv ID を取り出す。見つからなければ null。
 *
 * 対応例:
 *   https://arxiv.org/abs/1706.03762v7
 *   https://arxiv.org/pdf/1706.03762.pdf
 *   arXiv:1706.03762
 *   1706.03762
 *   https://arxiv.org/abs/cs/0601001
 */
export function parseArxivId(input: string): string | null {
  const text = input.trim();
  if (!text) return null;

  // URL ならホストが arXiv 系であることを確認する（他サイトの数字を拾わないように）
  if (/^https?:\/\//i.test(text)) {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      return null;
    }
    if (!/(^|\.)arxiv\.org$/i.test(url.hostname)) return null;
    return matchId(url.pathname.replace(/^\/(abs|pdf|html|format)\//, ""));
  }

  return matchId(text.replace(/^arxiv:\s*/i, ""));
}

function matchId(text: string): string | null {
  // 先頭から完全一致させる（"abc1706.03762xyz" のような文字列は弾く）
  const newMatch = text.match(new RegExp(`^${NEW_STYLE.source}(?:\\.pdf)?/?$`));
  if (newMatch) return newMatch[1];
  const oldMatch = text.match(new RegExp(`^${OLD_STYLE.source}(?:\\.pdf)?/?$`));
  if (oldMatch) return oldMatch[1];
  return null;
}

export interface ArxivMetadata {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  url: string;
}

export class ArxivNotFoundError extends Error {}

/** arXiv の XML 内の改行・連続スペースを1つのスペースにまとめる */
function clean(text: unknown): string {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

/** fast-xml-parser は要素が1つだと配列ではなくオブジェクトを返すので、常に配列にそろえる */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** arXiv API の Atom XML をパースして論文情報を取り出す（テストしやすいよう fetch と分離） */
export function parseArxivResponse(xmlText: string, id: string): ArxivMetadata {
  // parseTagValue: false にしないと "2017" のようなタイトルが数値になってしまう
  const parser = new XMLParser({ parseTagValue: false });
  const xml = parser.parse(xmlText);
  const entry = toArray(xml?.feed?.entry)[0];

  // 存在しない ID のとき、arXiv はエントリ無し、または title が "Error" のエントリを返す
  if (!entry || clean(entry.title) === "Error" || !entry.published) {
    throw new ArxivNotFoundError(`arXiv に ${id} が見つかりません`);
  }

  const authors = toArray<{ name: string }>(entry.author).map((a) =>
    clean(a.name),
  );

  return {
    id,
    title: clean(entry.title),
    authors,
    year: Number(String(entry.published).slice(0, 4)),
    abstract: clean(entry.summary),
    url: `https://arxiv.org/abs/${id}`,
  };
}

export async function fetchArxivMetadata(id: string): Promise<ArxivMetadata> {
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
  const response = await fetch(apiUrl, {
    // arXiv が応答しないとき、いつまでも待たないようにタイムアウトを設定
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": "PaperCanvas (https://github.com/HORI-PNG)" },
  });

  if (!response.ok) {
    throw new Error(`arXiv API エラー: HTTP ${response.status}`);
  }

  return parseArxivResponse(await response.text(), id);
}
