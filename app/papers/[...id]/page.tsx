import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ArxivPaperRow } from "@/lib/mappers";

/*
 * 共有ページ: /papers/1706.03762 や /papers/cs/0601001
 *
 * 旧形式の arXiv ID には "/" が含まれるので、[...id]（キャッチオール）で受けて結合する。
 * arxiv_papers は誰でも読めるテーブルなので、ログインしていない人にも表示できる。
 * 個人メモなど user_papers の情報は一切出さない。
 */
type Props = { params: Promise<{ id: string[] }> };

// generateMetadata と Page の両方から呼ばれるので、cache() で DB アクセスを1回にまとめる
const getPaper = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("arxiv_papers")
    .select("id, title, authors, year, abstract, bullets, tags, url")
    .eq("id", id)
    .maybeSingle<ArxivPaperRow>();
  return data;
});

async function resolveId(params: Props["params"]) {
  const { id } = await params;
  return id.map(decodeURIComponent).join("/");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paper = await getPaper(await resolveId(params));
  if (!paper) return { title: "論文が見つかりません" };

  const description = paper.bullets.join(" ");
  return {
    title: paper.title,
    description,
    openGraph: { title: paper.title, description, type: "article" },
  };
}

export default async function SharedPaperPage({ params }: Props) {
  const paper = await getPaper(await resolveId(params));
  if (!paper) notFound();

  return (
    <main className="auth-bg min-h-screen px-4 py-10">
      <article className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:p-8">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span
            className="rounded-full bg-[#166534] px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {paper.year}
          </span>
          {paper.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1
          className="text-[22px] leading-snug font-semibold text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {paper.title}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--muted-foreground)]">
          {paper.authors.join(", ")}
        </p>

        <section className="mt-6 rounded-xl bg-[var(--muted)] p-4">
          <h2 className="mb-2 text-[11px] font-semibold tracking-widest text-[var(--muted-foreground)] uppercase">
            AIサマリー
          </h2>
          <ul className="space-y-2">
            {paper.bullets.map((bullet, index) => (
              <li key={index} className="flex gap-2 text-[14px] leading-relaxed text-[var(--foreground)]">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16a34a]" />
                {bullet}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">
            ※ AI による自動要約です。正確な内容は原文をご確認ください。
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-semibold tracking-widest text-[var(--muted-foreground)] uppercase">
            Abstract
          </h2>
          <p className="text-[13px] leading-relaxed text-[var(--foreground)] opacity-80">
            {paper.abstract}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] hover:border-[#16a34a]"
          >
            arXiv で読む
          </a>
          <Link
            href="/"
            className="rounded-lg bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
          >
            PaperCanvas で論文を整理する
          </Link>
        </div>
      </article>
    </main>
  );
}
