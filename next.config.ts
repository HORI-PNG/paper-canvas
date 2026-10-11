import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 基本的なセキュリティヘッダーを全ページに付ける
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 他サイトの iframe に埋め込まれるのを防ぐ（クリックジャッキング対策）
          { key: "X-Frame-Options", value: "DENY" },
          // ファイルの種類をブラウザに推測させない
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 外部サイトへ移動するとき、URL のパスやクエリを渡さない
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
