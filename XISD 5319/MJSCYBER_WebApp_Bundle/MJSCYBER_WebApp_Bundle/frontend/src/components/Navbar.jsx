import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-home-logo">
          <div className="relative">
            <Shield className="w-7 h-7 text-[rgb(var(--accent))] group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
          </div>
          <div className="leading-none">
            <div className="font-black text-white text-lg tracking-tight">MJSCYBER</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 -mt-0.5">Security School</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/courses"  className="nav-link" data-testid="nav-courses">Courses</NavLink>
          <NavLink to="/about"    className="nav-link" data-testid="nav-about">About</NavLink>
          <NavLink to="/verify"   className="nav-link" data-testid="nav-verify">Verify Certificate</NavLink>
          {user && user.role === "student" && (
            <NavLink to="/dashboard" className="nav-link" data-testid="nav-dashboard">My Dashboard</NavLink>
          )}
          {user && user.role === "admin" && (
            <NavLink to="/admin" className="nav-link" data-testid="nav-admin">Admin</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <User className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-200" data-testid="nav-user-name">{user.name}</span>
                <span className={`badge ${user.role === "admin" ? "badge-red" : "badge-blue"}`}>{user.role}</span>
              </div>
              <button onClick={onLogout} className="btn-ghost" data-testid="nav-logout-btn">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost"   data-testid="nav-login-btn">Login</Link>
              <Link to="/register" className="btn-accent"  data-testid="nav-register-btn">Enrol Now</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
