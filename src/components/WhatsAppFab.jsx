import React from "react";
import { MessageCircle } from "lucide-react";

const PHONE_INTL = "27824268567"; // +27 82 426 8567

export default function WhatsAppFab() {
  const msg = encodeURIComponent("Hi MJSCYBER, I'd like more information about your security services.");
  const href = `https://wa.me/${PHONE_INTL}?text=${msg}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      data-testid="whatsapp-fab"
      aria-label="Chat with MJSCYBER on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-70 blur-xl pulse-dot" />
      <span className="relative flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-[#25D366] text-white font-semibold shadow-2xl shadow-emerald-900/40 hover:scale-105 transition-transform">
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline text-sm">Chat on WhatsApp</span>
      </span>
    </a>
  );
}
