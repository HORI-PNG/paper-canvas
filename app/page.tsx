import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { CanvasApp } from "@/components/CanvasApp";
import { NotificationsProvider } from "@/components/Notifications";
import { createClient } from "@/lib/supabase/server";
import {
  toGroup,
  toMemo,
  toPaper,
  USER_PAPER_SELECT,
  type GroupRow,
  type MemoRow,
  type UserPaperRow,
} from "@/lib/mappers";

/**
 * トップページ（Server Component）。
 *
 * サーバー側でログイン確認とデータ読み込みを済ませてから HTML を返すので、
 * 画面を開いた瞬間にキャンバスの中身が表示される（読み込み中のチラつきが無い）。
 * 実際の操作はクライアントコンポーネントの <CanvasApp> が担当する。
 */
export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 3つのクエリは互いに依存しないので Promise.all で並列に投げる
  const [papersResult, memosResult, groupsResult] = await Promise.all([
    supabase
      .from("user_papers")
      .select(USER_PAPER_SELECT)
      .order("created_at")
      .overrideTypes<UserPaperRow[], { merge: false }>(),
    supabase.from("memos").select("*").order("created_at").overrideTypes<MemoRow[], { merge: false }>(),
    supabase
      .from("groups")
      .select("*")
      .order("created_at")
      .overrideTypes<GroupRow[], { merge: false }>(),
  ]);

  const error = papersResult.error ?? memosResult.error ?? groupsResult.error;
  if (error) throw new Error(`データの読み込みに失敗しました: ${error.message}`);

  const theme = (await cookies()).get("theme")?.value;

  return (
    <NotificationsProvider>
      <CanvasApp
        user={{
          id: user.id,
          email: user.email ?? "",
          createdAt: user.created_at,
        }}
        initialDark={theme === "dark"}
        initialPapers={(papersResult.data ?? []).map(toPaper)}
        initialMemos={(memosResult.data ?? []).map(toMemo)}
        initialGroups={(groupsResult.data ?? []).map(toGroup)}
      />
    </NotificationsProvider>
  );
}
