import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<
  LogoSize,
  { mark: string; title: string; subtitle: string; gap: string }
> = {
  sm: {
    mark: "h-8 w-8 rounded-[10px]",
    title: "text-base",
    subtitle: "text-[9px]",
    gap: "gap-2.5",
  },
  md: {
    mark: "h-10 w-10 rounded-[12px]",
    title: "text-xl",
    subtitle: "text-[10px]",
    gap: "gap-3",
  },
  lg: {
    mark: "h-14 w-14 rounded-2xl",
    title: "text-2xl",
    subtitle: "text-[11px]",
    gap: "gap-3.5",
  },
};

export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: LogoSize;
}) {
  const scaleClass =
    size === "sm"
      ? "h-[18px] w-[18px]"
      : size === "lg"
      ? "h-7 w-7"
      : "h-[22px] w-[22px]";

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center bg-[linear-gradient(145deg,#6C63FF_0%,#1ED6E7_100%)] shadow-[0_8px_22px_rgba(35,114,255,0.35)]",
        sizeMap[size].mark,
        className
      )}
    >
      <span className="absolute inset-[1.5px] rounded-[inherit] bg-[#0B1328]/88" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn("relative z-10", scaleClass)}
        aria-hidden
      >
        <path d="M4 17.5h2.5V11H4v6.5Z" fill="#20D7E8" />
        <path d="M10 17.5h2.5V7.8H10v9.7Z" fill="#20D7E8" />
        <path d="M16 17.5h2.5V4.8H16v12.7Z" fill="#20D7E8" />
        <path
          d="M4.8 14.2c1.4-1.4 2.6-2.1 4-2.1 1.2 0 2.2.4 3.1 1.1 1-.9 2-1.4 3.3-1.5 1.6-.1 2.9.5 4.1 1.7"
          stroke="#EAF0FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="18.7" cy="13.2" r="1.6" fill="#EAF0FF" />
      </svg>
    </span>
  );
}

export function BrandLogo({
  className,
  size = "md",
  withSubtitle = true,
  subtitle = "PERSONAL FINANCE",
}: {
  className?: string;
  size?: LogoSize;
  withSubtitle?: boolean;
  subtitle?: string;
}) {
  const sizeStyles = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center", sizeStyles.gap, className)}>
      <BrandMark size={size} />
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold tracking-[-0.02em] leading-none text-white",
            sizeStyles.title
          )}
        >
          My
          <span className="bg-[linear-gradient(90deg,#EBF1FF_0%,#8FB4FF_42%,#45D3E8_100%)] bg-clip-text text-transparent">
            Finance
          </span>
        </p>
        {withSubtitle ? (
          <p
            className={cn(
              "mt-1 uppercase tracking-[0.18em] text-white/33 leading-none",
              sizeStyles.subtitle
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
