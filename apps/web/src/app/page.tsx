"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { MethodologySection } from "@/components/landing/MethodologySection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    api.auth
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]">
      <LandingNav user={user} onLogout={handleLogout} />
      <main className="flex-1">
        <HeroSection user={user} />
        <FeatureGrid />
        <MethodologySection />
        <FaqSection />
        <CtaSection user={user} />
      </main>
      <LandingFooter />
    </div>
  );
}
