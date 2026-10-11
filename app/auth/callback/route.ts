import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 確認メール / パスワード再設定メールのリンクから戻ってくる場所。
 *
 * Supabase のメールリンクは設定によって2種類の形で戻ってくる:
 *   ?code=...                    … PKCE フロー（同じブラウザで開いた場合）
 *   ?token_hash=...&type=...     … メールテンプレートをカスタマイズした場合
 * どちらでもセッションを確立してから `next` のページへ移動する。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // オープンリダイレクト対策: 自サイト内のパス ("/" 始まり、"//" 始まりは不可) だけ許可
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
