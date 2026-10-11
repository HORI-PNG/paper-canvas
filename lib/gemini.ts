import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

export interface PaperSummary {
  bullets: string[];
  tags: string[];
}

// モデル名は環境変数で差し替えられるようにする（モデルの世代交代が早いため）
const MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const MAX_ATTEMPTS = 3;

/**
 * Gemini に論文のタイトルと概要を渡し、日本語の要点3つとタグを返してもらう。
 *
 * responseSchema で「この形の JSON で返して」と指定する（構造化出力）。
 * 自由文で返させてパースするより、ずっと壊れにくい。
 * 参考: https://ai.google.dev/gemini-api/docs/structured-output
 */
export async function summarizePaper(
  title: string,
  abstract: string,
): Promise<PaperSummary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("環境変数 GEMINI_API_KEY が設定されていません");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `あなたは研究者向けに論文を要約するアシスタントです。
次の論文を分析し、日本語で出力してください。

- bullets: 論文の重要なポイントを3つ。各1文、60文字程度。
  1つ目は「何を提案したか」、2つ目は「どんな結果が出たか」、3つ目は「なぜ重要か」。
- tags: 分野や手法を表す短いタグを3〜5個（英語の固有名詞はそのままでよい。#は付けない）。

タイトル: ${title}

概要:
${abstract}`;

  // 一時的なエラー（混雑・ネットワーク）に備えて、最大3回まで再試行する。
  // 待ち時間を 1秒 → 2秒 と倍々に伸ばすのは「指数バックオフ」と呼ばれる定番の手法で、
  // 混雑しているサーバーに連打して状況を悪化させないための工夫。
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["bullets", "tags"],
          },
        },
      });

      if (!response.text) throw new Error("Gemini からの応答が空です");

      const data = JSON.parse(response.text) as Partial<PaperSummary>;
      return {
        bullets: sanitize(data.bullets, 5),
        tags: sanitize(data.tags, 6).map((tag) => tag.replace(/^#/, "")),
      };
    } catch (error) {
      lastError = error;
      console.warn(`Gemini 呼び出し失敗 (${attempt + 1}/${MAX_ATTEMPTS})`, error);

      if (attempt < MAX_ATTEMPTS - 1) {
        const waitMs = 1000 * 2 ** attempt;
        // setTimeout をPromiseで包むと、await で「指定ミリ秒待つ」が書ける
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError;
}

/** AI の出力は信用しすぎない: 文字列以外を除き、空白を整え、個数を制限する */
function sanitize(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}
