import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coding Race",
  description: "Real-time Python coding race platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }} className="title-gradient">Coding Race</h1>
          </header>
          <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {children}
          </main>
          <footer style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
            Powered by Next.js & Firebase
          </footer>
        </div>
      </body>
    </html>
  );
}
