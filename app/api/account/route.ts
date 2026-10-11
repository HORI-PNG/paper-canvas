import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * DELETE /api/account
 * ログイン中のユーザー自身のアカウントと、関連データをすべて削除する。
 *
 * DB の行は auth.users を削除すると ON DELETE CASCADE で一緒に消えるが、
 * Storage のファイルは自動では消えないので先に削除する。
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: files } = await admin.storage
    .from("pdfs")
    .list(user.id, { limit: 1000 });
  if (files && files.length > 0) {
    await admin.storage
      .from("pdfs")
      .remove(files.map((file) => `${user.id}/${file.name}`));
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("deleteUser error:", error);
    return Response.json(
      { error: "アカウントの削除に失敗しました" },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();
  return new Response(null, { status: 204 });
}
