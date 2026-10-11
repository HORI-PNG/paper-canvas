import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * 管理者権限の Supabase クライアント（RLS を無視できる）。
 *
 * - arxiv_papers（共有キャッシュ）への書き込み
 * - analysis_events（レート制限）の記録
 * - アカウント削除
 * のように「ユーザー本人には許可していない操作」だけに使う。
 *
 * "server-only" を import しているので、誤ってクライアントコンポーネントから
 * import するとビルドエラーになる（secret key の流出防止）。
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("環境変数 SUPABASE_SECRET_KEY が設定されていません");
  }

  return createClient(supabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
