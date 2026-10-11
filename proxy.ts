import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

/**
 * Proxy（旧 Middleware）。すべてのページリクエストの前に実行される。
 *
 * 役割はひとつ: Supabase のログインセッション（Cookie に入った JWT）の期限が近ければ更新すること。
 * Server Component は Cookie を書き込めないので、更新はここで行う必要がある。
 *
 * 「ログインしていなければ /login へ」という判定は各ページ側でも必ず行う
 * （Proxy はあくまで最初の関門で、認可の唯一の砦にしてはいけない — Next.js 公式の方針）。
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // 更新された Cookie を「この後のページ処理」と「ブラウザへの応答」の両方に反映する
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // getClaims() は JWT の署名を検証し、必要ならトークンを更新する。
  // この呼び出しと createServerClient の間に別の処理を挟まないこと。
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  if (!isLoggedIn && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (isLoggedIn && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // 静的ファイルや画像は除外（認証と無関係なので処理を省く）
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
