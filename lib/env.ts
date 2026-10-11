/**
 * 環境変数の読み出しを一か所にまとめる。
 * 未設定のまま起動すると原因の分かりにくいエラーになるので、ここで分かりやすく落とす。
 *
 * 注意: NEXT_PUBLIC_ で始まる変数はビルド時にブラウザ用コードへ埋め込まれる。
 * Next.js は `process.env.NEXT_PUBLIC_XXX` という「そのままの書き方」しか置換しないため、
 * process.env[name] のような動的アクセスにはできない。
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`環境変数 ${name} が設定されていません（.env.example を参照）`);
  }
  return value;
}

export function supabaseUrl() {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabasePublishableKey() {
  return required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
