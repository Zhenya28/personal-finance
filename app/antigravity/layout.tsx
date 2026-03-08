import type { ReactNode } from "react";
import { redirect } from "next/navigation";

export default function AntigravityLayout({ children }: { children: ReactNode }) {
  void children;
  redirect("/");
}
