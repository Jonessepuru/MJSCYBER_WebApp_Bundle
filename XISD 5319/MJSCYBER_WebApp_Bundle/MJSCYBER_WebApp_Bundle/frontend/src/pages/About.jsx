import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, Target, Eye, Award, Users, Calendar, Building2, CheckCircle2,
  Phone, Mail, MapPin, ArrowRight,
} from "lucide-react";

const milestones = [
  { year: "2022", text: "MJSCYBER PTY LTD founded and registered with CIPC (2022/201980/07) in Bochum, Limpopo." },
  { year: "2023", text: "First cohort of PSIRA Grade E – C students trained and certified." },
  { year: "2024", text: "Expansion into VIP Protection and construction-site security contracts across Limpopo." },
  { year: "2025", text: "Armed Response programme launched; partnerships with regional corporate clients." },
  { year: "2026", text: "Digital transformation — this web platform — brings training, certification and services online." },
];

const values = [
  { icon: Shield,       title: "Integrity",     text: "Every certificate we issue is earned, verifiable and backed by rigorous practical assessment." },
  { icon: Target,       title: "Excellence",    text: "We train to standards that exceed PSIRA baselines so our graduates stand out in every deployment." },
  { icon: Users,        title: "Community",     text: "Proudly rooted in Limpopo, we create skilled employment opportunities in the local community." },
  { icon: Award,        title: "Accountability", text: "Tamper-proof digital records and public verification protect our clients and our guards." },
];

export default function About() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgb(var(--bg))]" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-12 grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> ABOUT MJSCYBER
            </div>
            <h1 className="mt-5 text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Built in Bochum. <br />
              <span className="text-[rgb(var(--accent))]">Trusted nationally.</span>
            </h1>
            <p className="mt-5 text-lg muted max-w-lg">
              MJSCYBER PTY LTD is a PSIRA-accredited private security training provider, founded in 2022.
              We blend hands-on instruction with a modern digital platform so guards can earn, prove
              and showcase their qualifications with confidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/courses"  className="btn-accent" data-testid="about-courses-btn">View Courses <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/register" className="btn-outline" data-testid="about-enrol-btn">Enrol Now</Link>
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-6 bg-gradient-to-tr from-blue-900/30 to-red-900/20 blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src="/img/guard.jpg" alt="" className="w-full h-[420px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-2 gap-5">
        <div className="card p-8">
          <div className="w-11 h-11 rounded-xl bg-[rgb(var(--primary))]/25 border border-[rgb(var(--primary))]/40 flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-blue-300" />
          </div>
          <h2 className="text-white font-bold text-2xl">Our Mission</h2>
          <p className="muted mt-3">
            To elevate the South African private-security sector by producing disciplined, certified
            and digitally-verifiable guards — and to deliver specialised protection services that
            meet the highest standards of professionalism.
          </p>
        </div>
        <div className="card p-8">
          <div className="w-11 h-11 rounded-xl bg-[rgb(var(--accent))]/25 border border-[rgb(var(--accent))]/40 flex items-center justify-center mb-4">
            <Eye className="w-5 h-5 text-red-300" />
          </div>
          <h2 className="text-white font-bold text-2xl">Our Vision</h2>
          <p className="muted mt-3">
            A South Africa where every security credential is instantly verifiable, every site is
            protected by well-trained professionals, and every community — including our home of
            Bochum, Limpopo — benefits from safer public and commercial spaces.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">What we stand for</div>
          <h2 className="section-title mt-2">Our Values</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-zinc-200" />
              </div>
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="muted text-sm mt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STORY / TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="card p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">Our Story</div>
              <h2 className="text-white font-bold text-3xl mt-2">Five years of growth.</h2>
              <p className="muted mt-3">
                From a small classroom in Bochum to a digitally-enabled security ecosystem, every step
                has been about raising the bar for training and protection in our region.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-2 muted"><Building2 className="w-4 h-4" /> CIPC 2022/201980/07</div>
                <div className="flex items-center gap-2 muted"><Calendar className="w-4 h-4" /> Established 2022</div>
                <div className="flex items-center gap-2 muted"><MapPin className="w-4 h-4" /> Bochum, Limpopo</div>
              </div>
            </div>
            <ol className="md:col-span-2 relative border-l-2 border-white/10 pl-6 space-y-6">
              {milestones.map((m) => (
                <li key={m.year} className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[rgb(var(--accent))] border-4 border-[rgb(var(--bg))]" />
                  <div className="text-[rgb(var(--accent-2))] font-bold">{m.year}</div>
                  <p className="text-zinc-200 mt-0.5">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">What we offer</div>
          <h2 className="section-title mt-2">Services</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <ServiceCard title="PSIRA Grades A – E" text="Full spectrum of PSIRA guard training: from entry-level Grade E through senior-management Grade A." />
          <ServiceCard title="VIP Protection"      text="Client-driven close-protection details for executives, public figures and high-risk transport." />
          <ServiceCard title="Armed Response"      text="Firearms competency, tactical driving, and armed-reaction protocols aligned with SA law." />
        </div>
      </section>

      {/* CONTACT */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="card p-8 md:p-12 bg-gradient-to-br from-[rgb(var(--primary))]/30 via-transparent to-[rgb(var(--accent))]/10">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-[rgb(var(--accent-2))] font-semibold">Get in touch</div>
              <h3 className="text-white text-3xl font-bold mt-2">Book a consultation.</h3>
              <p className="muted mt-2">Talk to us about training, guard services or a custom security contract for your site.</p>
            </div>
            <ContactLine icon={MapPin} label="Head Office" value="Bochum, Limpopo, South Africa" />
            <ContactLine icon={Phone}  label="Phone"       value={<a className="hover:text-white" href="tel:+27824268567">082 426 8567</a>} />
            <ContactLine icon={Mail}   label="Email"       value={<a className="hover:text-white" href="mailto:mjscyber1@gmail.com">mjscyber1@gmail.com</a>} />
            <div className="md:col-span-2 flex items-end justify-end">
              <a href="https://wa.me/27824268567" target="_blank" rel="noopener noreferrer"
                 className="btn-accent" data-testid="about-whatsapp-btn">
                <CheckCircle2 className="w-4 h-4" /> Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ title, text }) {
  return (
    <div className="card p-6 hover:border-[rgb(var(--accent))]/40 transition-all">
      <Shield className="w-6 h-6 text-[rgb(var(--accent))] mb-3" />
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      <p className="muted text-sm mt-2">{text}</p>
    </div>
  );
}

function ContactLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-none">
        <Icon className="w-4 h-4 text-zinc-300" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider muted">{label}</div>
        <div className="text-white font-semibold mt-0.5">{value}</div>
      </div>
    </div>
  );
}
