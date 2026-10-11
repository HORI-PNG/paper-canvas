import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

/**
 * ブラウザ用の Supabase クライアント。
 *
 * publishable key（公開してよい鍵）で接続し、ログイン中ユーザーとして振る舞う。
 * 何が読み書きできるかは DB の RLS ポリシーが決めるので、
 * ここから他人のデータに触れることはできない。
 */
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  client ??= createBrowserClient(supabaseUrl(), supabasePublishableKey());
  return client;
}
