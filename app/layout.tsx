import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المِجهر - بحث وتحليل للشخصيات",
  description: "تطبيق متقدم للبحث والتحليل لإعداد المقابلات الشخصية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
