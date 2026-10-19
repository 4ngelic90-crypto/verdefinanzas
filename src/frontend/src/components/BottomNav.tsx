import { cn } from "@/lib/utils";
import { BarChart3, Home, ReceiptText } from "lucide-react";

export type TabKey = "inicio" | "movimientos" | "estadisticas";

interface TabDef {
  key: TabKey;
  label: string;
  icon: typeof Home;
}

const TABS: TabDef[] = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "movimientos", label: "Movimientos", icon: ReceiptText },
  { key: "estadisticas", label: "Estadísticas", icon: BarChart3 },
];

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      data-ocid="nav.bottom"
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="safe-bottom mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              data-ocid={`nav.${tab.key}.tab`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange(tab.key)}
              className={cn(
                "group relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity",
                  isActive ? "opacity-100" : "opacity-0",
                )}
                aria-hidden="true"
              />
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive ? "scale-105" : "group-hover:scale-105",
                )}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
