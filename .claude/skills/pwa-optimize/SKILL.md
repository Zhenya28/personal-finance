---
name: pwa-optimize
description: Optimize the PWA (Progressive Web App) capabilities of the finance dashboard. Use for service worker improvements, offline support, caching strategies, app manifest configuration, install prompts, push notifications, and mobile-first optimizations.
disable-model-invocation: true
---

# PWA Optimization — Finance Dashboard

Analyze and improve the Progressive Web App capabilities of this Next.js finance dashboard.

## Current PWA Setup

**App directory:** `app/`
**Offline page:** `app/~offline/page.tsx`
**Public assets:** `public/` (icons, manifest)

## Audit Checklist

### 1. Web App Manifest (`public/manifest.json`)
- [ ] `name` and `short_name` set correctly
- [ ] `display: "standalone"` for native feel
- [ ] `theme_color` and `background_color` match the app
- [ ] Icons: 192x192 and 512x512 PNG, maskable variants
- [ ] `start_url: "/"` or appropriate
- [ ] `scope: "/"`
- [ ] `categories: ["finance"]`

### 2. Service Worker / Caching
- [ ] Static assets cached (CSS, JS bundles, fonts)
- [ ] API route responses cached with network-first strategy
- [ ] Offline fallback page works
- [ ] Cache versioning for updates

### 3. Performance (Mobile-First)
- [ ] Images optimized (WebP/AVIF via Next.js Image)
- [ ] Fonts preloaded or using system fonts
- [ ] Bundle size minimized (check with `next build`)
- [ ] No layout shifts (CLS < 0.1)
- [ ] First Contentful Paint < 1.8s
- [ ] Touch targets >= 48x48px for mobile

### 4. Mobile UX
- [ ] `viewport` meta tag with `viewport-fit=cover`
- [ ] Safe area insets for notched devices
- [ ] Pull-to-refresh behavior
- [ ] Bottom navigation reachable by thumb
- [ ] No horizontal scroll
- [ ] Proper `input[type]` for numeric fields

### 5. Install Experience
- [ ] `beforeinstallprompt` event handled
- [ ] Custom install banner/button
- [ ] Dismissal remembered

### 6. iOS-Specific
- [ ] `apple-touch-icon` in `<head>`
- [ ] `apple-mobile-web-app-capable` meta
- [ ] `apple-mobile-web-app-status-bar-style`
- [ ] Splash screens for various iOS sizes

## Optimization Actions

After auditing, implement improvements in priority order:
1. Fix any missing manifest fields
2. Add proper caching strategy
3. Optimize for mobile performance
4. Enhance install experience
5. Add iOS-specific meta tags

## Tech References
- Next.js PWA patterns: `next.config.ts` for headers, metadata API for manifest link
- Service worker: can use `serwist` or `next-pwa` packages
- Manifest: `app/layout.tsx` metadata export or `<link rel="manifest">`

$ARGUMENTS
