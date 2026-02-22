"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar, MobileNav } from "./Sidebar";
import { QuickAddButton } from "./QuickAddButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-40 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <main className="flex-1 overflow-y-auto p-4 pt-14 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <QuickAddButton />
      <MobileNav />
    </div>
  );
}
