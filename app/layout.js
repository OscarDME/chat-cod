import "./globals.css";

export const metadata = {
  title: "Flujos · Chat",
  description: "Dashboard de flujos + chat de venta con Ana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
