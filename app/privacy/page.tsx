import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "プライバシーポリシー" };

/*
 * ⚠️ これは雛形です。公開前に、運営者名・連絡先・実際の運用に合わせて必ず見直してください。
 */
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "（連絡先を設定してください）";

export default function PrivacyPage() {
  return (
    <main className="auth-bg min-h-screen px-4 py-10">
      <article className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[13px] leading-relaxed text-[var(--foreground)] shadow-xl sm:p-8">
        <h1 className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          プライバシーポリシー
        </h1>

        <Section title="取得する情報">
          <ul className="list-disc space-y-1 pl-5">
            <li>アカウント登録時のメールアドレス</li>
            <li>キャンバスに追加した論文、メモ、グループ、個人メモ、添付した PDF ファイル</li>
          </ul>
        </Section>

        <Section title="利用目的">
          取得した情報は、本サービスの提供（データの保存・表示）のためにのみ利用します。
          広告目的での利用や、第三者への販売は行いません。
        </Section>

        <Section title="外部サービスへの送信">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              データは Supabase（データベース・認証・ファイル保存）に保存されます。
            </li>
            <li>
              論文の要約生成のため、arXiv から取得した論文のタイトルと概要を Google Gemini API に送信します。
              個人メモや添付 PDF は送信しません。
            </li>
            <li>サービスは Vercel 上で動作しています。</li>
          </ul>
        </Section>

        <Section title="共有リンク">
          「共有リンク」で公開されるのは、論文のタイトル・著者・概要・AI 要約のみです。
          個人メモ、添付 PDF、キャンバスの配置は公開されません。
        </Section>

        <Section title="データの削除">
          設定画面の「アカウント削除」から、アカウントと全データをいつでも削除できます。
        </Section>

        <Section title="お問い合わせ">{CONTACT}</Section>

        <Link href="/" className="inline-block text-[#166534] underline dark:text-[#86efac]">
          トップへ戻る
        </Link>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 text-[14px] font-semibold">{title}</h2>
      <div className="text-[var(--foreground)] opacity-85">{children}</div>
    </section>
  );
}
