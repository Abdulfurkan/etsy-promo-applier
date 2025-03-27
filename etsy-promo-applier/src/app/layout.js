import './globals.css';

export const metadata = {
  title: "Etsy Promo Applier",
  description: "Apply one-time use promo codes securely",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
