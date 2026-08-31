import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgePercent, Bike, Inbox, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { SHOWROOM } from "@/lib/showroom";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Staff Admin — ${SHOWROOM.name}` },
      { name: "description", content: "Showroom staff area for managing vehicles, offers and enquiries." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Staff Admin — ${SHOWROOM.name}` },
      { property: "og:description", content: "Showroom staff area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/vehicles", label: "Vehicles", icon: Bike, exact: false },
  { to: "/admin/offers", label: "Offers", icon: BadgePercent, exact: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox, exact: false },
] as const;

function AdminLayout() {
  const { session, isAdmin, loading, refreshRole } = useAdminAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your access…
      </div>
    );
  }

  if (!session) return <LoginCard />;
  if (!isAdmin) return <ClaimAccessCard email={session.user.email ?? ""} onClaimed={refreshRole} />;

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-ink text-ink-foreground">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl font-bold uppercase tracking-wide">
            {SHOWROOM.name} <span className="text-primary">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs opacity-70 sm:inline">{session.user.email}</span>
            <Button size="sm" variant="secondary" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
        <nav className="border-t border-white/10" aria-label="Admin navigation">
          <div className="container-page flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "border-primary text-ink-foreground" }}
                className="flex shrink-0 items-center gap-2 border-b-2 border-transparent px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide opacity-90 hover:text-primary"
              >
                <item.icon className="size-4" /> {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-5 py-14">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </span>
        {children}
      </div>
    </div>
  );
}

function LoginCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (signUpError) setError(signUpError.message);
      else if (!data.session)
        setNotice("Account created. Confirm your email address, then sign in here.");
    }
    setBusy(false);
  };

  return (
    <AuthShell>
      <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-wide">
        {mode === "signin" ? "Staff sign in" : "Create staff account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This area is for {SHOWROOM.name} staff only. Website visitors do not need an account.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-12"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="h-12"
          />
        </div>

        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {notice && <p className="rounded-md bg-success/10 p-3 text-sm text-success">{notice}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setNotice(null);
        }}
        className="mt-5 text-sm font-semibold text-primary hover:underline"
      >
        {mode === "signin" ? "First time here? Create a staff account" : "Already have an account? Sign in"}
      </button>

      <Link to="/" className="mt-6 block text-sm text-muted-foreground hover:text-primary">
        ← Back to website
      </Link>
    </AuthShell>
  );
}

function ClaimAccessCard({ email, onClaimed }: { email: string; onClaimed: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const claim = async () => {
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) setMessage(error.message);
    else if (data) onClaimed();
    else setMessage("An administrator already exists. Ask them to grant you access.");
    setBusy(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthShell>
      <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-wide">
        Access required
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are signed in as <strong>{email}</strong> but this account is not an administrator yet.
        If this is the showroom's first staff account, claim admin access below.
      </p>
      {message && <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
      <Button className="mt-6 w-full" size="lg" onClick={claim} disabled={busy}>
        {busy ? "Checking…" : "Claim admin access"}
      </Button>
      <Button variant="outline" className="mt-3 w-full" onClick={signOut}>
        Sign out
      </Button>
    </AuthShell>
  );
}
