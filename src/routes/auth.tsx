import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Cloud,
  Cpu,
  HardDrive,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — HyperLoop AI" },
      { name: "description", content: "Sign in to HyperLoop AI, the intelligent cloud storage console." },
      { property: "og:title", content: "Sign in — HyperLoop AI" },
      { property: "og:description", content: "Sign in to manage your cloud storage with autonomous AI." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | undefined; password?: string | undefined }>({});
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const validate = () => {
    const e: { email?: string | undefined; password?: string | undefined } = {};
    const em = emailSchema.safeParse(email);
    if (!em.success) e.email = em.error.issues[0]?.message;
    const pw = passwordSchema.safeParse(password);
    if (!pw.success) e.password = pw.error.issues[0]?.message;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          toast.error("Login failed", {
            description: error.message.includes("Invalid login credentials")
              ? "Invalid email or password. Please try again."
              : error.message,
          });
        } else toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: fullName } },
        });
        if (error) {
          toast.error("Sign up failed", {
            description: error.message.includes("already registered")
              ? "This email is already registered. Please sign in instead."
              : error.message,
          });
        } else {
          toast.success("Account created!", { description: "Check your email to confirm, then sign in." });
          setIsLogin(true);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      toast.error("Google sign-in failed", { description: String(result.error.message ?? result.error) });
      setGoogleLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-background lg:grid-cols-[1.1fr_1fr]">
      <div className="panel-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 size-[32rem] rounded-full bg-violet/15 blur-3xl" />

      {/* Brand side */}
      <section className="relative hidden flex-col justify-between border-r border-border p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl border border-primary/30 bg-primary/12">
            <Cpu className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">
              HyperLoop <span className="text-gradient-brand">AI</span>
            </p>
            <p className="text-xs text-muted-foreground">Intelligent Cloud Storage</p>
          </div>
        </div>

        <div className="max-w-lg">
          <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight">
            Your storage,
            <br />
            <span className="text-gradient-brand">run by autonomous AI.</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground">
            Connect Google Drive and let HyperLoop analyse usage, forecast growth and recommend what to
            archive — in real time.
          </p>
          <div className="mt-10 grid gap-3">
            {[
              { icon: HardDrive, t: "Live Google Drive analysis", d: "Real quota, files and folders" },
              { icon: Sparkles, t: "Ask HyperLoop", d: "AI answers grounded in your data" },
              { icon: ShieldCheck, t: "Read-only & safe", d: "Nothing is moved without approval" },
            ].map((f) => (
              <div key={f.t} className="glass-card flex items-center gap-4 rounded-xl p-4">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/12 text-primary">
                  <f.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{f.t}</p>
                  <p className="text-xs text-muted-foreground">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Cloud className="size-3.5" /> Secured by Lovable Cloud
        </p>
      </section>

      {/* Form side */}
      <section className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl border border-primary/30 bg-primary/12">
              <Cpu className="size-5 text-primary" />
            </span>
            <p className="text-lg font-semibold">
              HyperLoop <span className="text-gradient-brand">AI</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin ? "Sign in to open your storage console." : "Start managing storage with AI."}
            </p>

            {currentEmail && (
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="mt-6 flex w-full items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-left text-sm transition-colors hover:bg-primary/15"
              >
                <span>
                  Continue as <span className="font-medium">{currentEmail}</span>
                </span>
                <ArrowRight className="size-4 text-primary" />
              </button>
            )}

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-[11px] tracking-widest text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {!isLogin && (
                <Field icon={User} label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Harish Kumar"
                    className="auth-input"
                  />
                </Field>
              )}
              <Field icon={Mail} label="Email" error={errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="auth-input"
                />
              </Field>
              <Field icon={Lock} label="Password" error={errors.password}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="auth-input"
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {isLogin ? "Sign in" : "Create account"}
                {!loading && <ArrowRight className="size-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "New to HyperLoop?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin((v) => !v);
                  setErrors({});
                }}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: typeof Mail;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </span>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
