import "./globals.css";

/* Root layout without <html>/<body> so that:
   - (payload) route group uses Payload's own RootLayout with its own <html>/<body>
   - [locale] route group renders <html>/<body> in its own layout
   This prevents nested <html> tags. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
