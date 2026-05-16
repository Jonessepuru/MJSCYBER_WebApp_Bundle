import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getErrMsg } from "@/lib/errorFormat";
import { Shield, Lock, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setSubmitting(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (ex) {
      setErr(getErrMsg(ex));
    } finally { setSubmitting(false); }
  };

  const quickFill = (e_, p_) => { setEmail(e_); setPassword(p_); };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2">
      <div className="hidden md:block relative">
        <img src="/img/guard.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        <div className="relative h-full flex flex-col justify-end p-10">
          <Shield className="w-10 h-10 text-[rgb(var(--accent))] mb-4" />
          <h2 className="text-4xl font-black text-white leading-tight">Welcome back, <br />Guardian.</h2>
          <p className="text-zinc-300 mt-2 max-w-sm">Access your training dashboard, certificates and service requests.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white">Sign in</h1>
          <p className="muted mt-1">Enter your credentials to continue.</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit} data-testid="login-form">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       required autoComplete="email"
                       className="input pl-10" placeholder="you@example.com"
                       data-testid="login-email-input" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                       required autoComplete="current-password"
                       className="input pl-10" placeholder="••••••••"
                       data-testid="login-password-input" />
              </div>
            </div>

            {err && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg"
                   data-testid="login-error">{err}</div>
            )}

            <button type="submit" className="btn-accent w-full" disabled={submitting}
                    data-testid="login-submit-btn">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-sm muted text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-red-300 hover:text-red-200 font-semibold" data-testid="login-to-register">
              Create one
            </Link>
          </div>

          <div className="mt-8 card p-4">
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-3">Quick demo accounts</div>
            <div className="space-y-2">
              <button type="button" onClick={() => quickFill("admin@mjscyber.co.za", "Admin@123")}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between"
                      data-testid="login-quick-admin">
                <span className="text-red-300 font-semibold">Admin</span>
                <span className="text-zinc-400">admin@mjscyber.co.za</span>
              </button>
              <button type="button" onClick={() => quickFill("thabo@student.co.za", "Student@123")}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between"
                      data-testid="login-quick-student">
                <span className="text-blue-300 font-semibold">Student</span>
                <span className="text-zinc-400">thabo@student.co.za</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
