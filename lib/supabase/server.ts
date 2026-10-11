import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

/**
 * サーバー（Server Component / Route Handler / Server Function）用の Supabase クライアント。
 *
 * ログイン情報は Cookie に入っているので、Next.js の cookies() 経由で読み書きする。
 * ブラウザ用と同じく publishable key + ログインユーザーの権限で動く（RLS が効く）。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component からは Cookie を書き込めない。
          // セッションの更新は proxy.ts が毎リクエスト行うので、ここでは無視してよい。
        }
      },
    },
  });
}
