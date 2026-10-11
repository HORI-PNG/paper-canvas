import Link from "next/link";

/** ログイン系ページ共通の外枠 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-[20px] font-semibold tracking-tight text-[#14532d] dark:text-[#bbf7d0]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#166534] text-[15px] text-white">
          P
        </span>
        PaperCanvas
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        {children}
      </div>

      <p className="mt-6 max-w-sm text-center text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        arXiv の論文をキャンバスに並べ、AI の要約で素早く把握できる論文管理ツール
        <br />
        <Link href="/privacy" className="underline hover:text-[var(--foreground)]">
          プライバシーポリシー
        </Link>
      </p>
    </main>
  );
}
