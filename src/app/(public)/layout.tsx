// src/app/(public)/layout.tsx
// Este layout envolve as páginas públicas como /login, /signup, /checkout, etc.
// Ele não contém nenhuma lógica de autenticação.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

    