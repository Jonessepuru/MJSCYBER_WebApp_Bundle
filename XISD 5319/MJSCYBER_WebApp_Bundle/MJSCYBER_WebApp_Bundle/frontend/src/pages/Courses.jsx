import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { getErrMsg } from "@/lib/errorFormat";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Clock, BadgeCheck, Loader2, ArrowRight } from "lucide-react";

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [enrolled, setEnrolled] = useState(new Set());
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/courses");
        setCourses(data);
        if (user && user.role === "student") {
          const { data: mine } = await api.get("/enrolments/mine");
          setEnrolled(new Set(mine.map((e) => e.course_id)));
        }
      } catch (ex) { setErr(getErrMsg(ex)); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const enrol = async (courseId) => {
    setEnrolling(courseId); setErr("");
    try {
      await api.post("/enrolments", { course_id: courseId });
      setEnrolled(new Set([...enrolled, courseId]));
    } catch (ex) { setErr(getErrMsg(ex)); }
    finally { setEnrolling(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">Catalogue</div>
        <h1 className="section-title mt-2">Training programmes</h1>
        <p className="muted mt-2 max-w-2xl">Industry-aligned PSIRA training plus specialised armed-response programmes — delivered in Bochum with national certification.</p>
      </div>

      {err && <div className="mb-6 text-red-300 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-lg" data-testid="courses-error">{err}</div>}

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="courses-grid">
          {courses.map((c) => {
            const already = enrolled.has(c.id);
            return (
              <div key={c.id} className="card p-6 flex flex-col hover:border-[rgb(var(--accent))]/40 transition-all"
                   data-testid={`course-card-${c.code}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[#1a0d2a] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-blue">{c.code}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{c.title}</h3>
                <div className="flex items-center gap-3 text-xs mt-1 muted">
                  <span>Grade {c.grade}</span><span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration_days} days</span>
                </div>
                <p className="muted text-sm mt-3 flex-1">{c.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs muted">Tuition</div>
                    <div className="text-xl font-black text-white">R {c.price_zar.toLocaleString("en-ZA")}</div>
                  </div>
                  {user && user.role === "student" ? (
                    already ? (
                      <span className="badge-green flex items-center gap-1 text-xs"><BadgeCheck className="w-3.5 h-3.5" /> Enrolled</span>
                    ) : (
                      <button onClick={() => enrol(c.id)} disabled={enrolling === c.id}
                              className="btn-accent text-xs" data-testid={`enrol-${c.code}-btn`}>
                        {enrolling === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Enrol <ArrowRight className="w-3.5 h-3.5" /></>}
                      </button>
                    )
                  ) : (
                    <Link to={user ? "#" : "/register"} className="btn-ghost text-xs" data-testid={`course-cta-${c.code}`}>
                      {user ? "Admin view" : "Enrol"} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
