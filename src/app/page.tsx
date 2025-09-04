"use client";

import { CipherComponent } from "@/components/cipher-component";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useTheme } from "@/components/theme-provider";
import GradientBlinds from "@/components/bits/GradientBlinds";

function ThemeSwitcherWrapper() {
  const { theme, setTheme } = useTheme();
  return <ThemeSwitcher value={theme} onChange={setTheme} />;
}

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Gradient Blinds Background */}
      <div className="fixed inset-0 z-0">
        <GradientBlinds
          className="w-full h-full"
          gradientColors={["#FF9FFC", "#5227FF", "#00D4FF", "#FF6B6B"]}
          blindCount={20}
          angle={15}
          noise={0.2}
          mouseDampening={0.1}
          spotlightRadius={0.3}
          spotlightOpacity={0.5}
          mixBlendMode="soft-light"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-background/80 backdrop-blur-sm">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-sm bg-primary"></div>
              <span className="font-bold">AE Cipher</span>
            </div>
            <ThemeSwitcherWrapper />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <CipherComponent />
        </main>

        {/* Footer */}
        <footer className="border-t py-6 md:py-0 bg-background/50">
          <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 md:h-14 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
              Built with Next.js, Tailwind CSS, and Python FastAPI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
