import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

export default function NotFound() {
  return (
    <AuthShell>
      <h1 className="text-[17px] font-semibold text-[var(--foreground)]">
        ページが見つかりません
      </h1>
      <p className="mt-2 text-[12px] text-[var(--muted-foreground)]">
        URL が間違っているか、ページが削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-4 block rounded-lg bg-[#166534] py-2.5 text-center text-[13px] font-semibold text-white"
      >
        トップへ戻る
      </Link>
    </AuthShell>
  );
}
