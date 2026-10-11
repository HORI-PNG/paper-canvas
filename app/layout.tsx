import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";

// next/font はフォントをビルド時にダウンロードして自サイトから配信する。
// 外部の Google Fonts に毎回取りに行く @import より速く、レイアウトのズレも起きにくい。
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "PaperCanvas - 論文管理アプリ",
    template: "%s | PaperCanvas",
  },
  description:
    "arXiv の論文をキャンバスに並べ、AI の日本語要約で素早く把握できる論文管理アプリ",
  openGraph: {
    title: "PaperCanvas",
    description:
      "arXiv の論文をキャンバスに並べ、AI の日本語要約で素早く把握できる論文管理アプリ",
    type: "website",
    locale: "ja_JP",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#98fb98" },
    { media: "(prefers-color-scheme: dark)", color: "#1a3d2b" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // テーマは Cookie に保存している。サーバーで <html class="dark"> を付けて返すので、
  // 読み込み直後に一瞬ライトモードが見える「ちらつき」が起きない。
  const theme = (await cookies()).get("theme")?.value;

  return (
    <html
      lang="ja"
      className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <body>{children}</body>
    </html>
  );
}
