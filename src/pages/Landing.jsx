import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, ArrowRight, CheckCircle2, BookOpen, Award, Users, Building2,
  ShieldCheck, ScanLine, UserCog, Gauge, Crosshair,
} from "lucide-react";

const features = [
  { icon: BookOpen,  title: "PSIRA Grade Training",   text: "Full Grade E → A curriculum aligned to the Private Security Industry Regulatory Authority." },
  { icon: Crosshair, title: "Armed Response",         text: "Firearms competency, tactical driving and armed-reaction legal framework." },
  { icon: Award,     title: "Digital Certificates",   text: "Tamper-proof certificates with unique serials & QR public verification." },
  { icon: UserCog,   title: "VIP Protection",         text: "Client-driven protection details with real-time guard scheduling." },
  { icon: Building2, title: "Construction Site Security", text: "24/7 rostering, perimeter protection and equipment tracking." },
  { icon: Gauge,     title: "Live Admin Dashboard",   text: "Enrolments, revenue, compliance — all at a glance for MJSCYBER staff." },
];

const stats = [
  { k: "500+",  l: "Guards Trained" },
  { k: "98%",   l: "Pass Rate" },
  { k: "5+",    l: "Years (since 2022)" },
  { k: "24/7",  l: "Operations" },
];

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[rgb(var(--bg))]" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              PSIRA ACCREDITED · BOCHUM, LIMPOPO
            </div>
            <h1 className="mt-5 text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Train. Protect. <span className="text-[rgb(var(--accent))]">Certify.</span>
            </h1>
            <p className="mt-5 text-lg muted max-w-lg">
              MJSCYBER Security School digitises the entire journey — from student enrolment
              and practical grading to tamper-proof certificate issuance, VIP protection and
              construction-site security.
            </p>
            <div className="mt-8 flex flex-wrap gap-3" data-testid="hero-cta-row">
              <Link to="/register" className="btn-accent" data-testid="hero-enrol-btn">
                Enrol as Student <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/verify" className="btn-outline" data-testid="hero-verify-btn">
                <ScanLine className="w-4 h-4" /> Verify a Certificate
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-4 gap-3 max-w-lg">
              {stats.map((s) => (
                <div key={s.l} className="card-glass px-3 py-3 text-center">
                  <div className="text-xl md:text-2xl font-black text-white">{s.k}</div>
                  <div className="text-[10px] uppercase tracking-wider muted mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-6 bg-gradient-to-tr from-blue-900/30 via-transparent to-red-900/20 blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src="/img/hero.jpg" alt="Security guard on duty" className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 card-glass p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgb(var(--accent))] flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Instant Digital Certificates</div>
                  <div className="text-xs muted">With QR-verifiable serial numbers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">Platform Capabilities</div>
            <h2 className="section-title mt-2">Everything a modern security school needs</h2>
          </div>
          <Link to="/courses" className="btn-ghost" data-testid="features-courses-btn">Browse Courses <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 hover:border-[rgb(var(--accent))]/40 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[rgb(var(--primary))]/25 border border-[rgb(var(--primary))]/40 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <p className="muted text-sm mt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10">
              <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">Student Journey</div>
              <h3 className="text-3xl font-bold text-white mt-2">From registration to certification in 5 steps.</h3>
              <ol className="mt-7 space-y-4">
                {[
                  "Create your student profile online.",
                  "Upload ID and prerequisite documents.",
                  "Pay securely & receive enrolment confirmation.",
                  "Complete theory & practical modules with expert instructors.",
                  "Instantly receive a verifiable digital certificate.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-[rgb(var(--accent))]/15 border border-[rgb(var(--accent))]/30 text-red-300 flex items-center justify-center text-sm font-bold flex-none">
                      {i + 1}
                    </div>
                    <p className="text-zinc-200">{t}</p>
                  </li>
                ))}
              </ol>
              <Link to="/register" className="btn-primary mt-8" data-testid="how-it-works-cta">
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative min-h-[360px]">
              <img src="/img/cert.jpg" alt="Digital certificate" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/70" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="rounded-3xl p-10 md:p-14 bg-gradient-to-br from-[rgb(var(--primary))] via-[#0a2a65] to-[#1a0d1a] border border-white/10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[rgb(var(--accent))]/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <Shield className="w-10 h-10 text-[rgb(var(--accent))] mb-4" />
            <h3 className="text-3xl md:text-4xl font-black text-white">Protect your site. Elevate your career.</h3>
            <p className="text-zinc-200 mt-3">
              Whether you are booking guard services or enrolling in a PSIRA course — MJSCYBER delivers
              with verifiable digital records every step of the way.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="btn-accent" data-testid="cta-register-btn">Enrol Now</Link>
              <Link to="/login" className="btn-outline" data-testid="cta-login-btn">Client Login</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> POPIA aligned</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PSiRA compliant</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Nationwide coverage</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
