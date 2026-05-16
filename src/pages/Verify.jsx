import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { ScanLine, CheckCircle2, XCircle, Search, Loader2, ShieldCheck, Calendar, User, Award } from "lucide-react";

export default function Verify() {
  const { serial: serialParam } = useParams();
  const navigate = useNavigate();
  const [serial, setSerial] = useState(serialParam || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verify = async (s) => {
    setLoading(true); setResult(null);
    try {
      const { data } = await api.get(`/verify/${encodeURIComponent(s.trim())}`);
      setResult(data);
    } catch {
      setResult({ valid: false, message: "Unable to verify. Please try again." });
    }
    setLoading(false);
  };

  useEffect(() => { if (serialParam) verify(serialParam); }, [serialParam]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!serial.trim()) return;
    navigate(`/verify/${encodeURIComponent(serial.trim())}`);
    verify(serial);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> PUBLIC VERIFICATION
        </div>
        <h1 className="section-title mt-3">Verify a MJSCYBER Certificate</h1>
        <p className="muted mt-3 max-w-xl mx-auto">Enter the unique serial printed on any MJSCYBER digital certificate to instantly confirm its authenticity.</p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 max-w-xl mx-auto" data-testid="verify-form">
        <div className="relative flex-1">
          <ScanLine className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input className="input pl-10 font-mono tracking-wider" placeholder="MJS-2026-XXXXXXXX"
                 value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())}
                 data-testid="verify-serial-input" />
        </div>
        <button className="btn-accent" disabled={loading} data-testid="verify-submit-btn">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Verify</>}
        </button>
      </form>

      {result && (
        <div className="mt-10 animate-fade-up" data-testid="verify-result">
          {result.valid ? (
            <div className="card p-8 md:p-10 border-emerald-500/40 bg-gradient-to-br from-emerald-900/20 via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-emerald-300 font-bold text-xl">Certificate is valid</div>
                  <div className="text-xs muted">Issued by {result.issuer}</div>
                </div>
              </div>

              <dl className="grid md:grid-cols-2 gap-5">
                <Row icon={User} label="Student" value={result.student_name} />
                <Row icon={Award} label="Programme" value={`${result.course_title} (${result.course_code})`} />
                <Row icon={ShieldCheck} label="Grade" value={result.course_grade} />
                <Row icon={Award} label="Overall Mark" value={result.overall_mark != null ? `${result.overall_mark}%` : "—"} />
                <Row icon={Calendar} label="Issued" value={new Date(result.issued_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })} />
                <Row icon={ScanLine} label="Serial" value={<span className="font-mono">{result.serial}</span>} />
              </dl>
            </div>
          ) : (
            <div className="card p-8 border-red-500/40 bg-red-900/10" data-testid="verify-invalid">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-red-300 font-bold text-xl">Certificate not found</div>
                  <div className="text-sm muted">{result.message || "The serial you entered doesn't match any certificate in our records."}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-none">
        <Icon className="w-4 h-4 text-zinc-300" />
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider muted">{label}</dt>
        <dd className="text-white font-semibold mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
