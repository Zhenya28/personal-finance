import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontDisplay = Inter({ subsets: ["latin"], variable: "--font-display" });

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MyFinance",
  applicationName: "MyFinance",
  description: "Nowoczesny panel do zarzadzania finansami osobistymi",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/icons/icon.svg"],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyFinance",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0F1E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`dark ${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                document.documentElement.classList.add('dark');
                document.documentElement.style.backgroundColor = '#0A0F1E';
                document.documentElement.style.colorScheme = 'dark';
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function hideBootLoader() {
                  var el = document.getElementById("app-boot-loader");
                  if (!el || el.dataset.hidden === "1") return;
                  el.dataset.hidden = "1";
                  el.classList.add("is-leaving");
                  window.setTimeout(function () {
                    if (!el) return;
                    el.classList.add("is-hidden");
                    el.setAttribute("aria-hidden", "true");
                  }, 340);
                }

                document.addEventListener("readystatechange", function () {
                  if (document.readyState === "interactive") {
                    window.setTimeout(hideBootLoader, 260);
                  }
                });

                window.addEventListener("pageshow", function () {
                  window.setTimeout(hideBootLoader, 200);
                });

                window.addEventListener("load", function () {
                  window.setTimeout(hideBootLoader, 120);
                });
              })();
            `,
          }}
        />
        <noscript>
          <style>{`#app-boot-loader{display:none !important;}`}</style>
        </noscript>
      </head>
      <body className="antialiased font-sans">
        <div id="app-boot-loader" className="app-boot-loader" aria-hidden>
          <div className="app-boot-loader__inner">
            <div className="app-boot-loader__spinner" />
            <p className="app-boot-loader__label">Ladowanie MyFinance</p>
            <div className="app-boot-loader__pulse" />
          </div>
        </div>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (!('serviceWorker' in navigator)) return;
                var enableServiceWorker = false;

                function cleanupServiceWorkersAndCaches() {
                  return navigator.serviceWorker
                    .getRegistrations()
                    .then(function (registrations) {
                      return Promise.all(
                        registrations.map(function (registration) {
                          return registration.unregister();
                        })
                      );
                    })
                    .then(function () {
                      if (!('caches' in window)) return;
                      return caches.keys().then(function (keys) {
                        return Promise.all(
                          keys
                            .filter(function (key) {
                              return (
                                key.indexOf('finance-') === 0 ||
                                key.indexOf('finance-v') === 0
                              );
                            })
                            .map(function (key) { return caches.delete(key); })
                        );
                      });
                    });
                }

                window.addEventListener('load', function () {
                  cleanupServiceWorkersAndCaches()
                    .then(function () {
                      if (!enableServiceWorker) return;
                      return navigator.serviceWorker.register('/sw.js');
                    })
                    .catch(function () {});
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
