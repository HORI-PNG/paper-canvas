import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PaperCanvas - 論文管理アプリ",
  description: "AIサマリー搭載のキャンバス型論文管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
