import React from "react";
import { Shield, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-6 h-6 text-[rgb(var(--accent))]" />
            <span className="font-black text-white">MJSCYBER</span>
          </div>
          <p className="text-sm muted">Private Security Training &amp; Specialised Protection Services. CIPC 2022/201980/07 · Est. 2022.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Services</h4>
          <ul className="space-y-2 text-sm muted">
            <li>VIP Protection</li>
            <li>PSIRA Grades A – E</li>
            <li>Armed Response</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm muted">
            <li>About MJSCYBER</li>
            <li>PSiRA Compliance</li>
            <li>POPIA Privacy</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm muted">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-none" /> Bochum, Limpopo, SA</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 flex-none" /> <a href="tel:+27824268567" className="hover:text-white" data-testid="footer-phone">082 426 8567</a></li>
            <li className="flex items-center gap-2"><Mail  className="w-4 h-4 flex-none" /> <a href="mailto:mjscyber1@gmail.com" className="hover:text-white" data-testid="footer-email">mjscyber1@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs muted">
        © {new Date().getFullYear()} MJSCYBER PTY LTD. All rights reserved.
      </div>
    </footer>
  );
}
