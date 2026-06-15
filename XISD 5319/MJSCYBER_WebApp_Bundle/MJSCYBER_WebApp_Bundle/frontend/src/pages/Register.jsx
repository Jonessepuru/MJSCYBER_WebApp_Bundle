import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getErrMsg } from "@/lib/errorFormat";
import { Shield, Loader2 } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", id_number: "", password: "" });
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (ex) {
      setErr(getErrMsg(ex));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-14 order-2 md:order-1">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="muted mt-1">Join MJSCYBER Security School.</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit} data-testid="register-form">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={upd("name")} required
                     placeholder="Jane Doe" data-testid="register-name-input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={upd("email")} required
                     placeholder="jane@example.com" data-testid="register-email-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={upd("phone")}
                       placeholder="+27 82 123 4567" data-testid="register-phone-input" />
              </div>
              <div>
                <label className="label">SA ID Number</label>
                <input className="input" value={form.id_number} onChange={upd("id_number")}
                       placeholder="13 digits" data-testid="register-id-input" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password} onChange={upd("password")} required
                     minLength={6} placeholder="Minimum 6 characters" data-testid="register-password-input" />
            </div>

            {err && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg"
                   data-testid="register-error">{err}</div>
            )}

            <button type="submit" className="btn-accent w-full" disabled={submitting} data-testid="register-submit-btn">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-sm muted text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-red-300 hover:text-red-200 font-semibold" data-testid="register-to-login">Sign in</Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block relative order-1 md:order-2">
        <img src="/img/team.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-black/10" />
        <div className="relative h-full flex flex-col justify-end p-10">
          <Shield className="w-10 h-10 text-[rgb(var(--accent))] mb-4" />
          <h2 className="text-4xl font-black text-white leading-tight">Build a career <br />that protects.</h2>
          <p className="text-zinc-300 mt-2 max-w-sm">Enrol once and get access to every PSIRA grade, VIP protection, armed response and more.</p>
        </div>
      </div>
    </div>
  );
}
