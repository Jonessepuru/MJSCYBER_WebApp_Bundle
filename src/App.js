import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Courses from "@/pages/Courses";
import Verify from "@/pages/Verify";
import StudentDashboard from "@/pages/StudentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1" data-testid="app-main">
            <Routes>
              <Route path="/"              element={<Landing />} />
              <Route path="/about"         element={<About />} />
              <Route path="/login"         element={<Login />} />
              <Route path="/register"      element={<Register />} />
              <Route path="/courses"       element={<Courses />} />
              <Route path="/verify"        element={<Verify />} />
              <Route path="/verify/:serial" element={<Verify />} />
              <Route path="/dashboard"     element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/admin"         element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="*"              element={<Landing />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppFab />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
