import { Navbar } from "@/components/navbar";
import Background from "@/pages/background.tsx";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Background />
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <span className="text-default-600">Created by</span>
        <p className="text-primary">@Luchsig</p>
      </footer>
    </div>
  );
}
