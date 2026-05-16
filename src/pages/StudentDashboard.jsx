import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getErrMsg } from "@/lib/errorFormat";
import {
  BookOpen, Award, Calendar, ClipboardList, Loader2, Plus, ScanLine,
  UserCog, Building2, X, CreditCard, Download, CheckCircle2, XCircle,
} from "lucide-react";

const statusBadge = (status) => {
  switch (status) {
    case "pending":   return "badge-amber";
    case "active":    return "badge-blue";
    case "completed": return "badge-green";
    case "failed":    return "badge-red";
    default:          return "badge-zinc";
  }
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrols, setEnrols] = useState([]);
  const [certs, setCerts] = useState([]);
  const [vip, setVip] = useState([]);
  const [site, setSite] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "vip" | "site" | null
  const [paying, setPaying] = useState(null); // enrolment id currently being paid
  const [paymentBanner, setPaymentBanner] = useState(null); // {type, text}
  const [searchParams, setSearchParams] = useSearchParams();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, c, v, s] = await Promise.all([
        api.get("/enrolments/mine"),
        api.get("/certificates/mine"),
        api.get("/vip-requests"),
        api.get("/site-security"),
      ]);
      setEnrols(e.data); setCerts(c.data); setVip(v.data); setSite(s.data);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // Handle return from Stripe (?payment=success&session_id=cs_...)
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (!payment) return;

    if (payment === "cancel") {
      setPaymentBanner({ type: "error", text: "Payment cancelled. You can try again anytime." });
      searchParams.delete("payment"); setSearchParams(searchParams, { replace: true });
      return;
    }

    if (payment === "success" && sessionId) {
      setPaymentBanner({ type: "pending", text: "Confirming your payment..." });
      let attempts = 0;
      const maxAttempts = 8;
      const poll = async () => {
        try {
          const { data } = await api.get(`/payments/status/${sessionId}`);
          if (data.payment_status === "paid") {
            setPaymentBanner({ type: "success", text: "Payment successful! Your enrolment is now active." });
            await load();
            searchParams.delete("payment"); searchParams.delete("session_id");
            setSearchParams(searchParams, { replace: true });
            return;
          }
          if (data.status === "expired") {
            setPaymentBanner({ type: "error", text: "Payment session expired. Please try again." });
            return;
          }
          attempts += 1;
          if (attempts >= maxAttempts) {
            setPaymentBanner({ type: "pending", text: "Payment is still processing — please refresh in a minute." });
            return;
          }
          setTimeout(poll, 2000);
        } catch {
          // Transient error — keep the user optimistic; backend may still confirm via webhook
          setPaymentBanner({ type: "pending", text: "Payment is still processing — please refresh in a minute." });
        }
      };
      poll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payForEnrolment = async (enrolmentId) => {
    setPaying(enrolmentId);
    try {
      const { data } = await api.post("/payments/checkout", {
        enrolment_id: enrolmentId,
        origin_url: window.location.origin,
      });
      window.location.href = data.url; // redirect to Stripe
    } catch (ex) {
      setPaymentBanner({ type: "error", text: getErrMsg(ex) });
      setPaying(null);
    }
  };

  const downloadPdf = async (certId, serial) => {
    try {
      const resp = await fetch(`${API_BASE}/certificates/${certId}/pdf`, { credentials: "include" });
      if (!resp.ok) throw new Error("Download failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `MJSCYBER_Certificate_${serial}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (ex) {
      alert("Unable to download PDF. Please try again.");
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">Student dashboard</div>
          <h1 className="section-title mt-2">Hello, {user.name.split(" ")[0]} 👋</h1>
          <p className="muted mt-1">Track your enrolments, certificates and service requests.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/courses" className="btn-primary" data-testid="dash-browse-courses"><BookOpen className="w-4 h-4" /> Browse Courses</Link>
        </div>
      </div>

      {paymentBanner && (
        <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border animate-fade-up ${
          paymentBanner.type === "success" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
          : paymentBanner.type === "error" ? "bg-red-500/10 border-red-500/40 text-red-200"
          : "bg-amber-500/10 border-amber-500/40 text-amber-200"
        }`} data-testid="payment-banner">
          {paymentBanner.type === "success" ? <CheckCircle2 className="w-5 h-5" />
            : paymentBanner.type === "error" ? <XCircle className="w-5 h-5" />
            : <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="text-sm">{paymentBanner.text}</span>
          <button onClick={() => setPaymentBanner(null)} className="ml-auto text-xs opacity-70 hover:opacity-100" data-testid="payment-banner-dismiss">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={ClipboardList} label="Enrolments" value={enrols.length} color="blue" />
        <Stat icon={Award}         label="Certificates" value={certs.length} color="emerald" />
        <Stat icon={UserCog}       label="VIP Requests" value={vip.length} color="red" />
        <Stat icon={Building2}     label="Site Requests" value={site.length} color="amber" />
      </div>

      {/* Enrolments */}
      <Section title="My Enrolments" testid="my-enrolments-section">
        {enrols.length === 0 ? (
          <EmptyCta text="You haven't enrolled in any courses yet." ctaTo="/courses" ctaText="Browse Courses" />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {enrols.map((e) => (
              <div key={e.id} className="card p-5" data-testid={`enrolment-card-${e.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold">{e.course?.title}</div>
                    <div className="text-xs muted">{e.course?.code} · Grade {e.course?.grade}</div>
                  </div>
                  <span className={statusBadge(e.status)}>{e.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="card-glass py-2"><div className="text-xs muted">Theory</div><div className="text-white font-bold">{e.theory_mark ?? "—"}</div></div>
                  <div className="card-glass py-2"><div className="text-xs muted">Practical</div><div className="text-white font-bold">{e.practical_mark ?? "—"}</div></div>
                  <div className="card-glass py-2"><div className="text-xs muted">Overall</div><div className="text-white font-bold">{e.overall_mark ?? "—"}</div></div>
                </div>
                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs muted flex items-center gap-1"><Calendar className="w-3 h-3" />
                    Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                  </div>
                  {e.status === "pending" && e.payment_status !== "paid" && (
                    <button onClick={() => payForEnrolment(e.id)} disabled={paying === e.id}
                            className="btn-accent text-xs" data-testid={`pay-btn-${e.id}`}>
                      {paying === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                        <><CreditCard className="w-3.5 h-3.5" /> Pay R {e.course?.price_zar?.toLocaleString("en-ZA")}</>}
                    </button>
                  )}
                  {e.payment_status === "paid" && <span className="badge-green text-xs">Paid</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Certificates */}
      <Section title="My Certificates" testid="my-certificates-section">
        {certs.length === 0 ? (
          <div className="card p-6 text-center muted">Certificates appear here once you pass a programme.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certs.map((c) => (
              <div key={c.id} className="card p-5 border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-transparent"
                   data-testid={`certificate-card-${c.serial}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{c.course_title}</div>
                    <div className="text-xs muted">{c.course_code} · Grade {c.course_grade}</div>
                  </div>
                  <span className="badge-green text-xs">{c.overall_mark}%</span>
                </div>
                <div className="mt-4 card-glass p-3 font-mono text-sm text-blue-300 flex items-center justify-between">
                  {c.serial}
                  <div className="flex gap-2">
                    <button onClick={() => downloadPdf(c.id, c.serial)}
                            className="text-xs text-zinc-200 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                            data-testid={`download-pdf-${c.serial}`}>
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    <Link to={`/verify/${c.serial}`} className="text-xs text-zinc-200 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                          data-testid={`verify-cert-${c.serial}`}>
                      <ScanLine className="w-3 h-3" /> Verify
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Services */}
      <Section title="My Service Requests" testid="services-section" action={
        <div className="flex gap-2">
          <button onClick={() => setModal("vip")}  className="btn-ghost text-sm" data-testid="request-vip-btn"><Plus className="w-3.5 h-3.5" /> VIP</button>
          <button onClick={() => setModal("site")} className="btn-ghost text-sm" data-testid="request-site-btn"><Plus className="w-3.5 h-3.5" /> Site Security</button>
        </div>
      }>
        <div className="grid lg:grid-cols-2 gap-5">
          <RequestsTable title="VIP Protection" rows={vip} kind="vip" />
          <RequestsTable title="Site Security"  rows={site} kind="site" />
        </div>
      </Section>

      {modal && <RequestModal kind={modal} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  const map = { blue: "text-blue-300 bg-blue-500/15 border-blue-500/30",
                emerald: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
                red: "text-red-300 bg-red-500/15 border-red-500/30",
                amber: "text-amber-300 bg-amber-500/15 border-amber-500/30" };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${map[color]}`}><Icon className="w-5 h-5" /></div>
      <div><div className="text-3xl font-black text-white leading-none">{value}</div>
           <div className="text-xs muted mt-1">{label}</div></div>
    </div>
  );
}

function Section({ title, testid, action, children }) {
  return (
    <section className="mb-12" data-testid={testid}>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyCta({ text, ctaTo, ctaText }) {
  return (
    <div className="card p-8 text-center">
      <p className="muted mb-4">{text}</p>
      <Link to={ctaTo} className="btn-accent">{ctaText}</Link>
    </div>
  );
}

function RequestsTable({ title, rows, kind }) {
  return (
    <div className="card p-5">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="muted text-sm">No requests yet.</p>
      ) : (
        <ul className="space-y-2" data-testid={`requests-${kind}-list`}>
          {rows.map((r) => (
            <li key={r.id} className="card-glass p-3 flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">{r.client_name || r.site_name}</div>
                <div className="text-xs muted">{r.location} · {r.start_date} → {r.end_date}</div>
              </div>
              <span className={`${r.status === "approved" ? "badge-green" : r.status === "rejected" ? "badge-red" : "badge-amber"}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestModal({ kind, onClose, onSaved }) {
  const [f, setF] = useState(
    kind === "vip"
      ? { client_name: "", contact: "", start_date: "", end_date: "", location: "", details: "", guards_needed: 2 }
      : { site_name: "", location: "", start_date: "", end_date: "", guards_needed: 3, shift_type: "day", details: "" }
  );
  const [err, setErr] = useState("");
  const [sub, setSub] = useState(false);
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSub(true);
    try {
      await api.post(kind === "vip" ? "/vip-requests" : "/site-security", {
        ...f, guards_needed: Number(f.guards_needed),
      });
      onSaved(); onClose();
    } catch (ex) { setErr(getErrMsg(ex)); } finally { setSub(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid={`${kind}-modal`}>
      <div className="card p-6 max-w-xl w-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{kind === "vip" ? "Request VIP Protection" : "Request Site Security"}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" data-testid="modal-close"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {kind === "vip" ? (
            <>
              <Field label="Client name"><input className="input" required value={f.client_name} onChange={upd("client_name")} data-testid="vip-client-input" /></Field>
              <Field label="Contact"><input className="input" required value={f.contact} onChange={upd("contact")} data-testid="vip-contact-input" /></Field>
            </>
          ) : (
            <>
              <Field label="Site name"><input className="input" required value={f.site_name} onChange={upd("site_name")} data-testid="site-name-input" /></Field>
              <Field label="Shift type">
                <select className="input" value={f.shift_type} onChange={upd("shift_type")} data-testid="site-shift-select">
                  <option value="day">Day</option><option value="night">Night</option><option value="24-7">24/7</option>
                </select>
              </Field>
            </>
          )}
          <Field label="Location"><input className="input" required value={f.location} onChange={upd("location")} data-testid="req-location-input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><input type="date" className="input" required value={f.start_date} onChange={upd("start_date")} data-testid="req-start-input" /></Field>
            <Field label="End date"><input type="date" className="input" required value={f.end_date} onChange={upd("end_date")} data-testid="req-end-input" /></Field>
          </div>
          <Field label="Guards needed"><input type="number" min="1" className="input" required value={f.guards_needed} onChange={upd("guards_needed")} data-testid="req-guards-input" /></Field>
          <Field label="Details"><textarea rows={3} className="input" value={f.details} onChange={upd("details")} data-testid="req-details-input" /></Field>

          {err && <div className="text-red-300 text-sm">{err}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost" data-testid="modal-cancel">Cancel</button>
            <button type="submit" className="btn-accent" disabled={sub} data-testid="modal-submit">
              {sub ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}
