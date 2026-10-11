"use client";

// error.tsx はページの描画中に例外が起きたときに表示される（Client Component である必要がある）
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="auth-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <h1 className="text-[17px] font-semibold text-[var(--foreground)]">
          エラーが発生しました
        </h1>
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--muted-foreground)]">
          一時的な問題の可能性があります。再読み込みしてもう一度お試しください。
          {error.digest && (
            <span className="mt-1 block" style={{ fontFamily: "var(--font-mono)" }}>
              エラーID: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={() => retry()}
          className="mt-4 w-full rounded-lg bg-[#166534] py-2.5 text-[13px] font-semibold text-white"
        >
          再試行
        </button>
      </div>
    </main>
  );
}
