import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { API_BASE } from "@/lib/api";
import { getErrMsg } from "@/lib/errorFormat";
import {
  Users, BookOpen, ClipboardList, Award, UserCog, Building2, Wallet,
  Loader2, CheckCircle2, X, Pencil, Plus, Download,
} from "lucide-react";

const TABS = [
  { id: "overview",     label: "Overview" },
  { id: "enrolments",   label: "Enrolments" },
  { id: "students",     label: "Students" },
  { id: "courses",      label: "Courses" },
  { id: "certificates", label: "Certificates" },
  { id: "vip",          label: "VIP Requests" },
  { id: "site",         label: "Site Security" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {}); }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">MJSCYBER Control Centre</div>
          <h1 className="section-title mt-2">Admin Dashboard</h1>
          <p className="muted mt-1">Manage students, enrolments, certificates and service requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-8 pb-1 border-b border-white/10" data-testid="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
                  data-testid={`admin-tab-${t.id}`}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                    tab === t.id ? "text-white bg-white/5 border-b-2 border-[rgb(var(--accent))]"
                                 : "text-zinc-400 hover:text-zinc-200"
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview"     && <Overview stats={stats} />}
      {tab === "enrolments"   && <Enrolments onChange={() => api.get("/admin/stats").then(r => setStats(r.data))} />}
      {tab === "students"     && <Students />}
      {tab === "courses"      && <Courses />}
      {tab === "certificates" && <Certificates />}
      {tab === "vip"          && <ServiceAdmin kind="vip"  endpoint="/vip-requests"  title="VIP Protection Requests" />}
      {tab === "site"         && <ServiceAdmin kind="site" endpoint="/site-security" title="Site Security Requests" />}
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ stats }) {
  if (!stats) return <Loader />;
  const cards = [
    { i: Users,         l: "Students",            v: stats.students,            c: "blue" },
    { i: BookOpen,      l: "Active Courses",      v: stats.courses,             c: "emerald" },
    { i: ClipboardList, l: "Pending Enrolments",  v: stats.enrolments_pending,  c: "amber" },
    { i: CheckCircle2,  l: "Active Enrolments",   v: stats.enrolments_active,   c: "blue" },
    { i: Award,         l: "Certificates Issued", v: stats.certificates,        c: "emerald" },
    { i: UserCog,       l: "VIP Pending",         v: stats.vip_pending,         c: "red" },
    { i: Building2,     l: "Site Pending",        v: stats.site_pending,        c: "red" },
    { i: Wallet,        l: "Revenue (ZAR)",       v: `R ${Number(stats.revenue_zar).toLocaleString("en-ZA")}`, c: "emerald" },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-overview-grid">
      {cards.map((c) => (
        <div key={c.l} className="card p-5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border
            ${c.c === "blue" ? "bg-blue-500/15 border-blue-500/30 text-blue-300" :
              c.c === "emerald" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" :
              c.c === "amber" ? "bg-amber-500/15 border-amber-500/30 text-amber-300" :
              "bg-red-500/15 border-red-500/30 text-red-300"}`}>
            <c.i className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{c.v}</div>
            <div className="text-xs muted mt-1">{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Enrolments ---------------- */
function Enrolments({ onChange }) {
  const [rows, setRows] = useState(null);
  const [grade, setGrade] = useState(null); // enrolment being graded
  const [err, setErr] = useState("");

  const load = () => api.get("/enrolments").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await api.patch(`/enrolments/${id}/approve`); await load(); onChange(); }
    catch (ex) { setErr(getErrMsg(ex)); }
  };
  const issue = async (enrolmentId) => {
    try { await api.post(`/certificates/issue/${enrolmentId}`); await load(); onChange(); }
    catch (ex) { setErr(getErrMsg(ex)); }
  };

  if (!rows) return <Loader />;
  return (
    <div className="card p-5" data-testid="admin-enrolments-table">
      {err && <div className="mb-4 text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{err}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left muted border-b border-white/10">
            <Th>Student</Th><Th>Course</Th><Th>Status</Th><Th>Marks</Th><Th>Enrolled</Th><Th>Actions</Th>
          </tr></thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`admin-enrol-row-${e.id}`}>
                <Td><div className="text-white">{e.student?.name}</div><div className="text-xs muted">{e.student?.email}</div></Td>
                <Td>{e.course?.title} <span className="text-xs muted">({e.course?.code})</span></Td>
                <Td><span className={statusBadge(e.status)}>{e.status}</span></Td>
                <Td className="font-mono text-xs">T {e.theory_mark ?? "—"} · P {e.practical_mark ?? "—"} · O {e.overall_mark ?? "—"}</Td>
                <Td className="text-xs muted">{new Date(e.enrolled_at).toLocaleDateString()}</Td>
                <Td>
                  <div className="flex gap-2">
                    {e.status === "pending" && (
                      <button onClick={() => approve(e.id)} className="btn-ghost text-xs" data-testid={`approve-${e.id}`}>Approve</button>
                    )}
                    {(e.status === "active" || e.status === "completed") && (
                      <button onClick={() => setGrade(e)} className="btn-ghost text-xs" data-testid={`grade-${e.id}`}><Pencil className="w-3 h-3" /> Grade</button>
                    )}
                    {e.status === "completed" && (
                      <button onClick={() => issue(e.id)} className="btn-accent text-xs" data-testid={`issue-cert-${e.id}`}><Award className="w-3 h-3" /> Issue cert</button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="muted text-center py-10">No enrolments yet.</p>}
      </div>
      {grade && <GradeModal enrol={grade} onClose={() => setGrade(null)} onSaved={async () => { setGrade(null); await load(); onChange(); }} />}
    </div>
  );
}

function GradeModal({ enrol, onClose, onSaved }) {
  const [f, setF] = useState({ theory_mark: enrol.theory_mark ?? 0, practical_mark: enrol.practical_mark ?? 0, comments: enrol.comments || "" });
  const [err, setErr] = useState(""); const [sub, setSub] = useState(false);
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSub(true);
    try {
      await api.patch(`/enrolments/${enrol.id}/grade`, {
        theory_mark: Number(f.theory_mark), practical_mark: Number(f.practical_mark), comments: f.comments,
      });
      onSaved();
    } catch (ex) { setErr(getErrMsg(ex)); } finally { setSub(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="grade-modal">
      <div className="card p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Grade enrolment</h3>
            <p className="text-xs muted">{enrol.student?.name} · {enrol.course?.title}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="label">Theory (0–100)</span>
              <input type="number" min="0" max="100" className="input" required value={f.theory_mark} onChange={upd("theory_mark")} data-testid="grade-theory-input" />
            </label>
            <label className="block"><span className="label">Practical (0–100)</span>
              <input type="number" min="0" max="100" className="input" required value={f.practical_mark} onChange={upd("practical_mark")} data-testid="grade-practical-input" />
            </label>
          </div>
          <label className="block"><span className="label">Instructor comments</span>
            <textarea rows={3} className="input" value={f.comments} onChange={upd("comments")} data-testid="grade-comments-input" />
          </label>
          {err && <div className="text-red-300 text-sm">{err}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button className="btn-accent" disabled={sub} data-testid="grade-submit-btn">
              {sub ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save grades"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Students ---------------- */
function Students() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get("/admin/students").then(r => setRows(r.data)); }, []);
  if (!rows) return <Loader />;
  return (
    <div className="card p-5" data-testid="admin-students-table">
      <table className="w-full text-sm">
        <thead><tr className="text-left muted border-b border-white/10">
          <Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>ID Number</Th><Th>Joined</Th>
        </tr></thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-white/5">
              <Td className="text-white">{u.name}</Td><Td>{u.email}</Td><Td>{u.phone || "—"}</Td>
              <Td className="font-mono text-xs">{u.id_number || "—"}</Td>
              <Td className="text-xs muted">{new Date(u.created_at).toLocaleDateString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted text-center py-10">No students yet.</p>}
    </div>
  );
}

/* ---------------- Courses admin ---------------- */
function Courses() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/courses/all").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async (c) => {
    try { await api.put(`/courses/${c.id}`, { ...c, active: !c.active }); load(); }
    catch (ex) { setErr(getErrMsg(ex)); }
  };

  if (!rows) return <Loader />;
  return (
    <div className="card p-5" data-testid="admin-courses-table">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm muted">{rows.length} courses</p>
        <button onClick={() => setAdding(true)} className="btn-accent text-sm" data-testid="admin-add-course-btn">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>
      {err && <div className="mb-4 text-red-300">{err}</div>}
      <table className="w-full text-sm">
        <thead><tr className="text-left muted border-b border-white/10">
          <Th>Code</Th><Th>Title</Th><Th>Grade</Th><Th>Duration</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th>
        </tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <Td className="font-mono text-xs text-blue-300">{c.code}</Td>
              <Td className="text-white">{c.title}</Td>
              <Td>{c.grade}</Td><Td>{c.duration_days} d</Td>
              <Td>R {c.price_zar.toLocaleString("en-ZA")}</Td>
              <Td><span className={c.active ? "badge-green" : "badge-zinc"}>{c.active ? "Active" : "Archived"}</span></Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(c)} className="btn-ghost text-xs" data-testid={`edit-course-${c.code}`}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggle(c)} className="btn-ghost text-xs" data-testid={`toggle-course-${c.code}`}>
                    {c.active ? "Archive" : "Restore"}
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      {(adding || editing) && (
        <CourseModal
          course={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={async () => { setAdding(false); setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

function CourseModal({ course, onClose, onSaved }) {
  const isEdit = !!course;
  const [f, setF] = useState(course || {
    title: "", code: "", grade: "E", description: "", duration_days: 5, price_zar: 1000, active: true,
  });
  const [err, setErr] = useState(""); const [sub, setSub] = useState(false);
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSub(true);
    const payload = { ...f, duration_days: Number(f.duration_days), price_zar: Number(f.price_zar), active: !!f.active };
    try {
      if (isEdit) await api.put(`/courses/${course.id}`, payload);
      else        await api.post(`/courses`, payload);
      onSaved();
    } catch (ex) { setErr(getErrMsg(ex)); } finally { setSub(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="course-modal">
      <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{isEdit ? "Edit course" : "Add a new course"}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" data-testid="course-modal-close"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="label">Code</span>
              <input className="input font-mono" required value={f.code} onChange={upd("code")} placeholder="PSE-E" data-testid="course-code-input" />
            </label>
            <label className="block"><span className="label">Grade</span>
              <input className="input" required value={f.grade} onChange={upd("grade")} placeholder="E" data-testid="course-grade-input" />
            </label>
          </div>
          <label className="block"><span className="label">Title</span>
            <input className="input" required value={f.title} onChange={upd("title")} placeholder="PSIRA Grade E" data-testid="course-title-input" />
          </label>
          <label className="block"><span className="label">Description</span>
            <textarea rows={3} className="input" required value={f.description} onChange={upd("description")} data-testid="course-desc-input" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="label">Duration (days)</span>
              <input type="number" min="1" className="input" required value={f.duration_days} onChange={upd("duration_days")} data-testid="course-duration-input" />
            </label>
            <label className="block"><span className="label">Price (ZAR)</span>
              <input type="number" min="0" step="0.01" className="input" required value={f.price_zar} onChange={upd("price_zar")} data-testid="course-price-input" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={!!f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} data-testid="course-active-checkbox" />
            Active (visible to students)
          </label>
          {err && <div className="text-red-300 text-sm">{err}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button className="btn-accent" disabled={sub} data-testid="course-submit-btn">
              {sub ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? "Save changes" : "Create course")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Certificates ---------------- */
function Certificates() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get("/certificates").then(r => setRows(r.data)); }, []);

  const downloadPdf = async (id, serial) => {
    try {
      const resp = await fetch(`${API_BASE}/certificates/${id}/pdf`, { credentials: "include" });
      if (!resp.ok) throw new Error();
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `MJSCYBER_Certificate_${serial}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { alert("Download failed"); }
  };

  if (!rows) return <Loader />;
  return (
    <div className="card p-5" data-testid="admin-certs-table">
      <table className="w-full text-sm">
        <thead><tr className="text-left muted border-b border-white/10">
          <Th>Serial</Th><Th>Student</Th><Th>Programme</Th><Th>Mark</Th><Th>Issued</Th><Th>PDF</Th>
        </tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <Td className="font-mono text-xs text-blue-300">{c.serial}</Td>
              <Td><div className="text-white">{c.student_name}</div><div className="text-xs muted">{c.student_email}</div></Td>
              <Td>{c.course_title} <span className="text-xs muted">({c.course_code})</span></Td>
              <Td>{c.overall_mark}%</Td>
              <Td className="text-xs muted">{new Date(c.issued_at).toLocaleDateString()}</Td>
              <Td>
                <button onClick={() => downloadPdf(c.id, c.serial)} className="btn-ghost text-xs" data-testid={`admin-download-pdf-${c.serial}`}>
                  <Download className="w-3 h-3" /> PDF
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted text-center py-10">No certificates issued yet.</p>}
    </div>
  );
}

/* ---------------- VIP / Site service admin ---------------- */
function ServiceAdmin({ kind, endpoint, title }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const load = React.useCallback(() => api.get(endpoint).then(r => setRows(r.data)), [endpoint]);
  useEffect(() => { load(); }, [load]);

  const update = async (id, status) => {
    try { await api.patch(`${endpoint}/${id}`, { status, note: "" }); load(); }
    catch (ex) { setErr(getErrMsg(ex)); }
  };
  if (!rows) return <Loader />;
  return (
    <div className="card p-5" data-testid={`admin-${kind}-table`}>
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      {err && <div className="mb-3 text-red-300">{err}</div>}
      <table className="w-full text-sm">
        <thead><tr className="text-left muted border-b border-white/10">
          <Th>{kind === "vip" ? "Client" : "Site"}</Th><Th>Location</Th><Th>Dates</Th><Th>Guards</Th><Th>Status</Th><Th>Actions</Th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5">
              <Td className="text-white">{r.client_name || r.site_name}</Td>
              <Td>{r.location}</Td>
              <Td className="text-xs">{r.start_date} → {r.end_date}</Td>
              <Td>{r.guards_needed}</Td>
              <Td><span className={r.status === "approved" ? "badge-green" : r.status === "rejected" ? "badge-red" : "badge-amber"}>{r.status}</span></Td>
              <Td>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => update(r.id, "approved")} className="btn-ghost text-xs text-emerald-300" data-testid={`${kind}-approve-${r.id}`}>Approve</button>
                    <button onClick={() => update(r.id, "rejected")} className="btn-ghost text-xs text-red-300" data-testid={`${kind}-reject-${r.id}`}>Reject</button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted text-center py-10">No requests yet.</p>}
    </div>
  );
}

const Th = ({ children }) => <th className="py-2 px-2 text-xs uppercase tracking-wider font-semibold">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`py-3 px-2 align-top ${className}`}>{children}</td>;
const Loader = () => <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

const statusBadge = (s) => {
  if (s === "pending") return "badge-amber";
  if (s === "active") return "badge-blue";
  if (s === "completed") return "badge-green";
  if (s === "failed" || s === "rejected") return "badge-red";
  if (s === "approved") return "badge-green";
  return "badge-zinc";
};
