import Calculator from "@/components/calculator";

export default function AppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Calculator />
      </div>
    </main>
  );
}
