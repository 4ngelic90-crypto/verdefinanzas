import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const year = new Date().getFullYear();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 w-full max-w-md items-center gap-2.5 px-4">
          <img
            src="/assets/generated/app-icon.dim_512x512.png"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold tracking-tight text-foreground">
              Ledger Verde
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              Control de gastos personales
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-md px-4 pb-24 pt-2 text-center">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          © {year}. Built with love using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
