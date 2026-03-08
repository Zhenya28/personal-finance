function SkeletonBlock({
  className,
}: {
  className?: string;
}) {
  return <div className={`skeleton-shimmer rounded-2xl ${className || ""}`} />;
}

export default function AppLoading() {
  return (
    <div className="relative mx-auto w-full max-w-[1120px] space-y-6">
      <section className="rounded-[25px] border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-7 w-36 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="h-3 w-64 max-w-[72vw]" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:w-[440px]">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SkeletonBlock className="h-[320px]" />
        <SkeletonBlock className="h-[320px]" />
      </section>
    </div>
  );
}
