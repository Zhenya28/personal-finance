import { cn } from "@/lib/utils";

type PageHeroStat = {
  label: string;
  value: string;
  meta?: string;
};

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
  stats?: PageHeroStat[];
  className?: string;
}

export function PageHero({
  badge,
  title,
  subtitle,
  icon,
  rightSlot,
  stats,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("ag-subtle-panel overflow-hidden p-4 sm:p-5", className)}>
      <div className="ag-inline-row flex-wrap gap-3">
        <div className="min-w-0">
          {badge && <p className="ag-overline mb-2">{badge}</p>}
          <div className="flex items-center gap-3 min-w-0">
            <span className="ag-item-ico h-10 w-10 rounded-xl text-white/80">{icon}</span>
            <h2 className="truncate text-2xl font-semibold tracking-[-0.02em] text-white">{title}</h2>
          </div>
        </div>

        {rightSlot && <div className="ml-auto flex items-center gap-2 flex-wrap">{rightSlot}</div>}
      </div>

      <p className="mt-3 max-w-3xl text-sm text-white/65">{subtitle}</p>

      {stats && stats.length > 0 && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={`${stat.label}-${stat.value}`}
              className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5"
            >
              <p className="ag-overline">{stat.label}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-white">{stat.value}</p>
              {stat.meta && <p className="mt-0.5 text-[11px] text-white/55">{stat.meta}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
