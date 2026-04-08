export const metadata = {
  title: "Egresados App",
  description: "Aplicación de egresados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}