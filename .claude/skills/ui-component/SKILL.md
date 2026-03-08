---
name: ui-component
description: Build a new UI component following the project's design system. Use when creating cards, widgets, forms, tables, or any visual element for the finance dashboard. Enforces gradient accent bars, icon badges, compact inputs, consistent color language.
argument-hint: "[component-name] [description]"
---

# UI Component Builder — Finance Dashboard Design System

Build components that match the established design system. Every component must feel cohesive with the rest of the dashboard.

## Design System Rules

### Color Language (STRICT)
- **Emerald** (`emerald-500`) — income, positive values, growth
- **Red** (`red-500`) — expenses, negative values, decline
- **Blue** (`blue-500`) — investments, portfolio
- **Amber** (`amber-500`) — savings, goals
- **Violet/Primary** (`primary`) — overview, AI scan, neutral actions
- **Orange** (`orange-500`) — recurring, templates

### Component Patterns

**Card with Gradient Accent Bar:**
```tsx
<Card className="overflow-hidden">
  <div className="h-1 bg-gradient-to-r from-{color}-500 to-{lighter}-400" />
  <CardContent className="pt-5">
    {/* content */}
  </CardContent>
</Card>
```

**Icon Badge (section headers):**
```tsx
<div className="flex items-center justify-center h-8 w-8 rounded-lg bg-{color}-500/10">
  <Icon className="h-4 w-4 text-{color}-500" />
</div>
```

**Page Header (h-9 variant for page-level):**
```tsx
<div className="flex items-center gap-3 mb-1">
  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-{color}-500/10">
    <Icon className="h-5 w-5 text-{color}-500" />
  </div>
  <h2 className="text-2xl font-bold tracking-tight">Title</h2>
</div>
<p className="text-sm text-muted-foreground ml-12">Subtitle</p>
```

**Compact Form Inputs:**
- All inputs: `className="h-9"` (or `h-8` for nested/secondary forms)
- Labels: `className="text-xs"`
- Form grid: `className="grid gap-3 sm:grid-cols-{N} items-end"`
- Button height matches input: `className="h-9"`

**Card-Based List (table replacement):**
```tsx
<div className="space-y-0 divide-y divide-border">
  {items.map(item => (
    <div key={item.id} className="flex items-center justify-between gap-3 px-6 py-2.5 hover:bg-muted/30 transition-colors">
      {/* row content */}
    </div>
  ))}
</div>
```

**MetricCard pattern:**
- Title: `text-xs font-medium text-muted-foreground uppercase tracking-wider`
- Value: `text-xl font-bold tracking-tight tabular-nums`
- Subtitle: `text-[11px] text-muted-foreground mt-1`

### Typography Scale
- Page title: `text-2xl font-bold tracking-tight`
- Section title: `font-semibold text-sm`
- Label: `text-xs`
- Small detail: `text-[11px]`
- Numeric values: always add `tabular-nums`

### Spacing
- Page sections: `space-y-8`
- Card content padding: `pt-5 pb-5` (via CardContent)
- Between form fields: `gap-3`
- List item padding: `px-6 py-2.5`

### Dark Mode
- Use Tailwind's `dark:` prefix for text colors that need adjustment
- Backgrounds use `bg-muted/30` for hover states
- Colored text: `text-{color}-600 dark:text-{color}-400`

## Tech Stack Reference
- Imports: `@/components/ui/*` (shadcn), `lucide-react` (icons), `@/lib/utils` (cn, formatPLN, etc.)
- State: `"use client"` for interactive components, server components by default
- Forms: server actions with `action={handleSubmit}`, `useTransition` for loading states
- Toasts: `import { toast } from "sonner"`

## Checklist Before Finishing
1. Uses correct color from the color language
2. Has gradient accent bar if it's a card
3. Icon badge present for section header
4. Inputs are h-9 (or h-8 for secondary)
5. Numeric values use `tabular-nums`
6. Polish text for all labels (this is a Polish-language app)
7. Responsive grid with `sm:` breakpoints
8. Dark mode colors where needed

For detailed examples of existing components, see [examples/existing-patterns.md](examples/existing-patterns.md).
