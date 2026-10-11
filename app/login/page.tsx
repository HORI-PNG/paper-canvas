import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <LoginForm
        initialError={
          error === "link"
            ? "リンクが無効か期限切れです。もう一度お試しください。"
            : null
        }
      />
    </AuthShell>
  );
}
