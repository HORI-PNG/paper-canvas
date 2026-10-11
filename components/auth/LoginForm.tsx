"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Message, SubmitButton } from "./fields";

type Mode = "login" | "signup" | "forgot";

const TITLES: Record<Mode, string> = {
  login: "ログイン",
  signup: "アカウント作成",
  forgot: "パスワードを忘れた場合",
};

/** Supabase のエラーメッセージ（英語）を日本語に置き換える */
function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "メールアドレスまたはパスワードが正しくありません。";
  if (/email not confirmed/i.test(message))
    return "メールアドレスの確認が済んでいません。届いた確認メールのリンクを開いてください。";
  if (/already registered/i.test(message))
    return "このメールアドレスはすでに登録されています。";
  if (/password should be at least/i.test(message))
    return "パスワードは8文字以上にしてください。";
  if (/rate limit/i.test(message))
    return "短時間に操作が集中しました。しばらく待ってから再度お試しください。";
  return message;
}

export function LoginForm({ initialError }: { initialError: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    // メール内のリンクの戻り先。デプロイ先のドメインに自動で合う。
    const callback = (next: string) =>
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // refresh() でサーバー側にもログイン済み Cookie を反映させる
        router.replace("/");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        if (password.length < 8) {
          setError("パスワードは8文字以上にしてください。");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callback("/") },
        });
        if (error) throw error;
        // メール確認を無効にしている Supabase プロジェクトでは、その場でログイン済みになる
        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }
        setInfo(
          `${email} に確認メールを送信しました。メール内のリンクを開くと登録が完了します。`,
        );
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callback("/auth/reset-password"),
      });
      if (error) throw error;
      setInfo(
        `${email} にパスワード再設定用のメールを送信しました（登録済みの場合のみ届きます）。`,
      );
    } catch (err) {
      setError(
        translateAuthError(err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1
        className="text-[17px] font-semibold text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {TITLES[mode]}
      </h1>

      {error && <Message kind="error">{error}</Message>}
      {info && <Message kind="info">{info}</Message>}

      <Field
        label="メールアドレス"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      {mode !== "forgot" && (
        <Field
          label="パスワード"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "8文字以上" : ""}
        />
      )}

      <SubmitButton loading={loading}>
        {mode === "login"
          ? "ログイン"
          : mode === "signup"
            ? "登録する"
            : "再設定メールを送る"}
      </SubmitButton>

      <div className="flex flex-col items-center gap-1.5 pt-1 text-[12px]">
        {mode === "login" ? (
          <>
            <LinkButton onClick={() => switchMode("signup")}>
              アカウントをお持ちでない方は<strong>新規登録</strong>
            </LinkButton>
            <LinkButton onClick={() => switchMode("forgot")}>
              パスワードを忘れた場合
            </LinkButton>
          </>
        ) : (
          <LinkButton onClick={() => switchMode("login")}>
            ログイン画面に戻る
          </LinkButton>
        )}
      </div>
    </form>
  );
}

function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[var(--muted-foreground)] transition-colors hover:text-[#166534] dark:hover:text-[#86efac]"
    >
      {children}
    </button>
  );
}
