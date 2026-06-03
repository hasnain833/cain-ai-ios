import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Cain AIOS",
  description: "Sign in to the Cain AI Operating System",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {children}
    </div>
  );
}
