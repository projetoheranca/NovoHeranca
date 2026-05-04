// This layout is intentionally left blank.
// It will be inherited by child pages that don't have their own layout.
// For instance, /admin/login will use this and the root layout.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
