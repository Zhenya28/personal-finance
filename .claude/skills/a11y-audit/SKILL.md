---
name: a11y-audit
description: Audit accessibility (WCAG 2.1) of the finance dashboard. Checks color contrast, keyboard navigation, screen reader support, ARIA labels, focus management, and form accessibility. Use to ensure the app is usable by everyone.
context: fork
agent: Explore
---

# Accessibility Audit — Finance Dashboard

Check WCAG 2.1 AA compliance across the finance dashboard.

## Audit Checklist

### Color & Contrast
- [ ] Text contrast ratio >= 4.5:1 (normal text) / 3:1 (large text)
- [ ] Colored values (emerald, red) meet contrast in both light/dark mode
- [ ] Information not conveyed by color alone (icons/text supplement)
- [ ] `text-muted-foreground` items still readable

### Keyboard Navigation
- [ ] All interactive elements focusable via Tab
- [ ] Focus visible on all interactive elements
- [ ] Dialogs (AlertDialog, Sheet) trap focus correctly
- [ ] Escape closes modals/dialogs
- [ ] QuickAddButton (FAB) keyboard accessible

### Forms
- [ ] All inputs have associated `<Label>` with `htmlFor`
- [ ] Required fields indicated
- [ ] Error messages announced to screen readers
- [ ] Select components have proper ARIA roles (shadcn handles this)
- [ ] Date inputs have proper type and format hints

### Semantic HTML
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Lists used for repeated items
- [ ] `<nav>` for navigation (sidebar)
- [ ] `<main>` for primary content
- [ ] `<button>` for actions (not `<div onClick>`)

### Screen Reader
- [ ] Icons have `aria-label` or are decorative (`aria-hidden`)
- [ ] Dynamic content updates announced (toasts via Sonner should handle this)
- [ ] Chart data has text alternative
- [ ] Delete confirmation dialog properly announced
- [ ] Loading states communicated (`aria-busy`)

### Mobile Accessibility
- [ ] Touch targets >= 44x44px (WCAG) / 48x48px (Material)
- [ ] Pinch zoom not disabled
- [ ] Content reflows at 320px width

## Process

1. Read all page files and components
2. Check each category systematically
3. List violations with severity (Critical/Major/Minor)
4. Provide specific fixes with code snippets

## Files to Check
- `app/layout.tsx` — HTML structure, lang attribute
- `components/layout/Sidebar.tsx` — navigation semantics
- `components/layout/QuickAddButton.tsx` — FAB accessibility
- All form components — label associations
- All table/list components — data table semantics
- Chart components — text alternatives

$ARGUMENTS
