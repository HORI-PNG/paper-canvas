import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ArxivNotFoundError,
  fetchArxivMetadata,
  parseArxivId,
} from "@/lib/arxiv";
import { summarizePaper } from "@/lib/gemini";
import { toPaper, USER_PAPER_SELECT, type UserPaperRow } from "@/lib/mappers";
import { CARD_COLORS } from "@/types/paper";

// Gemini の再試行を含めると数十秒かかることがあるので、関数の実行上限を延ばす（Vercel 用）
export const maxDuration = 60;

/** 1ユーザーが24時間に Gemini 解析できる回数（キャッシュ済みの論文は数えない） */
const DAILY_LIMIT = Number(process.env.ANALYSIS_DAILY_LIMIT) || 30;

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * POST /api/papers
 * body: { url: string, x?: number, y?: number }
 *
 * arXiv の URL を受け取り、論文をユーザーのキャンバスに追加する。
 *   1. ログイン確認
 *   2. URL から arXiv ID を取り出す
 *   3. 共有キャッシュ (arxiv_papers) に無ければ arXiv + Gemini で解析して保存
 *   4. user_papers に追加して返す
 */
export async function POST(request: Request) {
  // ---- 1. ログイン確認 -------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorResponse("ログインが必要です", 401);

  // ---- 2. 入力の検証 ---------------------------------------------------
  // request.json() は不正な JSON だと例外を投げるので catch して 400 にする
  const body = await request.json().catch(() => null);
  const input = typeof body?.url === "string" ? body.url : "";
  const arxivId = parseArxivId(input);
  if (!arxivId) {
    return errorResponse(
      "arXiv の URL または ID を入力してください（例: https://arxiv.org/abs/1706.03762）",
      400,
    );
  }
  const x = Number.isFinite(body?.x) ? body.x : 100;
  const y = Number.isFinite(body?.y) ? body.y : 100;

  // すでに自分のキャンバスにあるなら、それを返す（クライアントはそのカードを選択する）
  const { data: existing } = await supabase
    .from("user_papers")
    .select(USER_PAPER_SELECT)
    .eq("arxiv_id", arxivId)
    .maybeSingle<UserPaperRow>();
  if (existing) {
    return Response.json(
      { error: "この論文はすでにキャンバスにあります", paper: toPaper(existing) },
      { status: 409 },
    );
  }

  // ---- 3. 共有キャッシュを確認、無ければ解析 ---------------------------
  const admin = createAdminClient();
  const { data: cached } = await supabase
    .from("arxiv_papers")
    .select("id")
    .eq("id", arxivId)
    .maybeSingle();

  if (!cached) {
    // レート制限: 直近24時間の解析回数を数える
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("analysis_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) {
      return errorResponse(
        `AI解析は1日${DAILY_LIMIT}件までです。時間をおいて再度お試しください`,
        429,
      );
    }

    let metadata;
    try {
      metadata = await fetchArxivMetadata(arxivId);
    } catch (error) {
      if (error instanceof ArxivNotFoundError) {
        return errorResponse(`arXiv に論文 ${arxivId} が見つかりません`, 404);
      }
      console.error("arXiv API error:", error);
      return errorResponse(
        "arXiv に接続できませんでした。しばらくしてから再度お試しください",
        502,
      );
    }

    let summary;
    try {
      summary = await summarizePaper(metadata.title, metadata.abstract);
    } catch (error) {
      console.error("Gemini API error:", error);
      return errorResponse(
        "AIによる論文解析に失敗しました。しばらくしてから再度お試しください",
        503,
      );
    }

    await admin.from("analysis_events").insert({ user_id: user.id });

    // 同時に別のユーザーが同じ論文を解析していた場合に備えて upsert（重複は無視）
    const { error: cacheError } = await admin.from("arxiv_papers").upsert(
      {
        id: metadata.id,
        title: metadata.title,
        authors: metadata.authors,
        year: metadata.year,
        abstract: metadata.abstract,
        bullets: summary.bullets,
        tags: summary.tags,
        url: metadata.url,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (cacheError) {
      console.error("arxiv_papers upsert error:", cacheError);
      return errorResponse("論文の保存に失敗しました", 500);
    }
  }

  // ---- 4. ユーザーのキャンバスに追加 -----------------------------------
  // ここはログインユーザーの権限 (RLS) で insert する。user_id は DB の default で自動設定。
  const color = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
  const { data: inserted, error: insertError } = await supabase
    .from("user_papers")
    .insert({ arxiv_id: arxivId, x, y, color })
    .select(USER_PAPER_SELECT)
    .single<UserPaperRow>();

  if (insertError || !inserted) {
    console.error("user_papers insert error:", insertError);
    return errorResponse("論文の保存に失敗しました", 500);
  }

  return Response.json({ paper: toPaper(inserted) }, { status: 201 });
}
