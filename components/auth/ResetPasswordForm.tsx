"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Message, SubmitButton } from "./fields";

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }
    if (password !== confirm) {
      setError("確認用のパスワードが一致しません。");
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1
        className="text-[17px] font-semibold text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        新しいパスワードを設定
      </h1>
      <p className="text-[12px] text-[var(--muted-foreground)]">{email}</p>

      {error && <Message kind="error">{error}</Message>}

      <Field
        label="新しいパスワード"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="8文字以上"
      />
      <Field
        label="新しいパスワード（確認）"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <SubmitButton loading={loading}>パスワードを変更</SubmitButton>
    </form>
  );
}
