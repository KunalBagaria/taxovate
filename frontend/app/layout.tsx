"use client"

import "#/css/main.css";
import { Providers } from "#/app/provider";

type LayoutProps = { children: React.ReactNode; }

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}