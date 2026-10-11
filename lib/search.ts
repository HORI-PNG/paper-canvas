import type { Memo, Paper } from "@/types/paper";

/**
 * 検索用に文字列をそろえる。
 * NFKC 正規化で「ＡＢＣ」→「ABC」、「ｶﾅ」→「カナ」のような全角/半角の違いを吸収し、
 * さらに小文字にそろえる。これで "BERT" と "bert" と "ＢＥＲＴ" が同じ扱いになる。
 */
export function normalize(text: string): string {
  return text.normalize("NFKC").toLowerCase().trim();
}

/** 検索語をスペース（全角スペースも含む）で区切って配列にする */
export function parseQuery(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

function paperText(paper: Paper): string {
  return normalize(
    [
      paper.title,
      paper.authors.join(" "),
      paper.tags.join(" "),
      paper.bullets.join(" "),
      paper.abstract,
      paper.note,
      paper.arxivId,
      String(paper.year),
    ].join("\n"),
  );
}

/**
 * 論文が条件に合うか。
 *   - terms: すべての語を含む（AND）
 *   - tags:  選ばれたタグをすべて持つ（AND）。比較は normalize したキーで行う
 */
export function matchPaper(paper: Paper, terms: string[], tags: string[]): boolean {
  if (tags.length > 0) {
    const own = new Set(paper.tags.map(normalize));
    if (!tags.every((tag) => own.has(tag))) return false;
  }
  if (terms.length === 0) return true;
  const text = paperText(paper);
  return terms.every((term) => text.includes(term));
}

/** 付箋メモはタグを持たないので、タグで絞り込み中は常に対象外 */
export function matchMemo(memo: Memo, terms: string[], tags: string[]): boolean {
  if (tags.length > 0) return false;
  if (terms.length === 0) return true;
  const text = normalize(memo.text);
  return terms.every((term) => text.includes(term));
}

export interface TagCount {
  /** 比較用のキー（normalize 済み） */
  key: string;
  /** 表示用（最初に出てきた表記） */
  label: string;
  count: number;
}

/**
 * 全論文のタグを集計する。"NLP" と "nlp" のような表記ゆれは1つにまとめる。
 * 件数の多い順、同数なら名前順。
 */
export function collectTags(papers: Paper[]): TagCount[] {
  const map = new Map<string, TagCount>();
  for (const paper of papers) {
    // 1本の論文に同じタグが重複していても1回と数える
    for (const key of new Set(paper.tags.map(normalize))) {
      const label = paper.tags.find((tag) => normalize(tag) === key) ?? key;
      const entry = map.get(key);
      if (entry) entry.count += 1;
      else map.set(key, { key, label, count: 1 });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja"),
  );
}
