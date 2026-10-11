import { createClient } from "@/lib/supabase/client";
import type { CardColor, Group, Memo, Paper } from "@/types/paper";

/*
 * ブラウザから Supabase を直接操作する関数群。
 *
 * 「自分のデータしか触れない」ことは DB の RLS が保証しているので、
 * わざわざ API Route を経由しなくても安全に読み書きできる。
 * （AI 解析やアカウント削除のように secret key が必要な処理だけ API Route を使う）
 *
 * どの関数も失敗したら例外を投げる。呼び出し側で catch して通知を出す。
 */

function db() {
  return createClient();
}

function check<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error;
  return result;
}

// ---- 論文 ---------------------------------------------------------------

export async function addPaper(url: string, x: number, y: number) {
  const response = await fetch("/api/papers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, x, y }),
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body } as {
    ok: boolean;
    status: number;
    body: { paper?: Paper; error?: string };
  };
}

export async function updatePaper(
  id: string,
  patch: Partial<Pick<Paper, "x" | "y" | "color" | "note" | "pdfPath">>,
) {
  const row: Record<string, unknown> = {};
  if (patch.x !== undefined) row.x = patch.x;
  if (patch.y !== undefined) row.y = patch.y;
  if (patch.color !== undefined) row.color = patch.color satisfies CardColor;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.pdfPath !== undefined) row.pdf_path = patch.pdfPath;
  check(await db().from("user_papers").update(row).eq("id", id));
}

export async function deletePaper(paper: Paper) {
  if (paper.pdfPath) {
    await db().storage.from("pdfs").remove([paper.pdfPath]);
  }
  check(await db().from("user_papers").delete().eq("id", paper.id));
}

// ---- メモ ---------------------------------------------------------------

export async function createMemo(memo: Memo) {
  check(
    await db().from("memos").insert({
      id: memo.id,
      text: memo.text,
      x: memo.x,
      y: memo.y,
      color: memo.color,
    }),
  );
}

export async function updateMemo(
  id: string,
  patch: Partial<Pick<Memo, "x" | "y" | "text" | "color">>,
) {
  check(await db().from("memos").update(patch).eq("id", id));
}

export async function deleteMemo(id: string) {
  check(await db().from("memos").delete().eq("id", id));
}

// ---- グループ -----------------------------------------------------------

export async function createGroup(group: Group) {
  check(
    await db().from("groups").insert({
      id: group.id,
      label: group.label,
      x: group.x,
      y: group.y,
      width: group.width,
      height: group.height,
      bg_color: group.bgColor,
      border_color: group.borderColor,
    }),
  );
}

export async function updateGroup(
  id: string,
  patch: Partial<Pick<Group, "x" | "y" | "width" | "height" | "label">>,
) {
  check(await db().from("groups").update(patch).eq("id", id));
}

export async function deleteGroup(id: string) {
  check(await db().from("groups").delete().eq("id", id));
}

// ---- PDF ----------------------------------------------------------------

export const PDF_MAX_BYTES = 20 * 1024 * 1024;

/** PDF を Storage にアップロードし、保存先パスを返す */
export async function uploadPdf(userId: string, paperId: string, file: File) {
  // パスの先頭を自分のユーザーIDにする（Storage の RLS がこれを確認する）
  const path = `${userId}/${paperId}.pdf`;
  check(
    await db().storage.from("pdfs").upload(path, file, {
      upsert: true,
      contentType: "application/pdf",
    }),
  );
  await updatePaper(paperId, { pdfPath: path });
  return path;
}

export async function removePdf(paperId: string, path: string) {
  check(await db().storage.from("pdfs").remove([path]));
  await updatePaper(paperId, { pdfPath: null });
}

/** 非公開バケットのファイルを見るための、期限付き(1時間)URLを発行する */
export async function getPdfUrl(path: string) {
  const { data } = check(
    await db().storage.from("pdfs").createSignedUrl(path, 60 * 60),
  );
  return data!.signedUrl;
}
