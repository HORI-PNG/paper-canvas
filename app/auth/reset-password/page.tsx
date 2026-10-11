import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "パスワード再設定",
};

export default async function ResetPasswordPage() {
  // メールのリンク経由で /auth/callback を通っていればログイン状態になっている
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=link");

  return (
    <AuthShell>
      <ResetPasswordForm email={user.email ?? ""} />
    </AuthShell>
  );
}
